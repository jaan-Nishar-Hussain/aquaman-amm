// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowVault
 * @notice Temporary token escrow for cross-chain settlements
 * @dev Tokens are escrowed temporarily, never pooled
 * 
 * Key properties:
 * - Non-pooled, per-swap escrow
 * - Automatic release on execution
 * - Refund on timeout/failure
 * 
 * Funds safety > liveness
 */
contract EscrowVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Escrow states
    enum EscrowState {
        EMPTY,      // No funds deposited
        PENDING,    // Funds escrowed, waiting for settlement
        RELEASED,   // Funds released to recipient
        REFUNDED    // Funds refunded to depositor
    }

    /// @notice Escrow record
    struct Escrow {
        address depositor;
        address token;
        uint256 amount;
        address recipient;
        uint256 expiry;
        bytes32 settlementHash;
        EscrowState state;
    }

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Escrow ID counter
    uint256 public escrowCount;

    /// @notice Escrow storage
    mapping(uint256 escrowId => Escrow) public escrows;

    /// @notice Settlement hash to escrow ID mapping
    mapping(bytes32 settlementHash => uint256[]) public settlementEscrows;

    /// @notice Authorized relayers
    mapping(address relayer => bool) public authorizedRelayers;

    /// @notice Owner
    address public owner;

    /// @notice Default timeout (24 hours)
    uint256 public constant DEFAULT_TIMEOUT = 24 hours;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed depositor,
        address token,
        uint256 amount,
        bytes32 settlementHash,
        uint256 expiry
    );

    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed recipient,
        uint256 amount
    );

    event EscrowRefunded(
        uint256 indexed escrowId,
        address indexed depositor,
        uint256 amount
    );

    event RelayerUpdated(address indexed relayer, bool authorized);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error InvalidEscrow();
    error EscrowNotPending();
    error EscrowNotExpired();
    error EscrowExpired();
    error ZeroAmount();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRelayer() {
        if (!authorizedRelayers[msg.sender]) revert Unauthorized();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setRelayer(address relayer, bool authorized) external onlyOwner {
        if (relayer == address(0)) revert ZeroAddress();
        authorizedRelayers[relayer] = authorized;
        emit RelayerUpdated(relayer, authorized);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    /*//////////////////////////////////////////////////////////////
                          ESCROW OPERATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new escrow
     * @param token Token to escrow
     * @param amount Amount to escrow
     * @param recipient Intended recipient
     * @param settlementHash Hash linking to cross-chain settlement
     * @param timeout Custom timeout (0 for default)
     * @return escrowId The created escrow ID
     */
    function createEscrow(
        address token,
        uint256 amount,
        address recipient,
        bytes32 settlementHash,
        uint256 timeout
    ) external nonReentrant returns (uint256 escrowId) {
        if (amount == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroAddress();

        // Transfer tokens to escrow
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Create escrow record
        escrowId = ++escrowCount;
        uint256 expiry = block.timestamp + (timeout > 0 ? timeout : DEFAULT_TIMEOUT);

        escrows[escrowId] = Escrow({
            depositor: msg.sender,
            token: token,
            amount: amount,
            recipient: recipient,
            expiry: expiry,
            settlementHash: settlementHash,
            state: EscrowState.PENDING
        });

        // Link to settlement
        settlementEscrows[settlementHash].push(escrowId);

        emit EscrowCreated(escrowId, msg.sender, token, amount, settlementHash, expiry);
    }

    /**
     * @notice Release escrow to recipient (called by relayer on successful settlement)
     * @param escrowId The escrow to release
     */
    function release(uint256 escrowId) external nonReentrant onlyRelayer {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.state != EscrowState.PENDING) revert EscrowNotPending();
        if (block.timestamp > escrow.expiry) revert EscrowExpired();

        escrow.state = EscrowState.RELEASED;

        IERC20(escrow.token).safeTransfer(escrow.recipient, escrow.amount);

        emit EscrowReleased(escrowId, escrow.recipient, escrow.amount);
    }

    /**
     * @notice Refund escrow to depositor (on timeout or failure)
     * @param escrowId The escrow to refund
     */
    function refund(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.state != EscrowState.PENDING) revert EscrowNotPending();

        // Only depositor can refund before expiry
        // Anyone can refund after expiry
        if (block.timestamp <= escrow.expiry) {
            if (msg.sender != escrow.depositor && !authorizedRelayers[msg.sender]) {
                revert Unauthorized();
            }
        }

        escrow.state = EscrowState.REFUNDED;

        IERC20(escrow.token).safeTransfer(escrow.depositor, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.depositor, escrow.amount);
    }

    /**
     * @notice Batch release multiple escrows for a settlement
     * @param settlementHash The settlement hash
     */
    function releaseSettlement(bytes32 settlementHash) external nonReentrant onlyRelayer {
        uint256[] storage escrowIds = settlementEscrows[settlementHash];
        
        for (uint256 i = 0; i < escrowIds.length; i++) {
            uint256 escrowId = escrowIds[i];
            Escrow storage escrow = escrows[escrowId];
            
            if (escrow.state == EscrowState.PENDING && block.timestamp <= escrow.expiry) {
                escrow.state = EscrowState.RELEASED;
                IERC20(escrow.token).safeTransfer(escrow.recipient, escrow.amount);
                emit EscrowReleased(escrowId, escrow.recipient, escrow.amount);
            }
        }
    }

    /**
     * @notice Batch refund multiple escrows for a failed settlement
     * @param settlementHash The settlement hash
     */
    function refundSettlement(bytes32 settlementHash) external nonReentrant onlyRelayer {
        uint256[] storage escrowIds = settlementEscrows[settlementHash];
        
        for (uint256 i = 0; i < escrowIds.length; i++) {
            uint256 escrowId = escrowIds[i];
            Escrow storage escrow = escrows[escrowId];
            
            if (escrow.state == EscrowState.PENDING) {
                escrow.state = EscrowState.REFUNDED;
                IERC20(escrow.token).safeTransfer(escrow.depositor, escrow.amount);
                emit EscrowRefunded(escrowId, escrow.depositor, escrow.amount);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getSettlementEscrows(bytes32 settlementHash) external view returns (uint256[] memory) {
        return settlementEscrows[settlementHash];
    }

    function isEscrowClaimable(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[escrowId];
        return escrow.state == EscrowState.PENDING && block.timestamp <= escrow.expiry;
    }

    function isEscrowRefundable(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[escrowId];
        return escrow.state == EscrowState.PENDING && block.timestamp > escrow.expiry;
    }
}
