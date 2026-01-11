// Contract addresses for different chains
// Update these after deployment

export const CONTRACT_ADDRESSES = {
    // Sepolia (testnet)
    11155111: {
        aquaLiquidityAccounting: "0x1A2820439118694c8aFD92d71768B8E720b84B95" as `0x${string}`,
        intentManager: "0xf8B53AF426f8cf33C1bE28CF655DF5B926052AF4" as `0x${string}`,
        stableswapAMM: "0xA58A2fbab64B2dCBBd3b371f94344a97C0a97ac7" as `0x${string}`,
        concentratedLiquidity: "0x1314b63De493BC253D73901Ca7172BeAA2496747" as `0x${string}`,
        escrowVault: "0x5D13851723Bc9364116767c8A703913B15B320A1" as `0x${string}`,
        crossChainSettlement: "0x8796dC07D8683a59517cef64B7C0C66Ef0f9b351" as `0x${string}`,
    },
    // Polygon Amoy (testnet)
    80002: {
        aquaLiquidityAccounting: "0xa61ff4608e932353f0249f8b357d38d37b54d1c9" as `0x${string}`,
        intentManager: "0xb6b6f495bfb1721e93370962589efcc3279f88e7" as `0x${string}`,
        stableswapAMM: "0xe9c4499b96ae57c580d2674aef79801a20154bce" as `0x${string}`,
        concentratedLiquidity: "0xdb76a20997b36f62bf5658aac75e7c7ce8629a5a" as `0x${string}`,
        escrowVault: "0x8ac83a775c044c9d5fb44546ee7dea0867872df5" as `0x${string}`,
        crossChainSettlement: "0xa3b8b8528ce454347c8fd82e8ce3355972a1e0bb" as `0x${string}`,
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
