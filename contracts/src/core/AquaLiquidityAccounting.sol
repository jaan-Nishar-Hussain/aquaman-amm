// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAqua} from "../interfaces/IAqua.sol";
import {VirtualBalance} from "./VirtualBalance.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AquaLiquidityAccounting
 * @notice Core accounting contract for the Aqua protocol
 * @dev Implements the financial safety core of the system
 * 
 * This module answers exactly one question:
 * "How much liquidity is a strategy allowed to spend right now?"
 * 
 * It does NOT:
 * - Price assets
 * - Execute swaps
 * - Bridge tokens
 * 
 * INVARIANTS:
 * A1 - No Double Spend: Σ(pull(token)) ≤ initialVirtualBalance(token) + Σ(push(token))
 * A2 - Strategy Immutability: Once strategyHash is created, parameters never change
 */
contract AquaLiquidityAccounting is IAqua, ReentrancyGuard, Ownable {
    using VirtualBalance for VirtualBalance.Balance;
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Nested mapping for virtual balances
    /// @dev _balances[maker][app][strategyHash][token] → Balance
    mapping(address maker => 
        mapping(address app => 
            mapping(bytes32 strategyHash => 
                mapping(address token => VirtualBalance.Balance)
            )
        )
    ) private _balances;

    /// @notice Strategy storage for immutability verification
    mapping(bytes32 strategyHash => Strategy) private _strategies;

    /// @notice Registered strategy hashes per maker
    mapping(address maker => mapping(bytes32 strategyHash => bool)) private _registeredStrategies;

    /// @notice Registered delegate applications
    mapping(address app => bool) private _registeredApps;

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error UnauthorizedApp();
    error StrategyAlreadyExists();
    error StrategyNotFound();
    error InvalidStrategy();
    error ExpiredStrategy();
    error ZeroAddress();
    error ZeroAmount();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() Ownable(msg.sender) {}

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Register or deregister an application as delegate
     * @param app The application address
     * @param active Whether the app should be active
     */
    function setAppRegistration(address app, bool active) external onlyOwner {
        if (app == address(0)) revert ZeroAddress();
        _registeredApps[app] = active;
        emit AppRegistered(app, active);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IAqua
    function getBalance(
        address maker,
        address app,
        bytes32 strategyHash,
        address token
    ) external view returns (Balance memory) {
        VirtualBalance.Balance storage bal = _balances[maker][app][strategyHash][token];
        return Balance({
            amount: bal.amount,
            tokensCount: bal.tokensCount
        });
    }

    /// @inheritdoc IAqua
    function isStrategyActive(address maker, bytes32 strategyHash) external view returns (bool) {
        return _registeredStrategies[maker][strategyHash];
    }

    /// @inheritdoc IAqua
    function computeStrategyHash(Strategy calldata strategy) external pure returns (bytes32) {
        return _computeStrategyHash(strategy);
    }

    /**
     * @notice Get strategy details by hash
     * @param strategyHash The strategy hash
     * @return The strategy struct
     */
    function getStrategy(bytes32 strategyHash) external view returns (Strategy memory) {
        return _strategies[strategyHash];
    }

    /**
     * @notice Check if an app is registered
     * @param app The app address to check
     * @return True if app is registered
     */
    function isAppRegistered(address app) external view returns (bool) {
        return _registeredApps[app];
    }

    /*//////////////////////////////////////////////////////////////
                          STRATEGY MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IAqua
    function registerStrategy(Strategy calldata strategy) external returns (bytes32 strategyHash) {
        // Validate strategy
        if (strategy.maker != msg.sender) revert InvalidStrategy();
        if (strategy.tokenIn == address(0) || strategy.tokenOut == address(0)) revert ZeroAddress();
        if (strategy.amountIn == 0 || strategy.amountOut == 0) revert ZeroAmount();
        if (strategy.expiry != 0 && strategy.expiry < block.timestamp) revert ExpiredStrategy();

        // Compute strategy hash (immutable identity)
        strategyHash = _computeStrategyHash(strategy);

        // Check uniqueness (Invariant A2)
        if (_registeredStrategies[msg.sender][strategyHash]) revert StrategyAlreadyExists();

        // Store strategy (immutable after this point)
        _strategies[strategyHash] = strategy;
        _registeredStrategies[msg.sender][strategyHash] = true;

        // Initialize virtual balances for all registered apps
        // The maker can now deposit funds to back this strategy

        emit StrategyRegistered(msg.sender, strategyHash, strategy);
    }

    /**
     * @notice Deposit tokens to back a strategy's virtual balance
     * @param app The app to authorize
     * @param strategyHash The strategy to fund
     * @param token The token to deposit
     * @param amount The amount to deposit
     */
    function deposit(
        address app,
        bytes32 strategyHash,
        address token,
        uint256 amount
    ) external nonReentrant {
        if (!_registeredApps[app]) revert UnauthorizedApp();
        if (!_registeredStrategies[msg.sender][strategyHash]) revert StrategyNotFound();
        if (amount == 0) revert ZeroAmount();

        // Transfer tokens from maker to this contract (backing the virtual balance)
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Increase virtual balance
        VirtualBalance.Balance storage bal = _balances[msg.sender][app][strategyHash][token];
        if (bal.tokensCount == 0) {
            // First deposit, initialize
            bal.initialize(amount, 1);
        } else {
            bal.increase(amount);
        }
    }

    /*//////////////////////////////////////////////////////////////
                          CORE OPERATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @inheritdoc IAqua
     * @dev Pre-conditions:
     *      - Caller is registered app
     *      - Strategy active
     *      - Balance sufficient
     * 
     *      Effects:
     *      1. Decrease virtual balance
     *      2. Execute transfer to recipient
     * 
     *      Failure → full revert
     */
    function pull(
        address maker,
        bytes32 strategyHash,
        address token,
        uint256 amount,
        address recipient
    ) external nonReentrant {
        // Pre-condition: Caller is registered app
        if (!_registeredApps[msg.sender]) revert UnauthorizedApp();

        // Pre-condition: Strategy exists
        if (!_registeredStrategies[maker][strategyHash]) revert StrategyNotFound();

        // Check expiry
        Strategy storage strategy = _strategies[strategyHash];
        if (strategy.expiry != 0 && strategy.expiry < block.timestamp) revert ExpiredStrategy();

        // Get virtual balance
        VirtualBalance.Balance storage bal = _balances[maker][msg.sender][strategyHash][token];

        // Effect 1: Decrease virtual balance (validates sufficiency)
        bal.decrease(amount);

        // Effect 2: Transfer tokens to recipient
        IERC20(token).safeTransfer(recipient, amount);

        emit Pull(maker, msg.sender, strategyHash, token, amount, recipient);
    }

    /**
     * @inheritdoc IAqua
     * @dev Used to reconcile token inflow after swap execution
     * 
     *      Critical Property:
     *      - push does NOT imply profit
     *      - it restores accounting symmetry
     */
    function push(
        address maker,
        bytes32 strategyHash,
        address token,
        uint256 amount
    ) external nonReentrant {
        // Caller must be registered app
        if (!_registeredApps[msg.sender]) revert UnauthorizedApp();

        // Strategy must exist
        if (!_registeredStrategies[maker][strategyHash]) revert StrategyNotFound();

        // Transfer tokens from caller to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Increase virtual balance (restore accounting symmetry)
        VirtualBalance.Balance storage bal = _balances[maker][msg.sender][strategyHash][token];
        bal.increase(amount);

        emit Push(maker, msg.sender, strategyHash, token, amount);
    }

    /**
     * @notice Withdraw tokens from a strategy (maker only)
     * @param app The app context
     * @param strategyHash The strategy to withdraw from
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function withdraw(
        address app,
        bytes32 strategyHash,
        address token,
        uint256 amount
    ) external nonReentrant {
        if (!_registeredStrategies[msg.sender][strategyHash]) revert StrategyNotFound();

        VirtualBalance.Balance storage bal = _balances[msg.sender][app][strategyHash][token];
        bal.decrease(amount);

        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _computeStrategyHash(Strategy memory strategy) internal pure returns (bytes32) {
        return keccak256(abi.encode(strategy));
    }
}
