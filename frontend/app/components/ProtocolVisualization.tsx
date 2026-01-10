"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Chain nodes for visualization
const chainNodes = [
    { id: "eth", name: "Ethereum", x: 50, y: 30, color: "#627EEA" },
    { id: "arb", name: "Arbitrum", x: 75, y: 20, color: "#28A0F0" },
    { id: "avax", name: "Avalanche", x: 85, y: 45, color: "#E84142" },
    { id: "op", name: "Optimism", x: 70, y: 60, color: "#FF0420" },
    { id: "base", name: "Base", x: 45, y: 70, color: "#0052FF" },
    { id: "matic", name: "Polygon", x: 25, y: 55, color: "#8247E5" },
    { id: "bsc", name: "BNB", x: 20, y: 35, color: "#F0B90B" },
];

// Generate random transactions between chains
function generateTransaction() {
    const from = chainNodes[Math.floor(Math.random() * chainNodes.length)];
    let to = chainNodes[Math.floor(Math.random() * chainNodes.length)];
    while (to.id === from.id) {
        to = chainNodes[Math.floor(Math.random() * chainNodes.length)];
    }
    return {
        id: `${Date.now()}-${Math.random()}`,
        from,
        to,
        amount: Math.floor(Math.random() * 100000) + 1000,
    };
}

function TransactionLine({
    from,
    to,
    onComplete,
}: {
    from: { x: number; y: number; color: string };
    to: { x: number; y: number; color: string };
    onComplete: () => void;
}) {
    return (
        <motion.line
            x1={`${from.x}%`}
            y1={`${from.y}%`}
            x2={`${from.x}%`}
            y2={`${from.y}%`}
            stroke={`url(#gradient-${from.color.replace("#", "")}-${to.color.replace("#", "")})`}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ x2: `${from.x}%`, y2: `${from.y}%`, opacity: 0.8 }}
            animate={{ x2: `${to.x}%`, y2: `${to.y}%`, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            onAnimationComplete={onComplete}
        />
    );
}

function ChainNode({
    node,
    isActive,
}: {
    node: typeof chainNodes[0];
    isActive: boolean;
}) {
    return (
        <motion.g
            style={{ transform: `translate(${node.x}%, ${node.y}%)` }}
        >
            {/* Glow effect */}
            <motion.circle
                cx="0"
                cy="0"
                r="20"
                fill={node.color}
                opacity={0.2}
                animate={{
                    r: isActive ? [20, 30, 20] : 20,
                    opacity: isActive ? [0.2, 0.4, 0.2] : 0.2,
                }}
                transition={{ duration: 0.5 }}
            />
            {/* Main node */}
            <circle cx="0" cy="0" r="12" fill={node.color} />
            {/* Label */}
            <text
                x="0"
                y="28"
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize="10"
                fontFamily="monospace"
            >
                {node.name}
            </text>
        </motion.g>
    );
}

export default function ProtocolVisualization() {
    const [transactions, setTransactions] = useState<ReturnType<typeof generateTransaction>[]>([]);
    const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            const newTx = generateTransaction();
            setTransactions((prev) => [...prev.slice(-10), newTx]);
            setActiveNodes((prev) => new Set([...prev, newTx.from.id, newTx.to.id]));

            // Clear active state after animation
            setTimeout(() => {
                setActiveNodes((prev) => {
                    const next = new Set(prev);
                    next.delete(newTx.from.id);
                    next.delete(newTx.to.id);
                    return next;
                });
            }, 500);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    const removeTransaction = (id: string) => {
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    };

    return (
        <div className="w-full aspect-[16/9] max-w-[800px] relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                    {/* Generate gradients for all chain combinations */}
                    {chainNodes.map((from) =>
                        chainNodes.map((to) => (
                            <linearGradient
                                key={`gradient-${from.color.replace("#", "")}-${to.color.replace("#", "")}`}
                                id={`gradient-${from.color.replace("#", "")}-${to.color.replace("#", "")}`}
                            >
                                <stop offset="0%" stopColor={from.color} />
                                <stop offset="100%" stopColor={to.color} />
                            </linearGradient>
                        ))
                    )}
                </defs>

                {/* Background grid */}
                <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path
                            d="M 10 0 L 0 0 0 10"
                            fill="none"
                            stroke="#1F2937"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />

                {/* Transaction lines */}
                <AnimatePresence>
                    {transactions.map((tx) => (
                        <TransactionLine
                            key={tx.id}
                            from={tx.from}
                            to={tx.to}
                            onComplete={() => removeTransaction(tx.id)}
                        />
                    ))}
                </AnimatePresence>

                {/* Chain nodes */}
                {chainNodes.map((node) => (
                    <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                    >
                        <motion.circle
                            cx="0"
                            cy="0"
                            r="3"
                            fill={node.color}
                            animate={{
                                r: activeNodes.has(node.id) ? [3, 5, 3] : 3,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                        <text
                            x="0"
                            y="8"
                            textAnchor="middle"
                            fill="#9CA3AF"
                            fontSize="3"
                            fontFamily="monospace"
                        >
                            {node.id.toUpperCase()}
                        </text>
                    </g>
                ))}

                {/* Center logo */}
                <g transform="translate(50, 50)">
                    <circle cx="0" cy="0" r="8" fill="#0891B2" opacity="0.3" />
                    <circle cx="0" cy="0" r="5" fill="#0891B2" />
                    <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        fill="white"
                        fontSize="4"
                        fontFamily="monospace"
                        fontWeight="bold"
                    >
                        AQ
                    </text>
                </g>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-gray-400 font-mono">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>Cross-chain Tx</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
                    <span>Settlement</span>
                </div>
            </div>
        </div>
    );
}
