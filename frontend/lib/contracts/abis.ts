// Contract ABIs for AQUAMAN Protocol
// Generated from compiled Solidity contracts

export const INTENT_MANAGER_ABI = [
    {
        type: "constructor",
        inputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "createIntent",
        inputs: [
            {
                name: "params",
                type: "tuple",
                components: [
                    { name: "tokenIn", type: "address" },
                    { name: "amountIn", type: "uint256" },
                    { name: "tokenOut", type: "address" },
                    { name: "minAmountOut", type: "uint256" },
                    { name: "recipient", type: "address" },
                    { name: "deadline", type: "uint256" },
                ],
            },
        ],
        outputs: [{ name: "intentHash", type: "bytes32" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "cancelIntent",
        inputs: [{ name: "intentHash", type: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "fulfillIntent",
        inputs: [
            { name: "intentHash", type: "bytes32" },
            { name: "amountOut", type: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "settleIntent",
        inputs: [{ name: "intentHash", type: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "getIntent",
        inputs: [{ name: "intentHash", type: "bytes32" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "intentHash", type: "bytes32" },
                    { name: "trader", type: "address" },
                    { name: "tokenIn", type: "address" },
                    { name: "amountIn", type: "uint256" },
                    { name: "tokenOut", type: "address" },
                    { name: "minAmountOut", type: "uint256" },
                    { name: "recipient", type: "address" },
                    { name: "deadline", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "state", type: "uint8" },
                    { name: "fulfiller", type: "address" },
                    { name: "fulfilledAmount", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getTraderIntents",
        inputs: [{ name: "trader", type: "address" }],
        outputs: [{ name: "", type: "bytes32[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "isIntentFillable",
        inputs: [{ name: "intentHash", type: "bytes32" }],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "IntentCreated",
        inputs: [
            { name: "intentHash", type: "bytes32", indexed: true },
            { name: "trader", type: "address", indexed: true },
            { name: "tokenIn", type: "address", indexed: false },
            { name: "amountIn", type: "uint256", indexed: false },
            { name: "tokenOut", type: "address", indexed: false },
            { name: "minAmountOut", type: "uint256", indexed: false },
            { name: "deadline", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "IntentCancelled",
        inputs: [
            { name: "intentHash", type: "bytes32", indexed: true },
            { name: "trader", type: "address", indexed: true },
        ],
    },
] as const;

export const STABLESWAP_AMM_ABI = [
    {
        type: "function",
        name: "swap",
        inputs: [
            { name: "poolId", type: "uint256" },
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
            { name: "minAmountOut", type: "uint256" },
            { name: "recipient", type: "address" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "quote",
        inputs: [
            { name: "poolId", type: "uint256" },
            { name: "tokenIn", type: "address" },
            { name: "amountIn", type: "uint256" },
        ],
        outputs: [{ name: "amountOut", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getPool",
        inputs: [{ name: "poolId", type: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "token0", type: "address" },
                    { name: "token1", type: "address" },
                    { name: "reserve0", type: "uint256" },
                    { name: "reserve1", type: "uint256" },
                    { name: "amplificationFactor", type: "uint256" },
                    { name: "fee", type: "uint256" },
                    { name: "active", type: "bool" },
                ],
            },
        ],
        stateMutability: "view",
    },
] as const;

export const ERC20_ABI = [
    {
        type: "function",
        name: "approve",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "allowance",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
    },
] as const;
