// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title IntentManager
 * @notice Intent lifecycle management for the Aqua protocol
 * @dev An intent is a declarative promise:
 *      "I am willing to trade X for ≥Y before time T."
 * 
 * Intent Lifecycle:
 * CREATED → FULFILLED → SETTLED
 *      ↘ CANCELLED
 * 
 * Only the trader can cancel.
 * 
 * Invariants:
 * - Trader funds locked exactly once
 * - Intent can settle at most once
 * - Expired intents are unfillable
 * 
 * LP Commitment Model:
 * - Optional
 * - Non-custodial
 * - Economically incentivized
 * - No slashing. No forced execution.
 */
contract IntentManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Intent states
    enum IntentState {
        CREATED,    // Intent created, waiting for fulfillment
        FULFILLED,  // LP committed to fulfill
        SETTLED,    // Trade executed successfully
        CANCELLED,  // Trader cancelled
        EXPIRED     // Intent expired unfilled
    }

    /// @notice Intent data structure
    struct Intent {
        bytes32 intentHash;
        address trader;
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 minAmountOut;
        address recipient;
        uint256 deadline;
        uint256 nonce;
        IntentState state;
        address fulfiller;
        uint256 fulfilledAmount;
    }

    /// @notice Intent creation parameters
    struct IntentParams {
        address tokenIn;
        uint256 amountIn;
        address tokenOut;
        uint256 minAmountOut;
        address recipient;
        uint256 deadline;
    }

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Intent storage by hash
    mapping(bytes32 intentHash => Intent) public intents;

    /// @notice Trader nonces for intent uniqueness
    mapping(address trader => uint256) public nonces;

    /// @notice Intent hashes by trader
    mapping(address trader => bytes32[]) public traderIntents;

    /// @notice Registered fillers
    mapping(address filler => bool) public registeredFillers;

    /// @notice Owner
    address public owner;

    /// @notice Protocol fee in basis points
    uint256 public protocolFeeBps;

    /// @notice Fee recipient
    address public feeRecipient;

    /// @notice Maximum protocol fee (1%)
    uint256 public constant MAX_FEE_BPS = 100;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event IntentCreated(
        bytes32 indexed intentHash,
        address indexed trader,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 minAmountOut,
        uint256 deadline
    );

    event IntentFulfilled(
        bytes32 indexed intentHash,
        address indexed fulfiller,
        uint256 amountOut
    );

    event IntentSettled(
        bytes32 indexed intentHash,
        address indexed trader,
        address indexed fulfiller,
        uint256 amountIn,
        uint256 amountOut
    );

    event IntentCancelled(
        bytes32 indexed intentHash,
        address indexed trader
    );

    event FillerRegistered(address indexed filler, bool registered);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error Unauthorized();
    error IntentNotFound();
    error IntentExpired();
    error IntentNotCreated();
    error IntentAlreadyFulfilled();
    error IntentNotFulfilled();
    error IntentAlreadySettled();
    error InsufficientOutput();
    error InvalidDeadline();
    error ZeroAmount();
    error ZeroAddress();
    error NotIntentTrader();
    error FillerNotRegistered();
    error InvalidFee();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyFiller() {
        if (!registeredFillers[msg.sender]) revert FillerNotRegistered();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setFiller(address filler, bool registered) external onlyOwner {
        if (filler == address(0)) revert ZeroAddress();
        registeredFillers[filler] = registered;
        emit FillerRegistered(filler, registered);
    }

    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        protocolFeeBps = newFeeBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        feeRecipient = newRecipient;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    /*//////////////////////////////////////////////////////////////
                        INTENT CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new intent
     * @dev Locks trader funds immediately
     * @param params Intent parameters
     * @return intentHash The unique intent identifier
     */
    function createIntent(IntentParams calldata params) 
        external 
        nonReentrant 
        returns (bytes32 intentHash) 
    {
        // Validate
        if (params.amountIn == 0 || params.minAmountOut == 0) revert ZeroAmount();
        if (params.tokenIn == address(0) || params.tokenOut == address(0)) revert ZeroAddress();
        if (params.deadline <= block.timestamp) revert InvalidDeadline();

        // Get nonce
        uint256 nonce = nonces[msg.sender]++;

        // Compute intent hash
        intentHash = keccak256(abi.encodePacked(
            msg.sender,
            params.tokenIn,
            params.amountIn,
            params.tokenOut,
            params.minAmountOut,
            params.deadline,
            nonce,
            block.chainid
        ));

        // Lock trader funds (Invariant: Trader funds locked exactly once)
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);

        // Create intent
        address recipient = params.recipient == address(0) ? msg.sender : params.recipient;
        
        intents[intentHash] = Intent({
            intentHash: intentHash,
            trader: msg.sender,
            tokenIn: params.tokenIn,
            amountIn: params.amountIn,
            tokenOut: params.tokenOut,
            minAmountOut: params.minAmountOut,
            recipient: recipient,
            deadline: params.deadline,
            nonce: nonce,
            state: IntentState.CREATED,
            fulfiller: address(0),
            fulfilledAmount: 0
        });

        traderIntents[msg.sender].push(intentHash);

        emit IntentCreated(
            intentHash,
            msg.sender,
            params.tokenIn,
            params.amountIn,
            params.tokenOut,
            params.minAmountOut,
            params.deadline
        );
    }

    /*//////////////////////////////////////////////////////////////
                        INTENT FULFILLMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fulfill an intent by committing to provide output tokens
     * @dev LP commits to swap (optional, non-custodial)
     * @param intentHash The intent to fulfill
     * @param amountOut Amount of output tokens to provide
     */
    function fulfillIntent(bytes32 intentHash, uint256 amountOut) 
        external 
        nonReentrant 
        onlyFiller 
    {
        Intent storage intent = intents[intentHash];
        
        if (intent.intentHash == bytes32(0)) revert IntentNotFound();
        if (intent.state != IntentState.CREATED) revert IntentNotCreated();
        if (block.timestamp > intent.deadline) revert IntentExpired();
        if (amountOut < intent.minAmountOut) revert InsufficientOutput();

        intent.state = IntentState.FULFILLED;
        intent.fulfiller = msg.sender;
        intent.fulfilledAmount = amountOut;

        emit IntentFulfilled(intentHash, msg.sender, amountOut);
    }

    /**
     * @notice Settle a fulfilled intent
     * @dev Executes the actual token swap
     * @param intentHash The intent to settle
     */
    function settleIntent(bytes32 intentHash) external nonReentrant {
        Intent storage intent = intents[intentHash];
        
        if (intent.intentHash == bytes32(0)) revert IntentNotFound();
        if (intent.state != IntentState.FULFILLED) revert IntentNotFulfilled();
        if (block.timestamp > intent.deadline) revert IntentExpired();

        // Only fulfiller can settle
        if (msg.sender != intent.fulfiller) revert Unauthorized();

        // Invariant: Intent can settle at most once
        intent.state = IntentState.SETTLED;

        // Transfer output tokens from fulfiller to recipient
        IERC20(intent.tokenOut).safeTransferFrom(
            msg.sender, 
            intent.recipient, 
            intent.fulfilledAmount
        );

        // Calculate fee
        uint256 fee = intent.amountIn * protocolFeeBps / 10000;
        uint256 amountToFulfiller = intent.amountIn - fee;

        // Transfer input tokens to fulfiller
        IERC20(intent.tokenIn).safeTransfer(msg.sender, amountToFulfiller);

        // Transfer fee
        if (fee > 0) {
            IERC20(intent.tokenIn).safeTransfer(feeRecipient, fee);
        }

        emit IntentSettled(
            intentHash,
            intent.trader,
            intent.fulfiller,
            intent.amountIn,
            intent.fulfilledAmount
        );
    }

    /*//////////////////////////////////////////////////////////////
                        INTENT CANCELLATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Cancel an intent (trader only)
     * @dev Returns locked funds to trader
     * @param intentHash The intent to cancel
     */
    function cancelIntent(bytes32 intentHash) external nonReentrant {
        Intent storage intent = intents[intentHash];
        
        if (intent.intentHash == bytes32(0)) revert IntentNotFound();
        if (intent.trader != msg.sender) revert NotIntentTrader();
        if (intent.state != IntentState.CREATED) revert IntentNotCreated();

        intent.state = IntentState.CANCELLED;

        // Return locked funds
        IERC20(intent.tokenIn).safeTransfer(msg.sender, intent.amountIn);

        emit IntentCancelled(intentHash, msg.sender);
    }

    /**
     * @notice Claim expired unfulfilled intents
     * @dev Anyone can trigger, but funds go to trader
     * @param intentHash The intent to expire
     */
    function expireIntent(bytes32 intentHash) external nonReentrant {
        Intent storage intent = intents[intentHash];
        
        if (intent.intentHash == bytes32(0)) revert IntentNotFound();
        if (block.timestamp <= intent.deadline) revert IntentNotFound();
        if (intent.state != IntentState.CREATED && intent.state != IntentState.FULFILLED) {
            revert IntentNotCreated();
        }

        intent.state = IntentState.EXPIRED;

        // Return locked funds to trader
        IERC20(intent.tokenIn).safeTransfer(intent.trader, intent.amountIn);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getIntent(bytes32 intentHash) external view returns (Intent memory) {
        return intents[intentHash];
    }

    function getIntentState(bytes32 intentHash) external view returns (IntentState) {
        return intents[intentHash].state;
    }

    function getTraderIntents(address trader) external view returns (bytes32[] memory) {
        return traderIntents[trader];
    }

    function isIntentFillable(bytes32 intentHash) external view returns (bool) {
        Intent storage intent = intents[intentHash];
        return intent.state == IntentState.CREATED && block.timestamp <= intent.deadline;
    }

    function isIntentSettleable(bytes32 intentHash) external view returns (bool) {
        Intent storage intent = intents[intentHash];
        return intent.state == IntentState.FULFILLED && block.timestamp <= intent.deadline;
    }

    function getTraderNonce(address trader) external view returns (uint256) {
        return nonces[trader];
    }
}
