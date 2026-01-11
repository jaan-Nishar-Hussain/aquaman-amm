"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { StableswapAMMABI, ConcentratedLiquiditySwapABI, ERC20ABI } from "../contracts/abis";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";

export interface Pool {
    token0: `0x${string}`;
    token1: `0x${string}`;
    reserve0: bigint;
    reserve1: bigint;
    amplificationFactor: bigint;
    fee: bigint;
    active: boolean;
}

export interface PoolState {
    token0: `0x${string}`;
    token1: `0x${string}`;
    fee: number;
    tickSpacing: number;
    currentTick: number;
    sqrtPriceX96: bigint;
    liquidity: bigint;
    initialized: boolean;
}

/**
 * Hook to get a quote from StableswapAMM
 */
export function useStableswapQuote(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    poolId: bigint | undefined,
    tokenIn: `0x${string}` | undefined,
    amountIn: bigint | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.stableswapAMM,
        abi: StableswapAMMABI,
        functionName: "quote",
        args: poolId !== undefined && tokenIn && amountIn !== undefined
            ? [poolId, tokenIn, amountIn]
            : undefined,
        query: {
            enabled: poolId !== undefined && !!tokenIn && amountIn !== undefined && amountIn > 0n && !!addresses?.stableswapAMM,
        },
    });
}

/**
 * Hook to get a quote from ConcentratedLiquiditySwap
 */
export function useConcentratedLiquidityQuote(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    token0: `0x${string}` | undefined,
    token1: `0x${string}` | undefined,
    fee: number | undefined,
    zeroForOne: boolean,
    amountIn: bigint | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.concentratedLiquidity,
        abi: ConcentratedLiquiditySwapABI,
        functionName: "quote",
        args: token0 && token1 && fee !== undefined && amountIn !== undefined
            ? [token0, token1, fee, zeroForOne, amountIn]
            : undefined,
        query: {
            enabled: !!token0 && !!token1 && fee !== undefined && amountIn !== undefined && amountIn > 0n && !!addresses?.concentratedLiquidity,
        },
    });
}

/**
 * Hook to execute a swap on StableswapAMM
 */
export function useStableswapSwap(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const swap = async (
        poolId: bigint,
        tokenIn: `0x${string}`,
        amountIn: bigint,
        minAmountOut: bigint,
        recipient: `0x${string}`
    ) => {
        if (!addresses?.stableswapAMM) {
            throw new Error("StableswapAMM not deployed on this chain");
        }

        writeContract({
            address: addresses.stableswapAMM,
            abi: StableswapAMMABI,
            functionName: "swap",
            args: [poolId, tokenIn, amountIn, minAmountOut, recipient],
        });
    };

    return {
        swap,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to execute a swap on ConcentratedLiquiditySwap
 */
export function useConcentratedLiquiditySwap(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const swap = async (
        token0: `0x${string}`,
        token1: `0x${string}`,
        fee: number,
        zeroForOne: boolean,
        amountSpecified: bigint,
        sqrtPriceLimitX96: bigint,
        recipient: `0x${string}`
    ) => {
        if (!addresses?.concentratedLiquidity) {
            throw new Error("ConcentratedLiquiditySwap not deployed on this chain");
        }

        writeContract({
            address: addresses.concentratedLiquidity,
            abi: ConcentratedLiquiditySwapABI,
            functionName: "swap",
            args: [token0, token1, fee, zeroForOne, amountSpecified, sqrtPriceLimitX96, recipient],
        });
    };

    return {
        swap,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to get pool info from StableswapAMM
 */
export function useStableswapPool(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    poolId: bigint | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.stableswapAMM,
        abi: StableswapAMMABI,
        functionName: "getPool",
        args: poolId !== undefined ? [poolId] : undefined,
        query: {
            enabled: poolId !== undefined && !!addresses?.stableswapAMM,
        },
    });
}

/**
 * Hook to get pool state from ConcentratedLiquiditySwap
 */
export function useConcentratedLiquidityPoolState(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    token0: `0x${string}` | undefined,
    token1: `0x${string}` | undefined,
    fee: number | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.concentratedLiquidity,
        abi: ConcentratedLiquiditySwapABI,
        functionName: "getPoolState",
        args: token0 && token1 && fee !== undefined ? [token0, token1, fee] : undefined,
        query: {
            enabled: !!token0 && !!token1 && fee !== undefined && !!addresses?.concentratedLiquidity,
        },
    });
}

/**
 * Hook to get pool ID by tokens from StableswapAMM
 */
export function useStableswapPoolByTokens(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    token0: `0x${string}` | undefined,
    token1: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.stableswapAMM,
        abi: StableswapAMMABI,
        functionName: "getPoolByTokens",
        args: token0 && token1 ? [token0, token1] : undefined,
        query: {
            enabled: !!token0 && !!token1 && !!addresses?.stableswapAMM,
        },
    });
}

/**
 * Hook to get pool count from StableswapAMM
 */
export function useStableswapPoolCount(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.stableswapAMM,
        abi: StableswapAMMABI,
        functionName: "poolCount",
        query: {
            enabled: !!addresses?.stableswapAMM,
        },
    });
}

/**
 * Hook to add liquidity to StableswapAMM
 */
export function useAddLiquidity(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const addLiquidity = async (
        poolId: bigint,
        amount0: bigint,
        amount1: bigint
    ) => {
        if (!addresses?.stableswapAMM) {
            throw new Error("StableswapAMM not deployed on this chain");
        }

        writeContract({
            address: addresses.stableswapAMM,
            abi: StableswapAMMABI,
            functionName: "addLiquidity",
            args: [poolId, amount0, amount1],
        });
    };

    return {
        addLiquidity,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}
