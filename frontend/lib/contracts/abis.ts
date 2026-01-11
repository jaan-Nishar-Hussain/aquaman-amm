// Contract ABIs for Aquaman Protocol
// Auto-generated from Foundry build output

export const AquaLiquidityAccountingABI = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "computeStrategyHash",
        "inputs": [
            {
                "name": "strategy",
                "type": "tuple",
                "internalType": "struct IAqua.Strategy",
                "components": [
                    {
                        "name": "maker",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenIn",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenOut",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amountOut",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceLower",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceUpper",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiry",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "salt",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "deposit",
        "inputs": [
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getBalance",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct IAqua.Balance",
                "components": [
                    {
                        "name": "amount",
                        "type": "uint248",
                        "internalType": "uint248"
                    },
                    {
                        "name": "tokensCount",
                        "type": "uint8",
                        "internalType": "uint8"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getStrategy",
        "inputs": [
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct IAqua.Strategy",
                "components": [
                    {
                        "name": "maker",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenIn",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenOut",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amountOut",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceLower",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceUpper",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiry",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "salt",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isAppRegistered",
        "inputs": [
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isStrategyActive",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pull",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "push",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "registerStrategy",
        "inputs": [
            {
                "name": "strategy",
                "type": "tuple",
                "internalType": "struct IAqua.Strategy",
                "components": [
                    {
                        "name": "maker",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenIn",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenOut",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amountOut",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceLower",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceUpper",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiry",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "salt",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setAppRegistration",
        "inputs": [
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "active",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [
            {
                "name": "app",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "AppRegistered",
        "inputs": [
            {
                "name": "app",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "active",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Pull",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "app",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Push",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "app",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "token",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "StrategyRegistered",
        "inputs": [
            {
                "name": "maker",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "strategyHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "strategy",
                "type": "tuple",
                "indexed": false,
                "internalType": "struct IAqua.Strategy",
                "components": [
                    {
                        "name": "maker",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenIn",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenOut",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amountIn",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amountOut",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceLower",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "priceUpper",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiry",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "salt",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    }
                ]
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "BalanceOverflow",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ExpiredStrategy",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InsufficientBalance",
        "inputs": [
            {
                "name": "requested",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "available",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "InvalidStrategy",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "StrategyAlreadyExists",
        "inputs": []
    },
    {
        "type": "error",
        "name": "StrategyNotActive",
        "inputs": []
    },
    {
        "type": "error",
        "name": "StrategyNotFound",
        "inputs": []
    },
    {
        "type": "error",
        "name": "UnauthorizedApp",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ZeroAddress",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ZeroAmount",
        "inputs": []
    }
] as const;

export const StableswapAMMABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_aqua",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "addLiquidity",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount0",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount1",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "aqua",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IAqua"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "createPool",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amplificationFactor",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "fee",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getPool",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct StableswapAMM.Pool",
                "components": [
                    {
                        "name": "token0",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token1",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "reserve0",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "reserve1",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "amplificationFactor",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "fee",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "active",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPoolByTokens",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "poolCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "poolIds",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pools",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "reserve0",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "reserve1",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amplificationFactor",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "fee",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "active",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "quote",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "swap",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "minAmountOut",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "LiquidityAdded",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "provider",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount0",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount1",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PoolCreated",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "token0",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amplificationFactor",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "fee",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Swap",
        "inputs": [
            {
                "name": "poolId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenIn",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "tokenOut",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amountOut",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "CallbackFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InsufficientLiquidity",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InsufficientOutput",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidAmplificationFactor",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidFee",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidPool",
        "inputs": []
    },
    {
        "type": "error",
        "name": "PoolNotActive",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SlippageExceeded",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ZeroAmount",
        "inputs": []
    }
] as const;

export const ConcentratedLiquiditySwapABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_aqua",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "MAX_TICK",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "int24",
                "internalType": "int24"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MIN_TICK",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "int24",
                "internalType": "int24"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "Q96",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "aqua",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IAqua"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "feeGrowthGlobal0X128",
        "inputs": [
            {
                "name": "poolKey",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "feeGrowthGlobal1X128",
        "inputs": [
            {
                "name": "poolKey",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPoolState",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct ConcentratedLiquiditySwap.PoolState",
                "components": [
                    {
                        "name": "token0",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token1",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "fee",
                        "type": "uint24",
                        "internalType": "uint24"
                    },
                    {
                        "name": "tickSpacing",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "currentTick",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "sqrtPriceX96",
                        "type": "uint160",
                        "internalType": "uint160"
                    },
                    {
                        "name": "liquidity",
                        "type": "uint128",
                        "internalType": "uint128"
                    },
                    {
                        "name": "initialized",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getPosition",
        "inputs": [
            {
                "name": "positionId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct ConcentratedLiquiditySwap.Position",
                "components": [
                    {
                        "name": "owner",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token0",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "token1",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "liquidity",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "tickLower",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "tickUpper",
                        "type": "int24",
                        "internalType": "int24"
                    },
                    {
                        "name": "feeGrowthInside0",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "feeGrowthInside1",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "tokensOwed0",
                        "type": "uint128",
                        "internalType": "uint128"
                    },
                    {
                        "name": "tokensOwed1",
                        "type": "uint128",
                        "internalType": "uint128"
                    },
                    {
                        "name": "active",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initializePool",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "sqrtPriceX96",
                "type": "uint160",
                "internalType": "uint160"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "mint",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "tickLower",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "tickUpper",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "amount0Desired",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount1Desired",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "positionId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "liquidity",
                "type": "uint128",
                "internalType": "uint128"
            },
            {
                "name": "amount0",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount1",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "poolStates",
        "inputs": [
            {
                "name": "poolKey",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "tickSpacing",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "currentTick",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "sqrtPriceX96",
                "type": "uint160",
                "internalType": "uint160"
            },
            {
                "name": "liquidity",
                "type": "uint128",
                "internalType": "uint128"
            },
            {
                "name": "initialized",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "positionCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "positions",
        "inputs": [
            {
                "name": "positionId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "liquidity",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tickLower",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "tickUpper",
                "type": "int24",
                "internalType": "int24"
            },
            {
                "name": "feeGrowthInside0",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "feeGrowthInside1",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "tokensOwed0",
                "type": "uint128",
                "internalType": "uint128"
            },
            {
                "name": "tokensOwed1",
                "type": "uint128",
                "internalType": "uint128"
            },
            {
                "name": "active",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "quote",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "zeroForOne",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "amountIn",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "amountOut",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "swap",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "internalType": "uint24"
            },
            {
                "name": "zeroForOne",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "amountSpecified",
                "type": "int256",
                "internalType": "int256"
            },
            {
                "name": "sqrtPriceLimitX96",
                "type": "uint160",
                "internalType": "uint160"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "amount0",
                "type": "int256",
                "internalType": "int256"
            },
            {
                "name": "amount1",
                "type": "int256",
                "internalType": "int256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "PoolInitialized",
        "inputs": [
            {
                "name": "token0",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "token1",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "fee",
                "type": "uint24",
                "indexed": false,
                "internalType": "uint24"
            },
            {
                "name": "tickSpacing",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            },
            {
                "name": "sqrtPriceX96",
                "type": "uint160",
                "indexed": false,
                "internalType": "uint160"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PositionMinted",
        "inputs": [
            {
                "name": "positionId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "owner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tickLower",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            },
            {
                "name": "tickUpper",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            },
            {
                "name": "liquidity",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount0",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "amount1",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Swap",
        "inputs": [
            {
                "name": "poolKey",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "recipient",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount0",
                "type": "int256",
                "indexed": false,
                "internalType": "int256"
            },
            {
                "name": "amount1",
                "type": "int256",
                "indexed": false,
                "internalType": "int256"
            },
            {
                "name": "sqrtPriceX96",
                "type": "uint160",
                "indexed": false,
                "internalType": "uint160"
            },
            {
                "name": "tick",
                "type": "int24",
                "indexed": false,
                "internalType": "int24"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "InsufficientLiquidity",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidSqrtPrice",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidTickRange",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotPositionOwner",
        "inputs": []
    },
    {
        "type": "error",
        "name": "PoolAlreadyInitialized",
        "inputs": []
    },
    {
        "type": "error",
        "name": "PoolNotInitialized",
        "inputs": []
    },
    {
        "type": "error",
        "name": "PriceOutOfRange",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SafeERC20FailedOperation",
        "inputs": [
            {
                "name": "token",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SlippageExceeded",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ZeroLiquidity",
        "inputs": []
    }
] as const;

// Standard ERC20 ABI
export const ERC20ABI = [
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
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
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
