"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { useState, useEffect } from "react";

const SUPPORTED_CHAINS = [
    { id: 11155111, name: "Sepolia", color: "#627EEA" },
    { id: 80002, name: "Polygon Amoy", color: "#8247E5" },
];

export function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showChainSelector, setShowChainSelector] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const currentChain = SUPPORTED_CHAINS.find((c) => c.id === chainId);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Show loading placeholder until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <button
                disabled
                className="px-4 py-2 bg-zinc-700 text-gray-400 font-bold rounded-lg"
            >
                Loading...
            </button>
        );
    }

    if (!isConnected) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isPending}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {isPending ? "Connecting..." : "Connect Wallet"}
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden z-50">
                        {connectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => {
                                    connect({ connector });
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-zinc-700 transition-colors flex items-center gap-2"
                            >
                                <span className="text-lg">🔗</span>
                                {connector.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Chain Selector */}
            <div className="relative">
                <button
                    onClick={() => setShowChainSelector(!showChainSelector)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentChain?.color || "#666" }}
                    />
                    <span className="text-white text-sm">
                        {currentChain?.name || "Unknown"}
                    </span>
                    <span className="text-gray-400">▼</span>
                </button>

                {showChainSelector && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden z-50">
                        {SUPPORTED_CHAINS.map((chain) => (
                            <button
                                key={chain.id}
                                onClick={() => {
                                    switchChain?.({ chainId: chain.id });
                                    setShowChainSelector(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors flex items-center gap-2 ${chainId === chain.id ? "bg-zinc-700" : ""
                                    }`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: chain.color }}
                                />
                                <span className="text-white">{chain.name}</span>
                                {chainId === chain.id && (
                                    <span className="ml-auto text-cyan-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Account */}
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-white font-mono text-sm">
                        {formatAddress(address!)}
                    </span>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-zinc-700">
                            <div className="text-gray-400 text-xs mb-1">Connected</div>
                            <div className="text-white font-mono text-sm">
                                {formatAddress(address!)}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(address!);
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-zinc-700 transition-colors"
                        >
                            📋 Copy Address
                        </button>
                        <button
                            onClick={() => {
                                disconnect();
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-red-400 hover:bg-zinc-700 transition-colors"
                        >
                            ⏏ Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
