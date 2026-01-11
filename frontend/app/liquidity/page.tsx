"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import Navigation from "../components/Navigation";
import { useStableswapPoolCount } from "@/lib/hooks/useSwap";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { StableswapAMMABI, ConcentratedLiquiditySwapABI, AquaLiquidityAccountingABI, ERC20ABI } from "@/lib/contracts/abis";

// Chain options mapped to chain IDs
const CHAIN_OPTIONS = [
    { id: 80002, name: "Polygon Amoy" },
    { id: 11155111, name: "Sepolia ETH" },
];

// Token addresses for testing
const TOKEN_ADDRESSES: Record<number, Record<string, `0x${string}`>> = {
    11155111: {
        ETH: "0x0000000000000000000000000000000000000000",
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    },
    80002: {
        POL: "0x0000000000000000000000000000000000000000",
        USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    },
};

interface Strategy {
    id: number;
    txHash?: string;
    type: string;
    pair: string;
    chain: string;
    chainId: number;
    rangeLow: number;
    rangeHigh: number;
    liquidity: number;
    earnings: number;
    apy: string;
    status: string;
}

export default function LiquidityPage() {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedType, setSelectedType] = useState<"concentrated" | "stable">("concentrated");
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [mounted, setMounted] = useState(false);

    // Form state
    const [selectedPair, setSelectedPair] = useState("ETH / USDC");
    const [selectedChain, setSelectedChain] = useState(80002);
    const [priceLow, setPriceLow] = useState("2500");
    const [priceHigh, setPriceHigh] = useState("2800");
    const [depositAmount, setDepositAmount] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Get contract addresses for display
    const contractChainId = chainId as keyof typeof CONTRACT_ADDRESSES;
    const addresses = CONTRACT_ADDRESSES[contractChainId];

    // Contract write hooks - direct wagmi hook for addLiquidity
    const { writeContract, data: writeTxHash, isPending: isWriting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: writeTxHash });

    // Pool count from contract
    const { data: poolCount } = useStableswapPoolCount(contractChainId);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle successful transaction
    useEffect(() => {
        if (isSuccess && writeTxHash) {
            setTxHash(writeTxHash);
            const newStrategy: Strategy = {
                id: Date.now(),
                txHash: writeTxHash,
                type: selectedType,
                pair: selectedPair,
                chain: CHAIN_OPTIONS.find(c => c.id === selectedChain)?.name || "Unknown",
                chainId: selectedChain,
                rangeLow: parseInt(priceLow) || 0,
                rangeHigh: parseInt(priceHigh) || 0,
                liquidity: parseFloat(depositAmount) * 2800,
                earnings: 0,
                apy: selectedType === "concentrated" ? "24.5%" : "8.2%",
                status: "Active",
            };
            setStrategies(prev => [...prev, newStrategy]);
            setShowCreateModal(false);
            setDepositAmount("");
            setTimeout(() => setTxHash(null), 5000);
        }
    }, [isSuccess, writeTxHash, selectedType, selectedPair, selectedChain, priceLow, priceHigh, depositAmount]);

    // Handle write error
    useEffect(() => {
        if (writeError) {
            setError(writeError.message);
        }
    }, [writeError]);

    const totalLiquidity = strategies.reduce((sum, s) => sum + s.liquidity, 0);
    const totalEarnings = strategies.reduce((sum, s) => sum + s.earnings, 0);

    const handleCreateStrategy = async () => {
        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            setError("Please enter a valid deposit amount");
            return;
        }

        const targetAddresses = CONTRACT_ADDRESSES[selectedChain as keyof typeof CONTRACT_ADDRESSES];
        if (!targetAddresses) {
            setError("Contract not deployed on selected chain");
            return;
        }

        setError(null);

        try {
            const amount = parseUnits(depositAmount, 18);

            // Use valid ERC20 addresses - zero address will fail!
            const usdcAddress = TOKEN_ADDRESSES[selectedChain]?.USDC || "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" as `0x${string}`;

            if (selectedType === "stable") {
                // Call StableswapAMM.addLiquidity
                // NOTE: Will fail if pool 0 doesn't exist
                writeContract({
                    address: targetAddresses.stableswapAMM!,
                    abi: StableswapAMMABI,
                    functionName: "addLiquidity",
                    args: [0n, amount, amount], // poolId, amount0, amount1
                });
            } else {
                // Call ConcentratedLiquiditySwap.mint
                // NOTE: Will fail if pool not initialized via initializePool() first
                const tickLower = -887220;
                const tickUpper = 887220;
                writeContract({
                    address: targetAddresses.concentratedLiquidity!,
                    abi: ConcentratedLiquiditySwapABI,
                    functionName: "mint",
                    args: [
                        usdcAddress, // Use valid ERC20, NOT zero address
                        usdcAddress, // Use valid ERC20, NOT zero address
                        3000, // fee tier (0.3%)
                        tickLower,
                        tickUpper,
                        amount,
                        amount,
                    ],
                });
            }
        } catch (err: any) {
            console.error("Failed to create strategy:", err);
            setError(err.message || "Failed to create strategy. Pool may not exist.");
        }
    };

    const handleRemoveStrategy = (id: number) => {
        setStrategies(strategies.filter(s => s.id !== id));
    };

    const isPending = isWriting || isConfirming;

    return (
        <main className="font-mono min-h-screen bg-black pt-20">
            <Navigation />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Success notification */}
                {txHash && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                        ✓ Transaction submitted! Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </div>
                )}

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

                {/* Contract Info */}
                {mounted && isConnected && addresses && (
                    <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-gray-400 mb-1">StableswapAMM</div>
                                <div className="text-cyan-400 font-mono text-xs">{addresses.stableswapAMM}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-1">ConcentratedLiquidity</div>
                                <div className="text-cyan-400 font-mono text-xs">{addresses.concentratedLiquidity}</div>
                            </div>
                        </div>
                        {poolCount !== undefined && (
                            <div className="mt-2 text-sm text-gray-400">
                                Active Pools: <span className="text-white">{poolCount.toString()}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Connection Warning */}
                {mounted && !isConnected && (
                    <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400">
                        ⚠️ Connect your wallet to manage liquidity
                    </div>
                )}

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
                        <div className="text-2xl font-bold text-cyan-400">
                            {strategies.length > 0 ? "16.3%" : "0%"}
                        </div>
                    </div>
                </div>

                {/* Strategy List */}
                <div className="bg-zinc-900 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-zinc-800">
                        <h2 className="text-lg font-bold text-white">Your Strategies</h2>
                    </div>

                    {strategies.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No strategies yet. Click "+ New Strategy" to create one.
                        </div>
                    ) : (
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
                                                {strategy.txHash && (
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        {strategy.txHash.slice(0, 8)}...
                                                    </div>
                                                )}
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
                                                    <button
                                                        onClick={() => handleRemoveStrategy(strategy.id)}
                                                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm text-red-400"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                            Provide liquidity that works across multiple chains with atomic settlement
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

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Wallet connection check */}
                        {mounted && !isConnected && (
                            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
                                ⚠️ Please connect your wallet first
                            </div>
                        )}

                        {/* Contract call info */}
                        {mounted && isConnected && (
                            <div className="mb-4 p-3 bg-zinc-800 rounded-lg text-xs text-gray-400">
                                This will call <span className="text-cyan-400">{selectedType === "stable" ? "StableswapAMM.addLiquidity" : "ConcentratedLiquidity.mint"}</span> on-chain
                            </div>
                        )}

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

                        {/* Form fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Token Pair</label>
                                <select
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                    value={selectedPair}
                                    onChange={(e) => setSelectedPair(e.target.value)}
                                >
                                    <option>ETH / USDC</option>
                                    <option>POL / USDC</option>
                                    <option>USDC / USDT</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Chain</label>
                                <select
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                    value={selectedChain}
                                    onChange={(e) => setSelectedChain(parseInt(e.target.value))}
                                >
                                    {CHAIN_OPTIONS.map(chain => (
                                        <option key={chain.id} value={chain.id}>{chain.name}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedType === "concentrated" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-400 text-sm">Price Low</label>
                                        <input
                                            type="number"
                                            placeholder="2500"
                                            value={priceLow}
                                            onChange={(e) => setPriceLow(e.target.value)}
                                            className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm">Price High</label>
                                        <input
                                            type="number"
                                            placeholder="2800"
                                            value={priceHigh}
                                            onChange={(e) => setPriceHigh(e.target.value)}
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
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg mt-1"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCreateStrategy}
                            disabled={isPending || !isConnected}
                            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-bold rounded-lg mt-6 transition-colors"
                        >
                            {isPending ? (isConfirming ? "Confirming..." : "Submitting...") : "Create Strategy"}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
