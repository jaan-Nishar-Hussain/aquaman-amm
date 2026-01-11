// Contract addresses for Aquaman Protocol (Simplified Architecture)
// Updated after deployment on 2026-01-11

export const CONTRACT_ADDRESSES = {
    // Sepolia (testnet) - Previous deployment
    11155111: {
        aqua: "0x1A2820439118694c8aFD92d71768B8E720b84B95" as `0x${string}`,
        stableswapAMM: "0xA58A2fbab64B2dCBBd3b371f94344a97C0a97ac7" as `0x${string}`,
        concentratedLiquidity: "0x1314b63De493BC253D73901Ca7172BeAA2496747" as `0x${string}`,
    },
    // Polygon Amoy (testnet) - New deployment
    80002: {
        aqua: "0x61559c0a117fa3a0d5c09753caef9b60c46dbe03" as `0x${string}`,
        stableswapAMM: "0xe07801006eeba6aac227ab8134ba957c57456872" as `0x${string}`,
        concentratedLiquidity: "0xf49b2d826ef41caee234e337f3ed6b05ffb34a34" as `0x${string}`,
    },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

// Token addresses for testnets
export const TOKEN_ADDRESSES = {
    11155111: { // Sepolia
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`,
        USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06" as `0x${string}`,
    },
    80002: { // Polygon Amoy
        USDC: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582" as `0x${string}`,
        USDT: "0x1fdE0eCc619726f4cD597887C9F3b4c8740e19e2" as `0x${string}`,
    },
} as const;
