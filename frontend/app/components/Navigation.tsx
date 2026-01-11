"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./WalletConnect";

const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/swap", label: "Swap" },
    { href: "/liquidity", label: "Liquidity" },
];

export default function Navigation() {
    const pathname = usePathname();

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
                    <WalletConnect />
                </div>
            </div>
        </nav>
    );
}
