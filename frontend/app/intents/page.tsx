"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import Navigation from "../components/Navigation";
import {
    useTraderIntents,
    useCancelIntent,
    IntentState as ContractIntentState
} from "@/lib/hooks/useIntentManager";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { IntentManagerABI } from "@/lib/contracts/abis";

type IntentState = "created" | "fulfilled" | "settled" | "cancelled" | "expired";

interface Intent {
    id: string;
    intentHash: string;
    tokenIn: string;
    amountIn: number;
    tokenOut: string;
    minAmountOut: number;
    sourceChain: string;
    destChain: string;
    state: IntentState;
    createdAt: Date;
    deadline: Date;
    fulfiller?: string;
    settledAmount?: number;
}

const stateColors: Record<IntentState, { bg: string; text: string }> = {
    created: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    fulfilled: { bg: "bg-blue-500/20", text: "text-blue-400" },
    settled: { bg: "bg-green-500/20", text: "text-green-400" },
    cancelled: { bg: "bg-gray-500/20", text: "text-gray-400" },
    expired: { bg: "bg-red-500/20", text: "text-red-400" },
};

// Map contract state enum to string
const mapContractState = (state: number): IntentState => {
    switch (state) {
        case 0: return "created";
        case 1: return "fulfilled";
        case 2: return "settled";
        case 3: return "cancelled";
        case 4: return "expired";
        default: return "created";
    }
};

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

function formatTimeRemaining(date: Date): string {
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    if (seconds < 0) return "Expired";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
}

function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function IntentsPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [filter, setFilter] = useState<IntentState | "all">("all");
    const [intents, setIntents] = useState<Intent[]>([]);
    const [cancellingHash, setCancellingHash] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Get chain id for contract calls
    const contractChainId = chainId as keyof typeof CONTRACT_ADDRESSES;

    // Fetch trader's intent hashes from contract using ABI
    const { data: intentHashes, isLoading, refetch } = useTraderIntents(
        contractChainId,
        address
    );

    // Cancel intent hook - uses IntentManagerABI internally
    const { cancelIntent, isPending: isCancelling, isSuccess: cancelSuccess } = useCancelIntent(contractChainId);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Refetch after successful cancel
    useEffect(() => {
        if (cancelSuccess) {
            setCancellingHash(null);
            refetch();
        }
    }, [cancelSuccess, refetch]);

    const handleCancelIntent = async (intentHash: string) => {
        setCancellingHash(intentHash);
        try {
            await cancelIntent(intentHash as `0x${string}`);
        } catch (err) {
            console.error("Failed to cancel intent:", err);
            setCancellingHash(null);
        }
    };

    const filteredIntents =
        filter === "all" ? intents : intents.filter((i) => i.state === filter);

    const stats = {
        total: intents.length,
        created: intents.filter((i) => i.state === "created").length,
        fulfilled: intents.filter((i) => i.state === "fulfilled").length,
        settled: intents.filter((i) => i.state === "settled").length,
    };

    // Show loading for contract intents
    const showContractInfo = mounted && isConnected;
    const hasContractIntents = intentHashes && intentHashes.length > 0;

    // Get contract address for display
    const intentManagerAddress = CONTRACT_ADDRESSES[contractChainId]?.intentManager;

    return (
        <main className="font-mono min-h-screen bg-black pt-20">
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Intents</h1>
                    <p className="text-gray-400 text-sm">
                        Track your declarative trade promises
                    </p>
                </div>

                {/* Connection Status */}
                {mounted && !isConnected && (
                    <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400">
                        ⚠️ Connect your wallet to view your intents
                    </div>
                )}

                {/* Contract Info */}
                {showContractInfo && (
                    <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div className="text-sm text-gray-400">
                                <span>Wallet: </span>
                                <span className="text-cyan-400 font-mono">{formatAddress(address!)}</span>
                                <span className="mx-2">|</span>
                                <span>Chain: </span>
                                <span className="text-white">{chainId === 11155111 ? "Sepolia" : chainId === 80002 ? "Polygon Amoy" : chainId}</span>
                            </div>
                            <div className="text-sm">
                                {isLoading ? (
                                    <span className="text-gray-400">Loading intents from IntentManager...</span>
                                ) : hasContractIntents ? (
                                    <span className="text-green-400">✓ {intentHashes.length} intent(s) found on-chain</span>
                                ) : (
                                    <span className="text-gray-400">No intents found on-chain</span>
                                )}
                            </div>
                        </div>
                        {intentManagerAddress && (
                            <div className="mt-2 text-xs text-gray-500">
                                IntentManager: <span className="font-mono">{intentManagerAddress}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Total Intents</div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Pending</div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.created}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Fulfilling</div>
                        <div className="text-2xl font-bold text-blue-400">{stats.fulfilled}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Settled</div>
                        <div className="text-2xl font-bold text-green-400">{stats.settled}</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {["all", "created", "fulfilled", "settled", "cancelled"].map((state) => (
                        <button
                            key={state}
                            onClick={() => setFilter(state as IntentState | "all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filter === state
                                ? "bg-cyan-500 text-black"
                                : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                                }`}
                        >
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Intent List */}
                <div className="space-y-4">
                    {filteredIntents.map((intent) => (
                        <div
                            key={intent.id}
                            className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800/80 transition-colors"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                {/* Intent Details */}
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-gray-400 text-sm font-mono">{intent.id}</span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${stateColors[intent.state].bg} ${stateColors[intent.state].text}`}
                                        >
                                            {intent.state}
                                        </span>
                                    </div>

                                    {/* Trade Summary */}
                                    <div className="flex items-center gap-2 text-lg">
                                        <span className="text-white font-bold">
                                            {intent.amountIn} {intent.tokenIn}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-cyan-400 font-bold">
                                            ≥{intent.minAmountOut.toLocaleString()} {intent.tokenOut}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="text-sm text-gray-400 mt-1">
                                        {intent.sourceChain} → {intent.destChain}
                                    </div>
                                </div>

                                {/* Timing */}
                                <div className="text-right">
                                    <div className="text-sm text-gray-400">
                                        Created {formatTimeAgo(intent.createdAt)}
                                    </div>
                                    {intent.state === "created" && (
                                        <div className="text-sm text-yellow-400">
                                            Expires in {formatTimeRemaining(intent.deadline)}
                                        </div>
                                    )}
                                    {intent.state === "fulfilled" && intent.fulfiller && (
                                        <div className="text-sm text-blue-400">
                                            Fulfiller: {intent.fulfiller}
                                        </div>
                                    )}
                                    {intent.state === "settled" && intent.settledAmount && (
                                        <div className="text-sm text-green-400">
                                            Received: ${intent.settledAmount.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {intent.state === "created" && (
                                        <button
                                            onClick={() => handleCancelIntent(intent.intentHash)}
                                            disabled={cancellingHash === intent.intentHash || isCancelling}
                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-red-500/10 text-red-400 rounded-lg text-sm"
                                        >
                                            {cancellingHash === intent.intentHash ? "Cancelling..." : "Cancel"}
                                        </button>
                                    )}
                                    <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm">
                                        Details
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar for active intents */}
                            {(intent.state === "created" || intent.state === "fulfilled") && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Intent Lifecycle</span>
                                        <span>
                                            {intent.state === "created" ? "Waiting for fulfiller..." : "Settling..."}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${intent.state === "fulfilled" ? "bg-blue-500 w-2/3" : "bg-yellow-500 w-1/3"
                                                }`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-yellow-400">Created</span>
                                        <span className={intent.state === "fulfilled" ? "text-blue-400" : "text-gray-500"}>
                                            Fulfilled
                                        </span>
                                        <span className="text-gray-500">Settled</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredIntents.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        {isConnected
                            ? "No intents found. Create one from the Swap page!"
                            : "Connect your wallet to view your intents."}
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-8 bg-zinc-900 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4">How Intents Work</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex gap-3">
                            <span className="text-2xl">1️⃣</span>
                            <div>
                                <div className="text-white font-medium">Create</div>
                                <div className="text-gray-400">
                                    Declare your trade promise with minimum output
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">2️⃣</span>
                            <div>
                                <div className="text-white font-medium">Fulfill</div>
                                <div className="text-gray-400">
                                    LP commits to execute your trade
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">3️⃣</span>
                            <div>
                                <div className="text-white font-medium">Settle</div>
                                <div className="text-gray-400">
                                    Atomic cross-chain execution
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <div className="text-white font-medium">Complete</div>
                                <div className="text-gray-400">
                                    Funds safe or refunded
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
