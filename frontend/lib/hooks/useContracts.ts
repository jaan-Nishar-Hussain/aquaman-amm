"use client";

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import { INTENT_MANAGER_ABI, STABLESWAP_AMM_ABI, ERC20_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES, type SupportedChainId } from "@/lib/contracts/addresses";

// Get contract address for current chain
export function useContractAddress(
    contractName: keyof (typeof CONTRACT_ADDRESSES)[1]
) {
    const chainId = useChainId() as SupportedChainId;
    const addresses = CONTRACT_ADDRESSES[chainId];
    return addresses?.[contractName] ?? null;
}

// Intent Manager Hooks
export function useCreateIntent() {
    const intentManagerAddress = useContractAddress("intentManager");
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const createIntent = (params: {
        tokenIn: `0x${string}`;
        amountIn: bigint;
        tokenOut: `0x${string}`;
        minAmountOut: bigint;
        recipient: `0x${string}`;
        deadline: bigint;
    }) => {
        if (!intentManagerAddress) return;

        writeContract({
            address: intentManagerAddress,
            abi: INTENT_MANAGER_ABI,
            functionName: "createIntent",
            args: [params],
        });
    };

    return {
        createIntent,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

export function useCancelIntent() {
    const intentManagerAddress = useContractAddress("intentManager");
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const cancelIntent = (intentHash: `0x${string}`) => {
        if (!intentManagerAddress) return;

        writeContract({
            address: intentManagerAddress,
            abi: INTENT_MANAGER_ABI,
            functionName: "cancelIntent",
            args: [intentHash],
        });
    };

    return {
        cancelIntent,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

export function useGetIntent(intentHash: `0x${string}` | undefined) {
    const intentManagerAddress = useContractAddress("intentManager");

    return useReadContract({
        address: intentManagerAddress ?? undefined,
        abi: INTENT_MANAGER_ABI,
        functionName: "getIntent",
        args: intentHash ? [intentHash] : undefined,
        query: {
            enabled: !!intentManagerAddress && !!intentHash,
        },
    });
}

export function useGetTraderIntents(trader: `0x${string}` | undefined) {
    const intentManagerAddress = useContractAddress("intentManager");

    return useReadContract({
        address: intentManagerAddress ?? undefined,
        abi: INTENT_MANAGER_ABI,
        functionName: "getTraderIntents",
        args: trader ? [trader] : undefined,
        query: {
            enabled: !!intentManagerAddress && !!trader,
        },
    });
}

// AMM Hooks
export function useSwapQuote(
    poolId: bigint,
    tokenIn: `0x${string}`,
    amountIn: bigint
) {
    const ammAddress = useContractAddress("stableswapAMM");

    return useReadContract({
        address: ammAddress ?? undefined,
        abi: STABLESWAP_AMM_ABI,
        functionName: "quote",
        args: [poolId, tokenIn, amountIn],
        query: {
            enabled: !!ammAddress && amountIn > 0n,
        },
    });
}

export function useSwap() {
    const ammAddress = useContractAddress("stableswapAMM");
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const swap = (params: {
        poolId: bigint;
        tokenIn: `0x${string}`;
        amountIn: bigint;
        minAmountOut: bigint;
        recipient: `0x${string}`;
    }) => {
        if (!ammAddress) return;

        writeContract({
            address: ammAddress,
            abi: STABLESWAP_AMM_ABI,
            functionName: "swap",
            args: [
                params.poolId,
                params.tokenIn,
                params.amountIn,
                params.minAmountOut,
                params.recipient,
            ],
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

// Token Approval Hook
export function useTokenApproval(
    tokenAddress: `0x${string}` | undefined,
    spender: `0x${string}` | undefined
) {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: allowance } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && spender ? [address, spender] : undefined,
        query: {
            enabled: !!tokenAddress && !!address && !!spender,
        },
    });

    const approve = (amount: bigint) => {
        if (!tokenAddress || !spender) return;

        writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [spender, amount],
        });
    };

    return {
        approve,
        allowance,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

// Token Balance Hook
export function useTokenBalance(tokenAddress: `0x${string}` | undefined) {
    const { address } = useAccount();

    return useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!tokenAddress && !!address,
        },
    });
}

// Re-export utility functions
export { parseEther, formatEther, parseUnits, formatUnits };

// Re-export wagmi hooks
export { useAccount, useConnect, useDisconnect, useBalance, useChainId };
