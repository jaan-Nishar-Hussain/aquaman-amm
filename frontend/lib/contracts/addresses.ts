// Contract addresses for different chains
// Update these after deployment

export const CONTRACT_ADDRESSES = {
    // Ethereum Mainnet
    1: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    // Arbitrum
    42161: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    // Avalanche C-Chain
    43114: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    // Base
    8453: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    // Optimism
    10: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    // Sepolia (testnet)
    11155111: {
        intentManager: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        stableswapAMM: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        concentratedLiquidity: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        escrowVault: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        crossChainSettlement: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

// Token addresses for common tokens
export const TOKEN_ADDRESSES = {
    1: {
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as `0x${string}`,
        USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as `0x${string}`,
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7" as `0x${string}`,
        DAI: "0x6B175474E89094C44Da98b954EescdeCB5BE3d830" as `0x${string}`,
    },
    42161: {
        WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" as `0x${string}`,
        USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as `0x${string}`,
        USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" as `0x${string}`,
    },
    43114: {
        WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" as `0x${string}`,
        USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as `0x${string}`,
        USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7" as `0x${string}`,
    },
} as const;
