"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import Navigation from "../components/Navigation";
import { useStableswapQuote } from "@/lib/hooks/useSwap";
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from "@/lib/contracts/addresses";
import { StableswapAMMABI, ConcentratedLiquiditySwapABI, ERC20ABI } from "@/lib/contracts/abis";

const tokens = [
    { symbol: "USDC", name: "USD Coin", icon: "◈", color: "#2775CA", decimals: 6 },
    { symbol: "USDT", name: "Tether", icon: "₮", color: "#26A17B", decimals: 6 },
];

const chains = [
    { id: 80002, name: "Polygon Amoy", color: "#8247E5" },
    { id: 11155111, name: "Sepolia", color: "#627EEA" },
];

export default function SwapPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [mounted, setMounted] = useState(false);

    const [tokenIn, setTokenIn] = useState(tokens[0]);
    const [tokenOut, setTokenOut] = useState(tokens[1]);
    const [amountIn, setAmountIn] = useState("");
    const [amountOut, setAmountOut] = useState("");
    const [slippage, setSlippage] = useState("0.5");
    const [error, setError] = useState<string | null>(null);

    // Contract hooks
    const contractChainId = chainId as keyof typeof CONTRACT_ADDRESSES;
    const addresses = CONTRACT_ADDRESSES[contractChainId];
    const tokenAddresses = TOKEN_ADDRESSES[contractChainId];

    // Write contract for swap
    const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    // Get quote from StableswapAMM
    const tokenInAddress = tokenAddresses?.[tokenIn.symbol as keyof typeof tokenAddresses];
    const amountInBigInt = amountIn ? parseUnits(amountIn, tokenIn.decimals) : undefined;

    const { data: quoteAmount, isLoading: isQuoting } = useStableswapQuote(
        contractChainId,
        BigInt(0), // Pool ID 0
        tokenInAddress,
        amountInBigInt
    );

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update output when quote changes
    useEffect(() => {
        if (quoteAmount && quoteAmount > BigInt(0)) {
            setAmountOut(formatUnits(quoteAmount, tokenOut.decimals));
        } else if (amountIn) {
            // Mock 1:1 rate for stablecoins if no pool
            setAmountOut((parseFloat(amountIn) * 0.997).toFixed(6));
        }
    }, [quoteAmount, amountIn, tokenOut.decimals]);

    // Handle successful swap
    useEffect(() => {
        if (isSuccess) {
            setAmountIn("");
            setAmountOut("");
        }
    }, [isSuccess]);

    // Handle write error
    useEffect(() => {
        if (writeError) {
            setError(writeError.message);
        }
    }, [writeError]);

    const swapTokens = () => {
        const temp = tokenIn;
        setTokenIn(tokenOut);
        setTokenOut(temp);
        setAmountIn(amountOut);
        setAmountOut(amountIn);
    };

    const handleSwap = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (!amountIn || parseFloat(amountIn) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (!addresses?.stableswapAMM) {
            setError("StableswapAMM not deployed on this chain");
            return;
        }

        setError(null);

        try {
            const inputAmount = parseUnits(amountIn, tokenIn.decimals);
            const outputAmount = parseUnits(amountOut || "0", tokenOut.decimals);
            const minOutput = outputAmount - (outputAmount * BigInt(Math.floor(parseFloat(slippage) * 100))) / BigInt(10000);

            // Direct StableswapAMM swap
            writeContract({
                address: addresses.stableswapAMM,
                abi: StableswapAMMABI,
                functionName: "swap",
                args: [
                    BigInt(0), // poolId
                    tokenInAddress!,
                    inputAmount,
                    minOutput > BigInt(0) ? minOutput : BigInt(1),
                    address!,
                ],
            });
        } catch (err: any) {
            console.error("Swap failed:", err);
            setError(err.message || "Swap failed. Pool may not exist.");
        }
    };

    const isLoading = isPending || isConfirming;

    return (
        <main className="font-mono min-h-screen bg-black pt-20">
            <Navigation />

            <div className="max-w-lg mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Swap</h1>
                    <p className="text-gray-400 text-sm">
                        Swap tokens directly via StableswapAMM
                    </p>
                </div>

                {/* Success notification */}
                {isSuccess && txHash && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                        ✓ Swap complete! Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
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
                            StableswapAMM: <span className="text-cyan-400 font-mono">{addresses.stableswapAMM?.slice(0, 10)}...</span>
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
                                    onChange={(e) => {
                                        setAmountIn(e.target.value);
                                        setError(null);
                                    }}
                                    className="bg-transparent text-2xl text-white outline-none w-full"
                                />
                                <select
                                    className="bg-zinc-700 px-3 py-2 rounded-lg text-white"
                                    value={tokenIn.symbol}
                                    onChange={(e) => setTokenIn(tokens.find(t => t.symbol === e.target.value) || tokens[0])}
                                >
                                    {tokens.map((t) => (
                                        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Swap Arrow */}
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
                                    className="bg-zinc-700 px-3 py-2 rounded-lg text-white"
                                    value={tokenOut.symbol}
                                    onChange={(e) => setTokenOut(tokens.find(t => t.symbol === e.target.value) || tokens[1])}
                                >
                                    {tokens.map((t) => (
                                        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Swap Details */}
                    <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                            <span>Rate</span>
                            <span className="text-white">1 {tokenIn.symbol} ≈ {amountIn && amountOut ? (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(4) : "1.0000"} {tokenOut.symbol}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Slippage</span>
                            <span className="text-white">{slippage}%</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>AMM</span>
                            <span className="text-cyan-400">StableswapAMM</span>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <button
                        onClick={handleSwap}
                        disabled={isLoading || !isConnected || !amountIn}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors"
                    >
                        {!isConnected
                            ? "Connect Wallet"
                            : isLoading
                                ? (isConfirming ? "Confirming..." : "Swapping...")
                                : "Swap"}
                    </button>

                    {/* Info */}
                    <p className="text-center text-xs text-gray-500">
                        Direct AMM swap. Pool must exist.
                    </p>
                </div>

                {/* Protocol Info */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-cyan-400 text-lg font-bold">0.3%</div>
                        <div className="text-gray-400 text-xs">Swap Fee</div>
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
