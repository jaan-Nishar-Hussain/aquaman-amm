# Aquaman Frontend Integration Guide

This document describes how to integrate with the deployed Aquaman smart contracts from the frontend.

## Deployed Contract Addresses

### Sepolia Testnet (Chain ID: 11155111)

| Contract | Address |
|----------|---------|
| AquaLiquidityAccounting | `0x1A2820439118694c8aFD92d71768B8E720b84B95` |
| EscrowVault | `0x5D13851723Bc9364116767c8A703913B15B320A1` |
| CrossChainSettlement | `0x8796dC07D8683a59517cef64B7C0C66Ef0f9b351` |
| StableswapAMM | `0xA58A2fbab64B2dCBBd3b371f94344a97C0a97ac7` |
| ConcentratedLiquidity | `0x1314b63De493BC253D73901Ca7172BeAA2496747` |
| IntentManager | `0xf8B53AF426f8cf33C1bE28CF655DF5B926052AF4` |

### Polygon Amoy Testnet (Chain ID: 80002)

| Contract | Address |
|----------|---------|
| AquaLiquidityAccounting | `0xa61ff4608e932353f0249f8b357d38d37b54d1c9` |
| EscrowVault | `0x8ac83a775c044c9d5fb44546ee7dea0867872df5` |
| CrossChainSettlement | `0xa3b8b8528ce454347c8fd82e8ce3355972a1e0bb` |
| StableswapAMM | `0xe9c4499b96ae57c580d2674aef79801a20154bce` |
| ConcentratedLiquidity | `0xdb76a20997b36f62bf5658aac75e7c7ce8629a5a` |
| IntentManager | `0xb6b6f495bfb1721e93370962589efcc3279f88e7` |

---

## Project Structure

```
frontend/lib/
├── contracts/
│   ├── abis.ts       # Contract ABIs for all 6 contracts + ERC20
│   └── addresses.ts  # Contract addresses by chain ID
├── hooks/
│   ├── index.ts           # Re-exports all hooks
│   ├── useIntentManager.ts # IntentManager contract hooks
│   └── useSwap.ts         # AMM contract hooks
└── wagmi/
    ├── config.ts     # Wagmi configuration
    └── providers.tsx # Web3Provider wrapper
```

---

## Available Hooks

### Intent Management

```typescript
import { 
    useCreateIntent, 
    useTraderIntents, 
    useIntent, 
    useCancelIntent,
    useApproveToken,
    useTokenBalance 
} from "@/lib/hooks";

// Create a new intent
const { createIntent, isPending, isSuccess } = useCreateIntent(11155111);

// Get user's intents
const { data: intentHashes } = useTraderIntents(11155111, userAddress);

// Get single intent details
const { data: intent } = useIntent(11155111, intentHash);

// Cancel an intent
const { cancelIntent } = useCancelIntent(11155111);
```

### Swap Operations

```typescript
import { 
    useStableswapQuote, 
    useStableswapSwap,
    useConcentratedLiquidityQuote,
    useConcentratedLiquiditySwap,
    useStableswapPool,
} from "@/lib/hooks";

// Get quote from StableswapAMM
const { data: amountOut } = useStableswapQuote(11155111, poolId, tokenIn, amountIn);

// Execute swap
const { swap, isPending } = useStableswapSwap(11155111);
```

---

## Usage Examples

### Creating an Intent

```typescript
"use client";
import { useAccount } from "wagmi";
import { useCreateIntent, useApproveToken } from "@/lib/hooks";
import { parseUnits } from "viem";

function CreateIntentButton() {
    const { address } = useAccount();
    const { createIntent, isPending, isSuccess } = useCreateIntent(11155111);
    const { approve } = useApproveToken();

    const handleCreate = async () => {
        // First approve token spending
        await approve(
            tokenInAddress,
            CONTRACT_ADDRESSES[11155111].intentManager,
            parseUnits("100", 18)
        );

        // Then create intent
        await createIntent({
            tokenIn: tokenInAddress,
            amountIn: parseUnits("100", 18),
            tokenOut: tokenOutAddress,
            minAmountOut: parseUnits("99", 18),
            recipient: address!,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
        });
    };

    return (
        <button onClick={handleCreate} disabled={isPending}>
            {isPending ? "Creating..." : "Create Intent"}
        </button>
    );
}
```

### Getting Swap Quote

```typescript
"use client";
import { useStableswapQuote } from "@/lib/hooks";
import { parseUnits, formatUnits } from "viem";

function SwapQuote({ poolId, tokenIn, amountIn }) {
    const { data: amountOut, isLoading } = useStableswapQuote(
        11155111,
        poolId,
        tokenIn,
        parseUnits(amountIn, 18)
    );

    if (isLoading) return <div>Loading quote...</div>;

    return (
        <div>
            Expected output: {formatUnits(amountOut || 0n, 18)}
        </div>
    );
}
```

---

## Chain Configuration

The frontend supports the following chains:

- **Sepolia** (11155111) - Ethereum testnet
- **Polygon Amoy** (80002) - Polygon testnet

Chain switching is handled by the `WalletConnect` component in the navigation.

---

## Block Explorers

- **Sepolia**: https://sepolia.etherscan.io
- **Polygon Amoy**: https://amoy.polygonscan.com

---

## Getting Testnet Tokens

- **Sepolia ETH**: https://sepoliafaucet.com
- **Polygon Amoy POL**: https://faucet.polygon.technology