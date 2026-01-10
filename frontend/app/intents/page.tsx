"use client";

import { useState } from "react";
import Navigation from "../components/Navigation";

type IntentState = "created" | "fulfilled" | "settled" | "cancelled" | "expired";

interface Intent {
    id: string;
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

const mockIntents: Intent[] = [
    {
        id: "0x1a2b3c...4d5e6f",
        tokenIn: "ETH",
        amountIn: 2.5,
        tokenOut: "USDC",
        minAmountOut: 7100,
        sourceChain: "Ethereum",
        destChain: "Arbitrum",
        state: "settled",
        createdAt: new Date(Date.now() - 3600000),
        deadline: new Date(Date.now() + 3600000),
        fulfiller: "0xABC...123",
        settledAmount: 7117.50,
    },
    {
        id: "0x2b3c4d...5e6f7g",
        tokenIn: "USDC",
        amountIn: 5000,
        tokenOut: "AVAX",
        minAmountOut: 140,
        sourceChain: "Arbitrum",
        destChain: "Avalanche",
        state: "fulfilled",
        createdAt: new Date(Date.now() - 1800000),
        deadline: new Date(Date.now() + 7200000),
        fulfiller: "0xDEF...456",
    },
    {
        id: "0x3c4d5e...6f7g8h",
        tokenIn: "ETH",
        amountIn: 1.0,
        tokenOut: "USDC",
        minAmountOut: 2840,
        sourceChain: "Ethereum",
        destChain: "Base",
        state: "created",
        createdAt: new Date(Date.now() - 600000),
        deadline: new Date(Date.now() + 10800000),
    },
    {
        id: "0x4d5e6f...7g8h9i",
        tokenIn: "AVAX",
        amountIn: 100,
        tokenOut: "USDC",
        minAmountOut: 3500,
        sourceChain: "Avalanche",
        destChain: "Optimism",
        state: "cancelled",
        createdAt: new Date(Date.now() - 7200000),
        deadline: new Date(Date.now() - 3600000),
    },
];

const stateColors: Record<IntentState, { bg: string; text: string }> = {
    created: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    fulfilled: { bg: "bg-blue-500/20", text: "text-blue-400" },
    settled: { bg: "bg-green-500/20", text: "text-green-400" },
    cancelled: { bg: "bg-gray-500/20", text: "text-gray-400" },
    expired: { bg: "bg-red-500/20", text: "text-red-400" },
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

export default function IntentsPage() {
    const [filter, setFilter] = useState<IntentState | "all">("all");

    const filteredIntents =
        filter === "all" ? mockIntents : mockIntents.filter((i) => i.state === filter);

    const stats = {
        total: mockIntents.length,
        created: mockIntents.filter((i) => i.state === "created").length,
        fulfilled: mockIntents.filter((i) => i.state === "fulfilled").length,
        settled: mockIntents.filter((i) => i.state === "settled").length,
    };

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
                                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm">
                                            Cancel
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
                        No intents found for this filter.
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
