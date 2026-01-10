"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/swap", label: "Swap" },
    { href: "/liquidity", label: "Liquidity" },
    { href: "/intents", label: "Intents" },
];

function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Navigation() {
    const pathname = usePathname();
    const { address, isConnected } = useAccount();
    const { connect, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnect = () => {
        connect({ connector: injected() });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 no-underline">
                        <span className="text-2xl">🌊</span>
                        <span className="text-white font-mono font-bold text-lg">AQUAMAN</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`font-mono text-sm uppercase tracking-wide no-underline transition-colors ${pathname === item.href
                                        ? "text-cyan-400"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Wallet Connection */}
                    {isConnected ? (
                        <div className="flex items-center gap-3">
                            <span className="text-cyan-400 font-mono text-sm">
                                {formatAddress(address!)}
                            </span>
                            <button
                                onClick={() => disconnect()}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-sm font-medium rounded transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={isPending}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-600 text-black font-mono text-sm font-medium rounded transition-colors"
                        >
                            {isPending ? "Connecting..." : "Connect Wallet"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
