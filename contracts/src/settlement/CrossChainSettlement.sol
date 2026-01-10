// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EscrowVault} from "./EscrowVault.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrossChainSettlement
 * @notice State machine for cross-chain atomic swaps
 * @dev Solves distributed atomic execution without shared state
 * 
 * State Machine:
 * PENDING → PARTIAL → EXECUTED
 *        ↘ REFUNDED
 * 
 * Atomicity condition:
 * (tokenInArrived AND tokenOutArrived) ⇒ executeSwap
 * ELSE ⇒ refundAll
 * 
 * There is no third state.
 * 
 * Failure Recovery:
 * - One token arrives → Wait
 * - Timeout → Refund
 * - Swap revert → Refund
 * 
 * Funds safety > liveness
 */
contract CrossChainSettlement is ReentrancyGuard {

    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Settlement states
    enum SettlementState {
        PENDING,    // Created, waiting for tokens
        PARTIAL,    // One side arrived, waiting for other
        EXECUTED,   // Both sides arrived, swap executed
        REFUNDED    // Timeout or failure, tokens refunded
    }

    /// @notice Settlement record
    struct Settlement {
        bytes32 settlementHash;
        address initiator;
        
        // Source chain details
        uint256 sourceChainId;
        address sourceToken;
        uint256 sourceAmount;
        bool sourceArrived;
        
        // Destination chain details
        uint256 destChainId;
        address destToken;
        uint256 destAmount;
        bool destArrived;
        
        // Recipients
        address sourceRecipient;
        address destRecipient;
        
        // Timing
        uint256 createdAt;
        uint256 expiry;
        
        // State
        SettlementState state;
    }

    /// @notice Create settlement params
    struct CreateParams {
        uint256 sourceChainId;
        address sourceToken;
        uint256 sourceAmount;
        uint256 destChainId;
        address destToken;
        uint256 destAmount;
        address sourceRecipient;
        address destRecipient;
        uint256 timeout;
    }

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice The escrow vault
    EscrowVault public immutable escrowVault;

    /// @notice Settlement counter
    uint256 public settlementCount;

    /// @notice Settlement storage by hash
    mapping(bytes32 => Settlement) public settlements;

    /// @notice Authorized relayers for cross-chain messages
    mapping(address => bool) public relayers;

    /// @notice Owner
    address public owner;

    /// @notice Current chain ID
    uint256 public immutable chainId;

    /// @notice Default timeout
    uint256 public constant DEFAULT_TIMEOUT = 24 hours;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event SettlementCreated(
        bytes32 indexed settlementHash,
        address indexed initiator,
        uint256 sourceChainId,
        uint256 destChainId,
        uint256 expiry
    );

    event TokenArrived(
        bytes32 indexed settlementHash,
        uint256 chainId,
        address token,
        uint256 amount,
        bool isSource
    );

    event SettlementExecuted(
        bytes32 indexed settlementHash,
        uint256 timestamp
    );

    event SettlementRefunded(
        bytes32 indexed settlementHash,
        string reason
    );

    event StateTransition(
        bytes32 indexed settlementHash,
        SettlementState oldState,
        SettlementState newState
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error InvalidSettlement();
    error SettlementNotFound();
    error SettlementExpired();
    error SettlementNotPending();
    error TokenAlreadyArrived();
    error WrongChain();
    error ZeroAddress();
    error ZeroAmount();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _escrowVault) {
        escrowVault = EscrowVault(_escrowVault);
        owner = msg.sender;
        chainId = block.chainid;
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRelayer() {
        if (!relayers[msg.sender]) revert Unauthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setRelayer(address relayer, bool authorized) external onlyOwner {
        relayers[relayer] = authorized;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    /*//////////////////////////////////////////////////////////////
                      SETTLEMENT CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new cross-chain settlement
     * @param params Settlement parameters
     * @return settlementHash The unique settlement identifier
     */
    function createSettlement(CreateParams calldata params) 
        external 
        nonReentrant 
        returns (bytes32 settlementHash) 
    {
        // Validate
        if (params.sourceAmount == 0 || params.destAmount == 0) revert ZeroAmount();
        if (params.sourceRecipient == address(0) || params.destRecipient == address(0)) {
            revert ZeroAddress();
        }

        // Generate unique hash
        settlementHash = keccak256(abi.encodePacked(
            msg.sender,
            params.sourceChainId,
            params.sourceToken,
            params.sourceAmount,
            params.destChainId,
            params.destToken,
            params.destAmount,
            block.timestamp,
            settlementCount++
        ));

        // Calculate expiry
        uint256 expiry = block.timestamp + (params.timeout > 0 ? params.timeout : DEFAULT_TIMEOUT);

        // Create settlement
        settlements[settlementHash] = Settlement({
            settlementHash: settlementHash,
            initiator: msg.sender,
            sourceChainId: params.sourceChainId,
            sourceToken: params.sourceToken,
            sourceAmount: params.sourceAmount,
            sourceArrived: false,
            destChainId: params.destChainId,
            destToken: params.destToken,
            destAmount: params.destAmount,
            destArrived: false,
            sourceRecipient: params.sourceRecipient,
            destRecipient: params.destRecipient,
            createdAt: block.timestamp,
            expiry: expiry,
            state: SettlementState.PENDING
        });

        emit SettlementCreated(
            settlementHash,
            msg.sender,
            params.sourceChainId,
            params.destChainId,
            expiry
        );
    }

    /*//////////////////////////////////////////////////////////////
                      TOKEN ARRIVAL HANDLING
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mark tokens as arrived from source chain
     * @dev Called by relayer after verifying cross-chain message
     * @param settlementHash The settlement identifier
     * @param escrowId The escrow ID on this chain
     */
    function confirmSourceArrival(
        bytes32 settlementHash,
        uint256 escrowId
    ) external onlyRelayer nonReentrant {
        Settlement storage settlement = settlements[settlementHash];
        
        _validateSettlement(settlement);
        if (settlement.sourceArrived) revert TokenAlreadyArrived();
        
        settlement.sourceArrived = true;
        
        emit TokenArrived(
            settlementHash,
            settlement.sourceChainId,
            settlement.sourceToken,
            settlement.sourceAmount,
            true
        );

        _checkAndExecute(settlementHash, settlement);
    }

    /**
     * @notice Mark tokens as arrived from destination chain
     * @dev Called by relayer after verifying cross-chain message
     * @param settlementHash The settlement identifier
     * @param escrowId The escrow ID on this chain
     */
    function confirmDestArrival(
        bytes32 settlementHash,
        uint256 escrowId
    ) external onlyRelayer nonReentrant {
        Settlement storage settlement = settlements[settlementHash];
        
        _validateSettlement(settlement);
        if (settlement.destArrived) revert TokenAlreadyArrived();
        
        settlement.destArrived = true;
        
        emit TokenArrived(
            settlementHash,
            settlement.destChainId,
            settlement.destToken,
            settlement.destAmount,
            false
        );

        _checkAndExecute(settlementHash, settlement);
    }

    /*//////////////////////////////////////////////////////////////
                      EXECUTION & REFUND
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Force refund an expired settlement
     * @param settlementHash The settlement to refund
     */
    function refundExpired(bytes32 settlementHash) external nonReentrant {
        Settlement storage settlement = settlements[settlementHash];
        
        if (settlement.settlementHash == bytes32(0)) revert SettlementNotFound();
        if (settlement.state != SettlementState.PENDING && 
            settlement.state != SettlementState.PARTIAL) {
            revert SettlementNotPending();
        }
        if (block.timestamp <= settlement.expiry) revert SettlementExpired();

        SettlementState oldState = settlement.state;
        settlement.state = SettlementState.REFUNDED;

        // Trigger refund on escrow vault
        escrowVault.refundSettlement(settlementHash);

        emit StateTransition(settlementHash, oldState, SettlementState.REFUNDED);
        emit SettlementRefunded(settlementHash, "Timeout");
    }

    /*//////////////////////////////////////////////////////////////
                      INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _validateSettlement(Settlement storage settlement) internal view {
        if (settlement.settlementHash == bytes32(0)) revert SettlementNotFound();
        if (block.timestamp > settlement.expiry) revert SettlementExpired();
        if (settlement.state != SettlementState.PENDING && 
            settlement.state != SettlementState.PARTIAL) {
            revert SettlementNotPending();
        }
    }

    /**
     * @notice Check if both tokens arrived and execute if so
     * @dev Atomicity: (tokenInArrived AND tokenOutArrived) ⇒ executeSwap
     */
    function _checkAndExecute(
        bytes32 settlementHash,
        Settlement storage settlement
    ) internal {
        SettlementState oldState = settlement.state;

        if (settlement.sourceArrived && settlement.destArrived) {
            // Both arrived - EXECUTE
            settlement.state = SettlementState.EXECUTED;
            
            // Release escrows to recipients
            escrowVault.releaseSettlement(settlementHash);
            
            emit StateTransition(settlementHash, oldState, SettlementState.EXECUTED);
            emit SettlementExecuted(settlementHash, block.timestamp);
        } else if (settlement.sourceArrived || settlement.destArrived) {
            // One arrived - transition to PARTIAL
            if (oldState == SettlementState.PENDING) {
                settlement.state = SettlementState.PARTIAL;
                emit StateTransition(settlementHash, oldState, SettlementState.PARTIAL);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getSettlement(bytes32 settlementHash) external view returns (Settlement memory) {
        return settlements[settlementHash];
    }

    function getSettlementState(bytes32 settlementHash) external view returns (SettlementState) {
        return settlements[settlementHash].state;
    }

    function isSettlementComplete(bytes32 settlementHash) external view returns (bool) {
        SettlementState state = settlements[settlementHash].state;
        return state == SettlementState.EXECUTED || state == SettlementState.REFUNDED;
    }
}
