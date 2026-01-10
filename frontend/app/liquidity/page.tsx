"use client";

import { useState } from "react";
import Navigation from "../components/Navigation";

const strategies = [
    {
        id: 1,
        type: "concentrated",
        pair: "ETH/USDC",
        chain: "Ethereum",
        rangeLow: 2400,
        rangeHigh: 3200,
        liquidity: 125000,
        earnings: 1847.32,
        apy: "24.5%",
        status: "active",
    },
    {
        id: 2,
        type: "stable",
        pair: "USDC/USDT",
        chain: "Arbitrum",
        rangeLow: 0.999,
        rangeHigh: 1.001,
        liquidity: 500000,
        earnings: 2341.87,
        apy: "8.2%",
        status: "active",
    },
    {
        id: 3,
        type: "concentrated",
        pair: "AVAX/USDC",
        chain: "Avalanche",
        rangeLow: 28,
        rangeHigh: 42,
        liquidity: 75000,
        earnings: 892.45,
        apy: "31.2%",
        status: "active",
    },
];

export default function LiquidityPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedType, setSelectedType] = useState<"concentrated" | "stable">("concentrated");

    const totalLiquidity = strategies.reduce((sum, s) => sum + s.liquidity, 0);
    const totalEarnings = strategies.reduce((sum, s) => sum + s.earnings, 0);

    return (
        <main className="font-mono min-h-screen bg-black pt-20">
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Liquidity</h1>
                        <p className="text-gray-400 text-sm">
                            Provide non-custodial liquidity and earn fees
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                    >
                        + New Strategy
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Total Liquidity</div>
                        <div className="text-2xl font-bold text-white">
                            ${totalLiquidity.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Total Earnings</div>
                        <div className="text-2xl font-bold text-green-400">
                            ${totalEarnings.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Active Strategies</div>
                        <div className="text-2xl font-bold text-white">{strategies.length}</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Avg APY</div>
                        <div className="text-2xl font-bold text-cyan-400">21.3%</div>
                    </div>
                </div>

                {/* Strategy List */}
                <div className="bg-zinc-900 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="text-lg font-bold text-white">Your Strategies</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-800">
                                <tr className="text-gray-400 text-sm uppercase">
                                    <th className="text-left p-4">Pair</th>
                                    <th className="text-left p-4">Type</th>
                                    <th className="text-left p-4">Chain</th>
                                    <th className="text-left p-4">Range</th>
                                    <th className="text-right p-4">Liquidity</th>
                                    <th className="text-right p-4">Earnings</th>
                                    <th className="text-right p-4">APY</th>
                                    <th className="text-center p-4">Status</th>
                                    <th className="text-center p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {strategies.map((strategy) => (
                                    <tr key={strategy.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{strategy.pair}</div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${strategy.type === "concentrated"
                                                        ? "bg-purple-500/20 text-purple-400"
                                                        : "bg-blue-500/20 text-blue-400"
                                                    }`}
                                            >
                                                {strategy.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">{strategy.chain}</td>
                                        <td className="p-4 text-gray-400">
                                            ${strategy.rangeLow} - ${strategy.rangeHigh}
                                        </td>
                                        <td className="p-4 text-right text-white">
                                            ${strategy.liquidity.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right text-green-400">
                                            +${strategy.earnings.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right text-cyan-400">{strategy.apy}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                                {strategy.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white">
                                                    Manage
                                                </button>
                                                <button className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm text-red-400">
                                                    Close
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Protocol Benefits */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <div className="text-cyan-400 text-3xl mb-2">🔒</div>
                        <h3 className="text-white font-bold mb-2">Non-Custodial</h3>
                        <p className="text-gray-400 text-sm">
                            Your funds remain in your wallet. Virtual balances track your spending
                            allowance without custody.
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <div className="text-cyan-400 text-3xl mb-2">⚡</div>
                        <h3 className="text-white font-bold mb-2">Capital Efficient</h3>
                        <p className="text-gray-400 text-sm">
                            Concentrated liquidity positions multiply your capital efficiency with
                            tighter price ranges.
                        </p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6">
                        <div className="text-cyan-400 text-3xl mb-2">🌐</div>
                        <h3 className="text-white font-bold mb-2">Cross-Chain</h3>
                        <p className="text-gray-400 text-sm">
                            Provide liquidity that works across 7 chains with atomic settlement
                            guarantees.
                        </p>
                    </div>
                </div>
            </div>

            {/* Create Strategy Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Create Strategy</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Strategy Type Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button
                                onClick={() => setSelectedType("concentrated")}
                                className={`p-4 rounded-lg border-2 transition-colors ${selectedType === "concentrated"
                                        ? "border-cyan-500 bg-cyan-500/10"
                                        : "border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="text-lg mb-1">📊</div>
                                <div className="text-white font-bold">Concentrated</div>
                                <div className="text-gray-400 text-xs">Higher APY, active management</div>
                            </button>
                            <button
                                onClick={() => setSelectedType("stable")}
                                className={`p-4 rounded-lg border-2 transition-colors ${selectedType === "stable"
                                        ? "border-cyan-500 bg-cyan-500/10"
                                        : "border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="text-lg mb-1">💎</div>
                                <div className="text-white font-bold">Stableswap</div>
                                <div className="text-gray-400 text-xs">Low slippage, stable pairs</div>
                            </button>
                        </div>

                        {/* Form fields would go here */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Token Pair</label>
                                <select className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1">
                                    <option>ETH / USDC</option>
                                    <option>AVAX / USDC</option>
                                    <option>USDC / USDT</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Chain</label>
                                <select className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1">
                                    <option>Ethereum</option>
                                    <option>Arbitrum</option>
                                    <option>Avalanche</option>
                                </select>
                            </div>
                            {selectedType === "concentrated" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-400 text-sm">Price Low</label>
                                        <input
                                            type="number"
                                            placeholder="2400"
                                            className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm">Price High</label>
                                        <input
                                            type="number"
                                            placeholder="3200"
                                            className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-gray-400 text-sm">Amount to Deposit</label>
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                />
                            </div>
                        </div>

                        <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg mt-6 transition-colors">
                            Create Strategy
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
