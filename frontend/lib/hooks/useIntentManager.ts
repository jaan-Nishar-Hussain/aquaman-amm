"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { IntentManagerABI, ERC20ABI } from "../contracts/abis";
import { CONTRACT_ADDRESSES } from "../contracts/addresses";
import { parseUnits } from "viem";

// Intent state enum matching contract
export enum IntentState {
    CREATED = 0,
    FULFILLED = 1,
    SETTLED = 2,
    CANCELLED = 3,
    EXPIRED = 4,
}

export interface Intent {
    intentHash: `0x${string}`;
    trader: `0x${string}`;
    tokenIn: `0x${string}`;
    amountIn: bigint;
    tokenOut: `0x${string}`;
    minAmountOut: bigint;
    recipient: `0x${string}`;
    deadline: bigint;
    nonce: bigint;
    state: IntentState;
    fulfiller: `0x${string}`;
    fulfilledAmount: bigint;
}

export interface CreateIntentParams {
    tokenIn: `0x${string}`;
    amountIn: bigint;
    tokenOut: `0x${string}`;
    minAmountOut: bigint;
    recipient: `0x${string}`;
    deadline: bigint;
}

/**
 * Hook to get all intents for a trader
 */
export function useTraderIntents(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    trader: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.intentManager,
        abi: IntentManagerABI,
        functionName: "getTraderIntents",
        args: trader ? [trader] : undefined,
        query: {
            enabled: !!trader && !!addresses?.intentManager,
        },
    });
}

/**
 * Hook to get a single intent by hash
 */
export function useIntent(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    intentHash: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.intentManager,
        abi: IntentManagerABI,
        functionName: "getIntent",
        args: intentHash ? [intentHash] : undefined,
        query: {
            enabled: !!intentHash && !!addresses?.intentManager,
        },
    });
}

/**
 * Hook to get intent state
 */
export function useIntentState(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    intentHash: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.intentManager,
        abi: IntentManagerABI,
        functionName: "getIntentState",
        args: intentHash ? [intentHash] : undefined,
        query: {
            enabled: !!intentHash && !!addresses?.intentManager,
        },
    });
}

/**
 * Hook to check if intent is fillable
 */
export function useIsIntentFillable(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    intentHash: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.intentManager,
        abi: IntentManagerABI,
        functionName: "isIntentFillable",
        args: intentHash ? [intentHash] : undefined,
        query: {
            enabled: !!intentHash && !!addresses?.intentManager,
        },
    });
}

/**
 * Hook to create a new intent
 */
export function useCreateIntent(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const createIntent = async (params: CreateIntentParams) => {
        if (!addresses?.intentManager) {
            throw new Error("IntentManager not deployed on this chain");
        }

        writeContract({
            address: addresses.intentManager,
            abi: IntentManagerABI,
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

/**
 * Hook to cancel an intent
 */
export function useCancelIntent(chainId: keyof typeof CONTRACT_ADDRESSES) {
    const addresses = CONTRACT_ADDRESSES[chainId];
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const cancelIntent = async (intentHash: `0x${string}`) => {
        if (!addresses?.intentManager) {
            throw new Error("IntentManager not deployed on this chain");
        }

        writeContract({
            address: addresses.intentManager,
            abi: IntentManagerABI,
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

/**
 * Hook to get trader nonce (for intent uniqueness)
 */
export function useTraderNonce(
    chainId: keyof typeof CONTRACT_ADDRESSES,
    trader: `0x${string}` | undefined
) {
    const addresses = CONTRACT_ADDRESSES[chainId];

    return useReadContract({
        address: addresses?.intentManager,
        abi: IntentManagerABI,
        functionName: "getTraderNonce",
        args: trader ? [trader] : undefined,
        query: {
            enabled: !!trader && !!addresses?.intentManager,
        },
    });
}

/**
 * Hook to approve token spending
 */
export function useApproveToken() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const approve = async (
        tokenAddress: `0x${string}`,
        spender: `0x${string}`,
        amount: bigint
    ) => {
        writeContract({
            address: tokenAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [spender, amount],
        });
    };

    return {
        approve,
        hash,
        isPending,
        isConfirming,
        isSuccess,
        error,
    };
}

/**
 * Hook to check token allowance
 */
export function useTokenAllowance(
    tokenAddress: `0x${string}` | undefined,
    owner: `0x${string}` | undefined,
    spender: `0x${string}` | undefined
) {
    return useReadContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: owner && spender ? [owner, spender] : undefined,
        query: {
            enabled: !!tokenAddress && !!owner && !!spender,
        },
    });
}

/**
 * Hook to get token balance
 */
export function useTokenBalance(
    tokenAddress: `0x${string}` | undefined,
    account: `0x${string}` | undefined
) {
    return useReadContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: account ? [account] : undefined,
        query: {
            enabled: !!tokenAddress && !!account,
        },
    });
}
