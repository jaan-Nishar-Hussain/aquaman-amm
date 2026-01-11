"use client";

import { useState } from "react";
import Navigation from "../components/Navigation";

const tokens = [
    { symbol: "ETH", name: "Ethereum", icon: "⟠", color: "#627EEA" },
    { symbol: "USDC", name: "USD Coin", icon: "◈", color: "#2775CA" },
    { symbol: "USDT", name: "Tether", icon: "₮", color: "#26A17B" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", icon: "₿", color: "#F7931A" },
    { symbol: "DAI", name: "Dai", icon: "◆", color: "#F5AC37" },
    { symbol: "AVAX", name: "Avalanche", icon: "△", color: "#E84142" },
];

const chains = [
    { id: "polygon", name: "Polygon", color: "#8247E5" },
    { id: "sepolia", name: "Sepolia ETH", color: "#627EEA" },
    { id: "base-sepolia", name: "Base Sepolia", color: "#0052FF" },
];

export default function SwapPage() {
    const [tokenIn, setTokenIn] = useState(tokens[0]);
    const [tokenOut, setTokenOut] = useState(tokens[1]);
    const [amountIn, setAmountIn] = useState("");
    const [amountOut, setAmountOut] = useState("");
    const [sourceChain, setSourceChain] = useState(chains[0]);
    const [destChain, setDestChain] = useState(chains[1]);
    const [slippage, setSlippage] = useState("0.5");

    // Mock price calculation
    const calculateOutput = (inputAmount: string) => {
        const amount = parseFloat(inputAmount) || 0;
        // Mock rate: 1 ETH = 2847 USDC
        const rate = tokenIn.symbol === "ETH" && tokenOut.symbol === "USDC" ? 2847 : 1;
        return (amount * rate).toFixed(2);
    };

    const handleInputChange = (value: string) => {
        setAmountIn(value);
        setAmountOut(calculateOutput(value));
    };

    const swapTokens = () => {
        const temp = tokenIn;
        setTokenIn(tokenOut);
        setTokenOut(temp);
        setAmountIn(amountOut);
        setAmountOut(amountIn);
    };

    return (
        <main className="font-mono min-h-screen bg-black pt-20">
            <Navigation />

            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Swap</h1>
                    <p className="text-gray-400 text-sm">
                        Non-custodial cross-chain swaps via intents
                    </p>
                </div>

                {/* Swap Card */}
                <div className="bg-zinc-900 rounded-xl p-6 space-y-4">
                    {/* From Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>From</span>
                            <span>Balance: 0 {tokenIn.symbol}</span>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountIn}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    className="bg-transparent text-2xl text-white outline-none w-full"
                                />
                                <button
                                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg"
                                >
                                    <span style={{ color: tokenIn.color }}>{tokenIn.icon}</span>
                                    <span className="text-white font-medium">{tokenIn.symbol}</span>
                                    <span className="text-gray-400">▼</span>
                                </button>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-400">
                                    ≈ ${(parseFloat(amountIn) * 2847 || 0).toLocaleString()}
                                </span>
                                <select
                                    className="bg-transparent text-gray-400 text-sm outline-none"
                                    value={sourceChain.id}
                                    onChange={(e) => setSourceChain(chains.find(c => c.id === e.target.value) || chains[0])}
                                >
                                    {chains.map((chain) => (
                                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={swapTokens}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
                            </svg>
                        </button>
                    </div>

                    {/* To Section */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>To</span>
                            <span>Balance: 0 {tokenOut.symbol}</span>
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountOut}
                                    readOnly
                                    className="bg-transparent text-2xl text-white outline-none w-full"
                                />
                                <button
                                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg"
                                >
                                    <span style={{ color: tokenOut.color }}>{tokenOut.icon}</span>
                                    <span className="text-white font-medium">{tokenOut.symbol}</span>
                                    <span className="text-gray-400">▼</span>
                                </button>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-400">
                                    ≈ ${(parseFloat(amountOut) || 0).toLocaleString()}
                                </span>
                                <select
                                    className="bg-transparent text-gray-400 text-sm outline-none"
                                    value={destChain.id}
                                    onChange={(e) => setDestChain(chains.find(c => c.id === e.target.value) || chains[0])}
                                >
                                    {chains.map((chain) => (
                                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Swap Details */}
                    <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                            <span>Rate</span>
                            <span className="text-white">1 {tokenIn.symbol} = 2,847 {tokenOut.symbol}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Route</span>
                            <span className="text-cyan-400">{sourceChain.name} → {destChain.name}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Slippage</span>
                            <span className="text-white">{slippage}%</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Execution</span>
                            <span className="text-green-400">Intent-based</span>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors">
                        Create Intent
                    </button>

                    {/* Info */}
                    <p className="text-center text-xs text-gray-500">
                        Your funds remain in your wallet until execution. No pooled custody.
                    </p>
                </div>

                {/* Protocol Info */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-cyan-400 text-lg font-bold">0%</div>
                        <div className="text-gray-400 text-xs">Custody Risk</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-cyan-400 text-lg font-bold">&lt;30s</div>
                        <div className="text-gray-400 text-xs">Avg Settlement</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-cyan-400 text-lg font-bold">3</div>
                        <div className="text-gray-400 text-xs">Chains</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
