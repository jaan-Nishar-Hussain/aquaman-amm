"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import Navigation from "../components/Navigation";
import { useCreateIntent, useApproveToken, useTokenBalance } from "@/lib/hooks/useIntentManager";
import { useStableswapQuote } from "@/lib/hooks/useSwap";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { IntentManagerABI, StableswapAMMABI, ERC20ABI } from "@/lib/contracts/abis";

// Token addresses on different chains (testnet examples)
const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
    11155111: { // Sepolia
        ETH: "0x0000000000000000000000000000000000000000", // Native
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    },
    80002: { // Polygon Amoy
        POL: "0x0000000000000000000000000000000000000000", // Native
        USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
        USDT: "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2",
    },
};

const tokens = [
    { symbol: "ETH", name: "Ethereum", icon: "⟠", color: "#627EEA", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", icon: "◈", color: "#2775CA", decimals: 6 },
    { symbol: "USDT", name: "Tether", icon: "₮", color: "#26A17B", decimals: 6 },
    { symbol: "POL", name: "Polygon", icon: "⬡", color: "#8247E5", decimals: 18 },
];

const chains = [
    { id: 80002, name: "Polygon Amoy", color: "#8247E5" },
    { id: 11155111, name: "Sepolia ETH", color: "#627EEA" },
];

export default function SwapPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [mounted, setMounted] = useState(false);

    const [tokenIn, setTokenIn] = useState(tokens[0]);
    const [tokenOut, setTokenOut] = useState(tokens[1]);
    const [amountIn, setAmountIn] = useState("");
    const [amountOut, setAmountOut] = useState("");
    const [sourceChain, setSourceChain] = useState(chains[0]);
    const [destChain, setDestChain] = useState(chains[1]);
    const [slippage, setSlippage] = useState("0.5");
    const [isSwapping, setIsSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Get contract chain ID
    const contractChainId = chainId as keyof typeof CONTRACT_ADDRESSES;
    const addresses = CONTRACT_ADDRESSES[contractChainId];

    // Contract hooks
    const { createIntent, isPending: isCreatingIntent, isSuccess: intentCreated, hash: intentHash } = useCreateIntent(contractChainId);
    const { approve, isPending: isApproving } = useApproveToken();

    // Get quote from StableswapAMM (if pool exists)
    const tokenInAddress = TOKEN_ADDRESSES[sourceChain.id]?.[tokenIn.symbol];
    const tokenOutAddress = TOKEN_ADDRESSES[destChain.id]?.[tokenOut.symbol];

    const amountInBigInt = amountIn ? parseUnits(amountIn, tokenIn.decimals) : undefined;

    const { data: quoteAmount, isLoading: isQuoting } = useStableswapQuote(
        contractChainId,
        0n, // Pool ID 0 for demo
        tokenInAddress,
        amountInBigInt
    );

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update output when quote changes
    useEffect(() => {
        if (quoteAmount && quoteAmount > 0n) {
            setAmountOut(formatUnits(quoteAmount, tokenOut.decimals));
        } else if (amountIn) {
            // Fallback mock rate if no pool exists
            const amount = parseFloat(amountIn) || 0;
            const rate = tokenIn.symbol === "ETH" && tokenOut.symbol === "USDC" ? 2847 : 1;
            setAmountOut((amount * rate).toFixed(2));
        }
    }, [quoteAmount, amountIn, tokenIn.symbol, tokenOut.symbol, tokenOut.decimals]);

    // Handle successful intent creation
    useEffect(() => {
        if (intentCreated && intentHash) {
            setTxHash(intentHash);
            setIsSwapping(false);
            setAmountIn("");
            setAmountOut("");
            setTimeout(() => setTxHash(null), 5000);
        }
    }, [intentCreated, intentHash]);

    const handleInputChange = (value: string) => {
        setAmountIn(value);
        setError(null);
    };

    const swapTokens = () => {
        const temp = tokenIn;
        setTokenIn(tokenOut);
        setTokenOut(temp);
        setAmountIn(amountOut);
        setAmountOut(amountIn);
    };

    const handleCreateIntent = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (!amountIn || parseFloat(amountIn) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (!addresses?.intentManager) {
            setError("IntentManager not deployed on this chain");
            return;
        }

        setError(null);
        setIsSwapping(true);

        try {
            const inputAmount = parseUnits(amountIn, tokenIn.decimals);
            const outputAmount = parseUnits(amountOut || "0", tokenOut.decimals);
            const minOutput = outputAmount - (outputAmount * BigInt(Math.floor(parseFloat(slippage) * 100))) / 10000n;
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

            // Create intent params
            const intentParams = {
                tokenIn: tokenInAddress || "0x0000000000000000000000000000000000000000" as `0x${string}`,
                amountIn: inputAmount,
                tokenOut: tokenOutAddress || "0x0000000000000000000000000000000000000000" as `0x${string}`,
                minAmountOut: minOutput > 0n ? minOutput : 1n,
                recipient: address!,
                deadline,
            };

            // Call createIntent on the contract
            await createIntent(intentParams);
        } catch (err: any) {
            console.error("Failed to create intent:", err);
            setError(err.message || "Failed to create intent");
            setIsSwapping(false);
        }
    };

    const isPending = isSwapping || isCreatingIntent || isApproving;

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

                {/* Success notification */}
                {txHash && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                        ✓ Intent created! Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </div>
                )}

                {/* Error notification */}
                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Contract Info */}
                {mounted && isConnected && addresses && (
                    <div className="mb-4 p-3 bg-zinc-800 rounded-lg text-xs">
                        <div className="text-gray-400">
                            IntentManager: <span className="text-cyan-400 font-mono">{addresses.intentManager?.slice(0, 10)}...</span>
                        </div>
                    </div>
                )}

                {/* Connection Warning */}
                {mounted && !isConnected && (
                    <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
                        ⚠️ Connect your wallet to swap
                    </div>
                )}

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
                                <select
                                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-white"
                                    value={tokenIn.symbol}
                                    onChange={(e) => setTokenIn(tokens.find(t => t.symbol === e.target.value) || tokens[0])}
                                >
                                    {tokens.map((token) => (
                                        <option key={token.symbol} value={token.symbol}>
                                            {token.icon} {token.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-400">
                                    ≈ ${(parseFloat(amountIn) * 2847 || 0).toLocaleString()}
                                </span>
                                <select
                                    className="bg-transparent text-gray-400 text-sm outline-none"
                                    value={sourceChain.id}
                                    onChange={(e) => setSourceChain(chains.find(c => c.id === parseInt(e.target.value)) || chains[0])}
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
                            <span>To {isQuoting && "(fetching quote...)"}</span>
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
                                <select
                                    className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-white"
                                    value={tokenOut.symbol}
                                    onChange={(e) => setTokenOut(tokens.find(t => t.symbol === e.target.value) || tokens[1])}
                                >
                                    {tokens.map((token) => (
                                        <option key={token.symbol} value={token.symbol}>
                                            {token.icon} {token.symbol}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-gray-400">
                                    ≈ ${(parseFloat(amountOut) || 0).toLocaleString()}
                                </span>
                                <select
                                    className="bg-transparent text-gray-400 text-sm outline-none"
                                    value={destChain.id}
                                    onChange={(e) => setDestChain(chains.find(c => c.id === parseInt(e.target.value)) || chains[0])}
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
                            <span className="text-white">1 {tokenIn.symbol} ≈ {amountIn && amountOut ? (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(2) : "?"} {tokenOut.symbol}</span>
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
                            <span className="text-green-400">Intent-based (on-chain)</span>
                        </div>
                    </div>

                    {/* Create Intent Button */}
                    <button
                        onClick={handleCreateIntent}
                        disabled={isPending || !isConnected || !amountIn}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors"
                    >
                        {!isConnected
                            ? "Connect Wallet"
                            : isPending
                                ? "Creating Intent..."
                                : "Create Intent"}
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
                        <div className="text-cyan-400 text-lg font-bold">2</div>
                        <div className="text-gray-400 text-xs">Chains</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
