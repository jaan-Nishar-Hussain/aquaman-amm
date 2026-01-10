// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAqua
 * @notice Core interface for the Aqua Liquidity Accounting Layer
 * @dev Implements the virtual balance model where spending allowances are tracked
 *      without actual custody of funds
 */
interface IAqua {
    /// @notice Represents a virtual balance with amount and token count
    struct Balance {
        uint248 amount;
        uint8 tokensCount;
    }

    /// @notice Strategy configuration for liquidity provision
    struct Strategy {
        address maker;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 priceLower;
        uint256 priceUpper;
        uint256 expiry;
        bytes32 salt;
    }

    /// @notice Emitted when tokens are pulled from a strategy
    event Pull(
        address indexed maker,
        address indexed app,
        bytes32 indexed strategyHash,
        address token,
        uint256 amount,
        address recipient
    );

    /// @notice Emitted when tokens are pushed to reconcile a strategy
    event Push(
        address indexed maker,
        address indexed app,
        bytes32 indexed strategyHash,
        address token,
        uint256 amount
    );

    /// @notice Emitted when a strategy is registered
    event StrategyRegistered(
        address indexed maker,
        bytes32 indexed strategyHash,
        Strategy strategy
    );

    /// @notice Emitted when an app is registered as delegate
    event AppRegistered(address indexed app, bool active);

    /**
     * @notice Get the virtual balance for a specific position
     * @param maker The liquidity provider address
     * @param app The registered application
     * @param strategyHash The unique strategy identifier
     * @param token The token address
     * @return The Balance struct containing amount and token count
     */
    function getBalance(
        address maker,
        address app,
        bytes32 strategyHash,
        address token
    ) external view returns (Balance memory);

    /**
     * @notice Pull tokens from a strategy's virtual balance
     * @dev Decreases virtual balance and executes transferFrom
     * @param maker The liquidity provider
     * @param strategyHash The strategy to pull from
     * @param token The token to pull
     * @param amount The amount to pull
     * @param recipient The address to receive tokens
     */
    function pull(
        address maker,
        bytes32 strategyHash,
        address token,
        uint256 amount,
        address recipient
    ) external;

    /**
     * @notice Push tokens to reconcile a strategy's balance
     * @dev Increases virtual balance to restore accounting symmetry
     * @param maker The liquidity provider
     * @param strategyHash The strategy to push to
     * @param token The token being pushed
     * @param amount The amount being pushed
     */
    function push(
        address maker,
        bytes32 strategyHash,
        address token,
        uint256 amount
    ) external;

    /**
     * @notice Register a new strategy
     * @param strategy The strategy configuration
     * @return strategyHash The computed strategy hash
     */
    function registerStrategy(Strategy calldata strategy) external returns (bytes32 strategyHash);

    /**
     * @notice Check if a strategy is active
     * @param maker The maker address
     * @param strategyHash The strategy hash to check
     * @return True if strategy is active
     */
    function isStrategyActive(address maker, bytes32 strategyHash) external view returns (bool);

    /**
     * @notice Compute strategy hash from parameters
     * @param strategy The strategy struct
     * @return The keccak256 hash of the strategy
     */
    function computeStrategyHash(Strategy calldata strategy) external pure returns (bytes32);
}
