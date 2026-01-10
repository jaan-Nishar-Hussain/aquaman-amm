// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAqua} from "../interfaces/IAqua.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StableswapAMM
 * @notice Hybrid invariant AMM for stablecoin swaps
 * @dev Implements the pricing model: out = w * constantSum + (1-w) * constantProduct
 *      where w = A / (A + 1)
 * 
 * This module is pure math + bounded execution:
 * - Decides how much tokenOut is owed
 * - Decides whether a swap is valid
 * 
 * It does NOT:
 * - Store liquidity (uses Aqua accounting)
 * - Bridge assets
 * - Track ownership
 * 
 * Execution pattern:
 * read balances → compute output → pull(tokenOut) → callback → push(tokenIn)
 */
contract StableswapAMM is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Pool configuration
    struct Pool {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 amplificationFactor; // A parameter for curve tuning
        uint256 fee; // Fee in basis points (1 = 0.01%)
        bool active;
    }

    /// @notice Swap callback data
    struct SwapCallbackData {
        address tokenIn;
        uint256 amountIn;
        address payer;
    }

    /*//////////////////////////////////////////////////////////////
                                STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice The Aqua accounting contract
    IAqua public immutable aqua;

    /// @notice Pool ID counter
    uint256 public poolCount;

    /// @notice Pool storage
    mapping(uint256 poolId => Pool) public pools;

    /// @notice Pool lookup by token pair
    mapping(address token0 => mapping(address token1 => uint256)) public poolIds;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event PoolCreated(
        uint256 indexed poolId,
        address indexed token0,
        address indexed token1,
        uint256 amplificationFactor,
        uint256 fee
    );

    event Swap(
        uint256 indexed poolId,
        address indexed sender,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event LiquidityAdded(
        uint256 indexed poolId,
        address indexed provider,
        uint256 amount0,
        uint256 amount1
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error InvalidPool();
    error PoolNotActive();
    error InsufficientOutput();
    error InsufficientLiquidity();
    error SlippageExceeded();
    error ZeroAmount();
    error InvalidAmplificationFactor();
    error InvalidFee();
    error CallbackFailed();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _aqua) {
        aqua = IAqua(_aqua);
    }

    /*//////////////////////////////////////////////////////////////
                            POOL MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new stable swap pool
     * @param token0 First token address
     * @param token1 Second token address  
     * @param amplificationFactor The A parameter (higher = flatter curve)
     * @param fee Fee in basis points
     * @return poolId The created pool ID
     */
    function createPool(
        address token0,
        address token1,
        uint256 amplificationFactor,
        uint256 fee
    ) external returns (uint256 poolId) {
        if (amplificationFactor == 0 || amplificationFactor > 1000) {
            revert InvalidAmplificationFactor();
        }
        if (fee > 100) revert InvalidFee(); // Max 1%

        // Ensure consistent ordering
        (address t0, address t1) = token0 < token1 ? (token0, token1) : (token1, token0);

        poolId = ++poolCount;
        
        pools[poolId] = Pool({
            token0: t0,
            token1: t1,
            reserve0: 0,
            reserve1: 0,
            amplificationFactor: amplificationFactor,
            fee: fee,
            active: true
        });

        poolIds[t0][t1] = poolId;

        emit PoolCreated(poolId, t0, t1, amplificationFactor, fee);
    }

    /**
     * @notice Add liquidity to a pool
     * @param poolId The pool to add to
     * @param amount0 Amount of token0
     * @param amount1 Amount of token1
     */
    function addLiquidity(
        uint256 poolId,
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant {
        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotActive();

        IERC20(pool.token0).safeTransferFrom(msg.sender, address(this), amount0);
        IERC20(pool.token1).safeTransferFrom(msg.sender, address(this), amount1);

        pool.reserve0 += amount0;
        pool.reserve1 += amount1;

        emit LiquidityAdded(poolId, msg.sender, amount0, amount1);
    }

    /*//////////////////////////////////////////////////////////////
                              SWAP LOGIC
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Execute a swap
     * @param poolId The pool to swap in
     * @param tokenIn Input token address
     * @param amountIn Input amount
     * @param minAmountOut Minimum output amount (slippage protection)
     * @param recipient Address to receive output tokens
     * @return amountOut The output amount
     */
    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient
    ) external nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();

        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotActive();

        // Determine swap direction
        bool isToken0In = tokenIn == pool.token0;
        if (!isToken0In && tokenIn != pool.token1) revert InvalidPool();

        address tokenOut = isToken0In ? pool.token1 : pool.token0;

        // Read balances
        uint256 reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;

        // Compute output using hybrid invariant
        amountOut = _computeAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            pool.amplificationFactor,
            pool.fee
        );

        if (amountOut < minAmountOut) revert SlippageExceeded();
        if (amountOut > reserveOut) revert InsufficientLiquidity();

        // Transfer input from sender
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Update reserves
        if (isToken0In) {
            pool.reserve0 += amountIn;
            pool.reserve1 -= amountOut;
        } else {
            pool.reserve1 += amountIn;
            pool.reserve0 -= amountOut;
        }

        // Transfer output to recipient
        IERC20(tokenOut).safeTransfer(recipient, amountOut);

        emit Swap(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @notice Get a quote for a swap
     * @param poolId The pool to quote
     * @param tokenIn Input token
     * @param amountIn Input amount
     * @return amountOut Expected output amount
     */
    function quote(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        if (!pool.active) revert PoolNotActive();

        bool isToken0In = tokenIn == pool.token0;
        if (!isToken0In && tokenIn != pool.token1) revert InvalidPool();

        uint256 reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
        uint256 reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;

        amountOut = _computeAmountOut(
            amountIn,
            reserveIn,
            reserveOut,
            pool.amplificationFactor,
            pool.fee
        );
    }

    /*//////////////////////////////////////////////////////////////
                          INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Compute output amount using hybrid invariant
     * @dev Pricing model: out = w * constantSum + (1-w) * constantProduct
     *      where w = A / (A + 1)
     * 
     *      High A ⇒ low curvature ⇒ minimal slippage (approaches constant sum)
     *      Low A ⇒ high curvature ⇒ more slippage (approaches constant product)
     */
    function _computeAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 A,
        uint256 fee
    ) internal pure returns (uint256) {
        // Apply fee
        uint256 amountInWithFee = amountIn * (10000 - fee) / 10000;

        // Compute weight: w = A / (A + 1)
        // Using fixed point math with 1e18 precision
        uint256 w = (A * 1e18) / (A + 1);

        // Constant sum component: out = amountIn (1:1 swap)
        uint256 constantSumOut = amountInWithFee;

        // Constant product component: out = reserveOut * amountIn / (reserveIn + amountIn)
        uint256 constantProductOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

        // Hybrid: out = w * constantSum + (1-w) * constantProduct
        uint256 hybridOut = (w * constantSumOut + (1e18 - w) * constantProductOut) / 1e18;

        return hybridOut;
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getPool(uint256 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }

    function getPoolByTokens(address token0, address token1) external view returns (uint256) {
        (address t0, address t1) = token0 < token1 ? (token0, token1) : (token1, token0);
        return poolIds[t0][t1];
    }
}
