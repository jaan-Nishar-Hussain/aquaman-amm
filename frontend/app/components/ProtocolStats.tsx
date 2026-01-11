"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Protocol statistics - default to 0, will update based on user actions
const protocolStats = {
    totalVolume: 0,
    activeStrategies: 0,
    crossChainSettlements: 0,
    intentsFilled: 0,
    liquidityProviders: 0,
    virtualBalances: 0,
    aiGatewayRequests: 0,
    cacheHits: 0,
};

const topChains = [
    { code: "ETH", name: "Ethereum", volume: 0, color: "#627EEA" },
    { code: "ARB", name: "Arbitrum", volume: 0, color: "#28A0F0" },
    { code: "AVAX", name: "Avalanche", volume: 0, color: "#E84142" },
    { code: "OP", name: "Optimism", volume: 0, color: "#FF0420" },
    { code: "BASE", name: "Base", volume: 0, color: "#0052FF" },
    { code: "MATIC", name: "Polygon", volume: 0, color: "#8247E5" },
];

function formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
}

function useAnimatedNumber(baseValue: number, incrementRatePerSecond: number) {
    const [value, setValue] = useState(baseValue);
    const [displayRate, setDisplayRate] = useState(incrementRatePerSecond);

    useEffect(() => {
        const updatesPerSecond = 20;
        const baseIncrement = incrementRatePerSecond / updatesPerSecond;

        const interval = setInterval(() => {
            const variation = 0.7 + Math.random() * 0.6;
            const increment = Math.max(1, Math.floor(baseIncrement * variation));
            setValue((v) => v + increment);

            const rateVariation = 0.85 + Math.random() * 0.3;
            setDisplayRate(Math.floor(incrementRatePerSecond * rateVariation));
        }, 1000 / updatesPerSecond);

        return () => clearInterval(interval);
    }, [incrementRatePerSecond]);

    return { value, rate: displayRate };
}

function InfoIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
        </svg>
    );
}

function StatCard({
    title,
    baseValue,
    incrementRate,
    children,
    infoContent,
    className,
}: {
    title: string;
    baseValue?: number;
    incrementRate?: number;
    children?: React.ReactNode;
    infoContent?: string;
    className?: string;
}) {
    const [showInfo, setShowInfo] = useState(false);
    const { value } = useAnimatedNumber(baseValue || 0, incrementRate || 0);

    return (
        <div className={`relative group rounded-md overflow-hidden ${className || ""}`}>
            <div className="bg-zinc-900 p-4 md:p-6 w-full min-h-[120px] h-full">
                <div className="space-y-2">
                    <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-300 pr-6">
                        {title}
                    </h2>
                    {baseValue !== undefined && (
                        <div className="text-3xl md:text-4xl tracking-normal font-mono tabular-nums text-white">
                            {formatNumber(value)}
                        </div>
                    )}
                    {children}
                </div>
            </div>
            {infoContent && (
                <div className="absolute top-2 right-2 z-20">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-1 bg-transparent text-gray-500 hover:text-white transition-colors"
                    >
                        <InfoIcon />
                    </button>
                </div>
            )}
        </div>
    );
}

function MetricRow({
    label,
    baseValue,
    incrementRate,
    showRate = false,
}: {
    label: string;
    baseValue: number;
    incrementRate: number;
    showRate?: boolean;
}) {
    const { value, rate } = useAnimatedNumber(baseValue, incrementRate);

    return (
        <li className="flex flex-wrap items-center justify-between gap-x-3">
            <h3 className="m-0 font-mono font-normal text-sm text-gray-400 uppercase">{label}</h3>
            <div className="flex items-center gap-3 md:gap-4 text-right">
                <div className="text-white text-sm font-mono tabular-nums">{formatNumber(value)}</div>
                {showRate && (
                    <div className="w-16 text-gray-400 text-right text-sm font-mono tabular-nums">
                        <span>{formatNumber(rate)}</span>
                        <span>/s</span>
                    </div>
                )}
            </div>
        </li>
    );
}

export function TotalVolume() {
    const { value, rate } = useAnimatedNumber(protocolStats.totalVolume, 4500000);

    return (
        <div className="space-y-2">
            <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-400">
                Total Protocol Volume
            </h2>
            <div className="text-4xl md:text-5xl tracking-normal font-mono tabular-nums text-white">
                ${formatNumber(value)}
            </div>
            <div className="text-sm text-gray-400 font-mono tabular-nums">
                ${formatNumber(rate)}/s
            </div>
        </div>
    );
}

function ChainRow({ chain, incrementRate }: { chain: typeof topChains[0]; incrementRate: number }) {
    const { value, rate } = useAnimatedNumber(chain.volume, incrementRate);

    return (
        <li className="flex items-center w-full md:w-fit justify-between md:justify-start">
            <span className="inline-block translate-y-[-2px] translate-x-[2px]">
                <span style={{ color: chain.color }}>■</span>
            </span>
            <div className="text-left">
                <h3 className="inline-block my-0 font-medium text-[16px]" style={{ color: chain.color }}>
                    &nbsp;{chain.code}
                </h3>
            </div>
            <div className="w-[14ch] text-right">
                <span className="inline-flex tabular-nums text-white">${formatNumber(value)}</span>
            </div>
            <div className="w-[10ch] ml-auto text-right text-gray-400">
                <span>${formatNumber(rate)}</span>
                <span className="lowercase">/s</span>
            </div>
        </li>
    );
}

export function TopChains() {
    const incrementRates = [1600000, 240000, 190000, 170000, 150000, 130000, 80000];

    return (
        <div className="space-y-2">
            <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-400">
                Top Chains by Volume
            </h2>
            <ul className="list-none pl-0 space-y-1">
                {topChains.map((chain, index) => (
                    <ChainRow key={chain.code} chain={chain} incrementRate={incrementRates[index] || 10000} />
                ))}
            </ul>
        </div>
    );
}

export function ChainCount() {
    return (
        <div className="flex items-center w-full md:w-fit justify-between md:justify-start mt-2">
            <span className="inline-block translate-y-[-2px] translate-x-[2px]">
                <span className="text-cyan-400">⬡</span>
            </span>
            <div className="text-left">
                <span className="inline-block my-0 font-medium text-[16px] text-white">&nbsp;7</span>
                <span className="font-medium text-[16px] text-gray-400 tracking-tight">
                    &nbsp;Connected Chains
                </span>
            </div>
        </div>
    );
}

export function ProtocolStatsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
            <div className="flex flex-col gap-1.5">
                <StatCard
                    title="Active Strategies"
                    baseValue={protocolStats.activeStrategies}
                    incrementRate={2}
                    infoContent="Number of active liquidity strategies across all chains"
                    className="flex-1"
                />
                <StatCard
                    title="Virtual Balances"
                    infoContent="Total virtual balance allocations across all providers"
                    className="flex-1"
                >
                    <ul className="space-y-1 list-none pl-0 mt-2">
                        <MetricRow label="Total Locked" baseValue={protocolStats.virtualBalances} incrementRate={950000} />
                    </ul>
                </StatCard>
            </div>

            <div className="flex flex-col gap-1.5">
                <StatCard
                    title="Cross-Chain Settlements"
                    baseValue={protocolStats.crossChainSettlements}
                    incrementRate={29}
                    infoContent="Atomic swaps executed across multiple chains"
                    className="flex-1"
                >
                    <ul className="space-y-1 list-none pl-0 mt-4">
                        <MetricRow label="Pending" baseValue={847} incrementRate={5} showRate />
                        <MetricRow label="Executed" baseValue={protocolStats.crossChainSettlements - 847} incrementRate={24} showRate />
                        <MetricRow label="Refunded" baseValue={293} incrementRate={0} showRate />
                    </ul>
                </StatCard>
            </div>

            <div className="flex flex-col gap-1.5">
                <StatCard
                    title="Intent System"
                    infoContent="Declarative trade promises managed by the protocol"
                    className="flex-1"
                >
                    <ul className="space-y-1 list-none pl-0 mt-2">
                        <MetricRow label="Intents Filled" baseValue={protocolStats.intentsFilled} incrementRate={16} />
                        <MetricRow label="Active Intents" baseValue={2847} incrementRate={3} />
                    </ul>
                </StatCard>
                <StatCard
                    title="Liquidity Providers"
                    baseValue={protocolStats.liquidityProviders}
                    incrementRate={1}
                    infoContent="Active LPs providing non-custodial liquidity"
                    className="flex-1"
                >
                    <p className="text-gray-400 text-sm font-mono mt-1">Non-custodial LPs</p>
                </StatCard>
            </div>
        </div>
    );
}
