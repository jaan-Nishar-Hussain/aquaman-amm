# **AQUA0 PRD - Simplified Version (No World Chain/MiniKit)**
## **Product Requirements Document**

---

## **Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-01-11 | Engineering Team | Simplified PRD - Sepolia + Polygon Only |

---

## **Table of Contents**

### **Part 1: Core Architecture**
1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Smart Contract Specifications](#4-smart-contract-specifications)

### **Part 2: Frontend & Integration**
5. [Frontend Architecture](#5-frontend-architecture)
6. [Wagmi Integration](#6-wagmi-integration)
7. [Testing Strategy](#7-testing-strategy)

### **Part 3: Deployment**
8. [Deployment Pipeline](#8-deployment-pipeline)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Production Readiness](#10-production-readiness)

---

# **PART 1: CORE ARCHITECTURE**

---

# **1. Executive Summary**

## **1.1 Product Vision**

Aqua0 is a **capital-efficient decentralized exchange** that enables liquidity providers to create **personal trading strategies** without locking tokens in shared pools. Built on **Sepolia** and **Polygon Amoy** testnets with standard wallet integration. 

## **1.2 Key Innovations**

✅ **Virtual Liquidity**:  Tokens stay in LP wallets, tracked virtually  
✅ **Strategy-Based**:  Each LP has independent strategies (no shared pools)  
✅ **70% Gas Savings**: Compared to traditional AMMs  
✅ **Multi-Chain**:  Deploy on Sepolia, trade on Polygon (or vice versa)  
✅ **Standard Wallets**: MetaMask, WalletConnect, Coinbase Wallet

## **1.3 Success Metrics**

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Total Value Locked | $10K testnet | $100K mainnet |
| Active Strategies | 20 | 500 |
| Daily Swaps | 50 | 1,000 |
| Average Gas Cost | <120k | <100k |

---

# **2. Product Overview**

## **2.1 Supported Chains**

| Chain | Chain ID | Purpose | RPC Endpoint |
|-------|----------|---------|--------------|
| **Sepolia** | 11155111 | Primary execution layer | `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY` |
| **Polygon Amoy** | 80002 | Secondary execution layer | `https://rpc-amoy.polygon.technology` |

## **2.2 Core Features**

### **Feature 1: Virtual Liquidity (No Pools)**

```
Traditional AMM: 
LP → Deposits 1000 USDC + 1000 USDT → Pool Contract → LP Token

Aqua0:
LP → Approves Aqua → ship() creates strategy → Tokens stay in LP wallet ✅
```

**Benefits:**
- 70% gas savings (no pool deployment)
- Instant liquidity updates (just call `ship()` again)
- No LP token complexity
- Non-custodial (tokens remain in wallet)

---

### **Feature 2: Dual AMM Strategies**

**StableswapAMM (Curve-style)**
- **Best for:** USDC/USDT, DAI/USDC
- **Formula:** Hybrid constant sum + constant product
- **Slippage:** ~0.1% for typical trades
- **Capital efficiency:** High A parameter = minimal slippage

**ConcentratedLiquiditySwap (Uniswap V3-style)**
- **Best for:** ETH/USDC, WBTC/ETH
- **Formula:** Constant product with range multiplier
- **Slippage:** Depends on price range
- **Capital efficiency:** 2x within 10% range

---

### **Feature 3: Multi-Chain Support (Optional)**

**Single-Chain Mode (Simpler):**
```
LP creates strategy on Sepolia → Traders swap on Sepolia
```

**Multi-Chain Mode (Advanced):**
```
LP creates strategy on Sepolia → Bridge to Polygon → Traders swap on Polygon
```

---

## **2.3 User Personas**

### **Persona 1: Liquidity Provider (Alice)**
- **Profile:** DeFi enthusiast, $5K in stablecoins
- **Goal:** Earn 5-10% APY on idle capital
- **Pain Point:** Traditional AMMs lock tokens, high gas costs
- **Solution:** Create strategy with `ship()`, tokens stay in wallet

**User Journey:**
1. Connect MetaMask
2. Approve USDC and USDT to Aqua contract
3. Create Stableswap strategy (fee: 0.30%, A: 100)
4. Done! Strategy is live, tokens remain in wallet
5. Traders pay fees → LP earns passively
6. Update strategy anytime with `dock()` → `ship()`

---

### **Persona 2: Retail Trader (Bob)**
- **Profile:** Occasional DeFi user, $500 in crypto
- **Goal:** Swap tokens with minimal fees
- **Pain Point:** High slippage on DEXs
- **Solution:** Swap against LP strategies with tight spreads

**User Journey:**
1. Connect wallet
2. Enter swap:  100 USDC → USDT
3. See quote:  Get 99.96 USDT (0.04% fee)
4. Approve USDC
5. Execute swap
6. Receive USDT instantly

---

# **3. Technical Architecture**

## **3.1 System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMPLIFIED ARCHITECTURE                   │
│                  (No World Chain / No MiniKit)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              FRONTEND LAYER                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │ Next. js  │  │  Wagmi   │  │RainbowKit│        │    │
│  │  │   UI     │  │  Hooks   │  │  Wallet  │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │    │
│  │       │             │              │               │    │
│  │       └─────────────┴──────────────┘               │    │
│  └────────────────────────┬───────────────────────────┘    │
│                           │                                │
│  ┌────────────────────────▼───────────────────────────┐   │
│  │         BLOCKCHAIN LAYER (Dual Chain)             │   │
│  │                                                    │   │
│  │  ┌──────────────────┐  ┌──────────────────┐     │   │
│  │  │   Sepolia        │  │  Polygon Amoy    │     │   │
│  │  │  (Chain ID:       │  │  (Chain ID:      │     │   │
│  │  │   11155111)      │  │   80002)         │     │   │
│  │  ├──────────────────┤  ├──────────────────┤     │   │
│  │  │ • Aqua. sol       │  │ • Aqua.sol       │     │   │
│  │  │ • StableswapAMM  │  │ • StableswapAMM  │     │   │
│  │  │ • Concentrated   │  │ • Concentrated   │     │   │
│  │  └──────────────────┘  └──────────────────┘     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## **3.2 Technology Stack**

### **Smart Contracts**

```yaml
Language: Solidity 0.8.30
Framework: Foundry
Libraries: 
  - OpenZeppelin v5.1.0
  - 1inch Solidity Utils v6.8.0
Compiler: 
  optimizer: 200 runs
  via_ir: true
  evm_version: paris
```

### **Frontend**

```yaml
Framework: Next.js 16.0.6
Language: TypeScript 5.x
Build:  Next.js build system
State Management: 
  - TanStack Query v5.90.16 (server state)
  - React Context (global state)
Wallet Integration:
  - Wagmi v3.3.1
  - Viem v2.44.1
  - RainbowKit (optional, for better UX)
Styling:
  - Tailwind CSS v4
  - Radix UI (headless components)
```

---

# **4. Smart Contract Specifications**

## **4.1 Contract Hierarchy**

```
Core Protocol (from 1inch Aqua):
├── Aqua.sol                    # Virtual balance tracking
├── AquaApp.sol                 # Base class for AMMs
└── libs/
    ├── Balance.sol             # Balance library
    └── ReentrancyGuard.sol     # Transient lock

Custom AMM Strategies:
├── StableswapAMM.sol           # Curve-style for stables
└── ConcentratedLiquiditySwap.sol  # Uniswap V3-style
```

## **4.2 Core Contract:  Aqua.sol**

### **Purpose**
Central registry for virtual balance tracking.  Enables non-custodial liquidity provision. 

### **Key Concepts**

**Virtual Balances:**
```solidity
// 4D nested mapping
mapping(
    address maker =>        // LP address
    mapping(
        address app =>      // AMM contract (StableswapAMM)
        mapping(
            bytes32 strategyHash =>  // Unique strategy ID
            mapping(
                address token =>     // Token address
                Balance              // {amount, tokensCount}
            )
        )
    )
) private _balances;
```

**Balance Struct:**
```solidity
struct Balance {
    uint248 amount;      // Token amount
    uint8 tokensCount;   // Number of tokens in strategy (for validation)
}
```

---

### **Core Functions**

#### **ship() - Create Strategy**

```solidity
function ship(
    address app,               // AMM contract address
    bytes calldata strategy,   // ABI-encoded strategy struct
    address[] calldata tokens, // Token addresses [USDC, USDT]
    uint256[] calldata amounts // Initial amounts [1000e6, 1000e6]
) external returns (bytes32 strategyHash);
```

**What it does:**
1. Calculate `strategyHash = keccak256(strategy)`
2. Verify strategy doesn't exist (immutable)
3. Transfer tokens from LP to Aqua contract
4. Store virtual balances in `_balances` mapping
5. Emit `Shipped` event
6. Return `strategyHash`

**Example:**
```solidity
// LP creates USDC/USDT stableswap strategy
address[] memory tokens = new address[](2);
tokens[0] = USDC;
tokens[1] = USDT;

uint256[] memory amounts = new uint256[](2);
amounts[0] = 1000e6;  // 1000 USDC
amounts[1] = 1000e6;  // 1000 USDT

bytes32 hash = aqua.ship(
    address(stableswapAMM),
    abi.encode(strategy),  // Strategy struct encoded
    tokens,
    amounts
);
```

---

#### **dock() - Withdraw Strategy**

```solidity
function dock(
    address app,
    bytes32 strategyHash,
    address[] calldata tokens
) external;
```

**What it does:**
1. Verify caller is strategy owner (maker)
2. Transfer all tokens back to LP
3. Mark strategy as docked (tokensCount = 0xff)
4. Emit `Docked` event

**Use cases:**
- Withdraw liquidity
- Update strategy parameters (dock → ship new one)
- Exit position

---

#### **pull() - AMM Pulls Tokens**

```solidity
function pull(
    address maker,
    bytes32 strategyHash,
    address token,
    uint256 amount,
    address to
) external;
```

**What it does:**
1. Called by AMM during swap
2. Decrease virtual balance
3. Transfer tokens from Aqua to recipient
4. Emit `Pulled` event

**Example (internal AMM call):**
```solidity
// AMM needs to send 99.96 USDT to trader
AQUA.pull(
    strategy.maker,    // LP address
    strategyHash,
    USDT,              // Token to pull
    99.96e6,           // Amount
    trader             // Recipient
);
```

---

#### **push() - Deposit Tokens During Swap**

```solidity
function push(
    address maker,
    address app,
    bytes32 strategyHash,
    address token,
    uint256 amount
) external;
```

**What it does:**
1. Called by trader (via callback)
2. Increase virtual balance
3. Transfer tokens from trader to Aqua
4. Emit `Pushed` event

**Example (trader callback):**
```solidity
// Trader sends 100 USDC to complete swap
function stableswapCallback(... ) external override {
    IERC20(tokenIn).approve(address(aqua), amountIn);
    aqua.push(maker, app, strategyHash, tokenIn, amountIn);
}
```

---

#### **safeBalances() - Query Strategy Balances**

```solidity
function safeBalances(
    address maker,
    address app,
    bytes32 strategyHash,
    address token0,
    address token1
) external view returns (uint256 balance0, uint256 balance1);
```

**What it does:**
1. Load both token balances
2. Verify both tokens are part of active strategy
3. Revert if strategy is docked or tokens invalid
4. Return balances

**Why "safe"? **
- Validates tokens belong to same strategy
- Prevents reading wrong balances
- Used by AMMs to ensure consistency

---

## **4.3 AMM Contract: StableswapAMM.sol**

### **Purpose**
Curve-style AMM optimized for stablecoin pairs (USDC/USDT, DAI/USDC).

### **Strategy Struct**

```solidity
struct Strategy {
    address maker;                  // LP address (required)
    address token0;                 // First token (e.g., USDC)
    address token1;                 // Second token (e.g., USDT)
    uint256 feeBps;                 // Fee in basis points (30 = 0.30%)
    uint256 amplificationFactor;    // A parameter (100 = very stable)
    bytes32 salt;                   // Nonce for multiple strategies
}
```

### **Constants**

```solidity
uint256 internal constant BPS_BASE = 10_000;      // 100%
uint256 internal constant PRECISION = 1e18;       // Fixed-point
```

### **Core Formula**

```solidity
function _quoteExactIn(
    uint256 feeBps,
    uint256 amplificationFactor,
    uint256 balanceIn,
    uint256 balanceOut,
    uint256 amountIn
) internal pure returns (uint256 amountOut) {
    // 1. Apply fee
    uint256 amountInWithFee = amountIn * (BPS_BASE - feeBps) / BPS_BASE;
    
    // 2. Calculate weight based on A
    uint256 weight = amplificationFactor * PRECISION / (amplificationFactor + 1);
    
    // 3. Constant sum component (1: 1 swap)
    uint256 constantSumOut = amountInWithFee;
    
    // 4. Constant product component (x * y = k)
    uint256 constantProductOut = 
        (amountInWithFee * balanceOut) / (balanceIn + amountInWithFee);
    
    // 5. Weighted average
    amountOut = (weight * constantSumOut + (PRECISION - weight) * constantProductOut) 
                / PRECISION;
}
```

**Example Calculation:**

```
Input: 1000 USDC
Balances: 10,000 USDC, 10,000 USDT
Fee: 0.30% (30 bps)
A: 100

Step 1: amountInWithFee = 1000 * 9970 / 10000 = 997 USDC
Step 2: weight = 100 * 1e18 / 101 = 0.99e18 (99%)
Step 3: constantSumOut = 997 USDT
Step 4: constantProductOut = (997 * 10000) / (10000 + 997) = 906 USDT
Step 5: amountOut = (0.99 * 997 + 0.01 * 906) = 996 USDT

Output: 996 USDT (0.4% slippage total)
```

---

### **Swap Functions**

#### **swapExactIn() - Execute Swap**

```solidity
function swapExactIn(
    Strategy calldata strategy,
    bool zeroForOne,           // true = token0→token1, false = token1→token0
    uint256 amountIn,
    uint256 amountOutMin,      // Slippage protection
    address to,                // Recipient
    bytes calldata takerData   // Optional callback data
) external 
  nonReentrantStrategy(keccak256(abi.encode(strategy)))
  returns (uint256 amountOut);
```

**Execution Flow:**

```solidity
1. Calculate strategyHash
2. Determine tokenIn/tokenOut from zeroForOne
3. Get balances from Aqua. safeBalances()
4. Calculate amountOut using _quoteExactIn()
5. Check amountOut >= amountOutMin (revert if not)
6. AQUA.pull(maker, hash, tokenOut, amountOut, to)  // Send to trader
7. Callback: IStableswapCallback(msg.sender).stableswapCallback(...)
8.  Verify trader deposited via _safeCheckAquaPush()
9. Return amountOut
```

**Callback Pattern:**

```solidity
interface IStableswapCallback {
    function stableswapCallback(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address maker,
        address app,
        bytes32 strategyHash,
        bytes calldata takerData
    ) external;
}

// Trader implementation:
contract MyTrader is IStableswapCallback {
    function stableswapCallback(
        address tokenIn,
        address,      // tokenOut (unused)
        uint256 amountIn,
        uint256,      // amountOut (unused)
        address maker,
        address app,
        bytes32 strategyHash,
        bytes calldata
    ) external override {
        // Complete the swap by depositing tokenIn
        IERC20(tokenIn).approve(address(aqua), amountIn);
        aqua.push(maker, app, strategyHash, tokenIn, amountIn);
    }
}
```

---

## **4.4 AMM Contract: ConcentratedLiquiditySwap.sol**

### **Purpose**
Uniswap V3-style AMM with price range concentration for volatile pairs.

### **Strategy Struct**

```solidity
struct Strategy {
    address maker;
    address token0;
    address token1;
    uint256 feeBps;
    uint256 priceLower;    // Min price (token1/token0) * 1e18
    uint256 priceUpper;    // Max price (token1/token0) * 1e18
    bytes32 salt;
}
```

### **Price Range System**

**Current Price:**
```solidity
uint256 currentPrice = (balanceOut * PRICE_PRECISION) / balanceIn;
```

**Range Multiplier:**
```solidity
function _calculateRangeMultiplier(
    uint256 priceLower,
    uint256 priceUpper
) internal pure returns (uint256 multiplier) {
    uint256 priceRange = priceUpper - priceLower;
    
    // Tight range (≤10% width): 2x capital efficiency
    if (priceRange <= priceUpper / 10) {
        return 2 * PRICE_PRECISION;
    }
    // Medium range (≤50% width): 1.5x
    else if (priceRange <= priceUpper / 2) {
        return (3 * PRICE_PRECISION) / 2;
    }
    // Wide range (>50%): 1x (standard AMM)
    else {
        return PRICE_PRECISION;
    }
}
```

**Example (ETH/USDC):**

| Price Range | Range Width | Multiplier | Effective Liquidity |
|-------------|-------------|------------|---------------------|
| $1800-$2000 | 11% | 1.5x | $10k acts like $15k |
| $1900-$2100 | 10% | 2x | $10k acts like $20k |
| $1000-$3000 | 200% | 1x | $10k acts like $10k |

---

### **Core Formula**

```solidity
function _quoteExactIn(
    Strategy calldata strategy,
    uint256 balanceIn,
    uint256 balanceOut,
    uint256 amountIn,
    bool zeroForOne
) internal pure returns (uint256 amountOut) {
    // 1. Verify price is in range
    uint256 currentPrice = (balanceOut * PRICE_PRECISION) / balanceIn;
    require(
        currentPrice >= strategy.priceLower && 
        currentPrice <= strategy.priceUpper,
        "Price out of range"
    );
    
    // 2. Apply fee
    uint256 amountInWithFee = amountIn * (BPS_BASE - strategy.feeBps) / BPS_BASE;
    
    // 3. Get range multiplier
    uint256 rangeMultiplier = _calculateRangeMultiplier(
        strategy.priceLower,
        strategy.priceUpper
    );
    
    // 4. Amplify balances
    uint256 effectiveBalanceIn = balanceIn * rangeMultiplier / PRICE_PRECISION;
    uint256 effectiveBalanceOut = balanceOut * rangeMultiplier / PRICE_PRECISION;
    
    // 5. Constant product formula
    amountOut = (amountInWithFee * effectiveBalanceOut) / 
                (effectiveBalanceIn + amountInWithFee);
}
```

---

# **PART 2:  FRONTEND & INTEGRATION**

---

# **5. Frontend Architecture**

## **5.1 Project Structure**

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── swap/
│   │   └── page.tsx               # Swap interface
│   ├── liquidity/
│   │   ├── page.tsx               # LP dashboard
│   │   └── create/
│   │       └── page.tsx           # Create strategy
│   └── components/
│       ├── Navigation.tsx         # Top nav
│       ├── WalletConnect.tsx      # Wallet button
│       ├── StrategyForm.tsx       # Create strategy form
│       └── SwapForm.tsx           # Swap interface
│
├── lib/
│   ├── wagmi/
│   │   ├── config.ts              # Wagmi configuration
│   │   └── providers.tsx          # Providers wrapper
│   ├── contracts/
│   │   ├── addresses.ts           # Contract addresses
│   │   ├── abis.ts                # Contract ABIs
│   │   └── constants.ts           # Chain constants
│   ├── hooks/
│   │   ├── useAqua.ts             # Aqua contract hooks
│   │   ├── useSwap.ts             # Swap execution hooks
│   │   └── useStrategy.ts         # Strategy management
│   └── utils/
│       ├── formatters.ts          # Number formatting
│       └── validators.ts          # Input validation
│
├── . env.local                     # Environment variables
├── package. json
├── next.config.ts
└── tailwind.config. ts
```

---

## **5.2 Component Architecture**

### **Root Layout**

```typescript
// app/layout.tsx
import { Web3Provider } from '@/lib/wagmi/providers';

export default function RootLayout({ children }: { children: React. ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

### **Providers Setup**

```typescript
// lib/wagmi/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi/config";
import { useState, type ReactNode } from "react";

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60_000, // 1 minute
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
```

---

# **6. Wagmi Integration**

## **6.1 Wagmi Configuration**

```typescript
// lib/wagmi/config. ts
import { http, createConfig } from 'wagmi';
import { sepolia, polygonAmoy } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect project ID (get from https://cloud.walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [sepolia, polygonAmoy],
  connectors: [
    injected(),  // MetaMask, etc.
    walletConnect({ projectId }),  // WalletConnect
    coinbaseWallet({ appName: 'Aqua0' }),  // Coinbase Wallet
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC),
    [polygonAmoy. id]: http(process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC),
  },
  ssr: false,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
```

---

## **6.2 Contract Configuration**

### **Contract Addresses**

```typescript
// lib/contracts/addresses.ts
import { Address } from 'viem';
import { sepolia, polygonAmoy } from 'wagmi/chains';

export const CONTRACTS = {
  // Sepolia
  [sepolia.id]: {
    aqua: process.env.NEXT_PUBLIC_AQUA_SEPOLIA as Address,
    stableswap: process.env.NEXT_PUBLIC_STABLESWAP_SEPOLIA as Address,
    concentrated: process.env.NEXT_PUBLIC_CONCENTRATED_SEPOLIA as Address,
  },
  // Polygon Amoy
  [polygonAmoy.id]:  {
    aqua: process. env.NEXT_PUBLIC_AQUA_AMOY as Address,
    stableswap: process.env.NEXT_PUBLIC_STABLESWAP_AMOY as Address,
    concentrated: process.env.NEXT_PUBLIC_CONCENTRATED_AMOY as Address,
  },
} as const;

export const TOKENS = {
  [sepolia.id]: {
    USDC: '0x.. .' as Address,  // Sepolia USDC
    USDT: '0x...' as Address,  // Sepolia USDT
    WETH: '0x...' as Address,  // Sepolia WETH
  },
  [polygonAmoy.id]: {
    USDC: '0x...' as Address,  // Polygon USDC
    USDT: '0x...' as Address,  // Polygon USDT
    WMATIC: '0x...' as Address,  // Polygon WMATIC
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACTS;
```

---

### **Contract ABIs**

```typescript
// lib/contracts/abis.ts

// Extract from compiled contracts: 
// forge build
// cat out/Aqua.sol/Aqua.json | jq '.abi' > abis/Aqua.json

export const AquaABI = [
  {
    type: 'function',
    name: 'ship',
    inputs: [
      { name: 'app', type: 'address' },
      { name: 'strategy', type: 'bytes' },
      { name: 'tokens', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
    ],
    outputs: [{ name: 'strategyHash', type: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type:  'function',
    name:  'dock',
    inputs: [
      { name: 'app', type: 'address' },
      { name: 'strategyHash', type: 'bytes32' },
      { name:  'tokens', type: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type:  'function',
    name:  'safeBalances',
    inputs:  [
      { name: 'maker', type: 'address' },
      { name: 'app', type: 'address' },
      { name: 'strategyHash', type: 'bytes32' },
      { name:  'token0', type: 'address' },
      { name: 'token1', type:  'address' },
    ],
    outputs: [
      { name: 'balance0', type: 'uint256' },
      { name: 'balance1', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // ... rest of ABI
] as const;

export const StableswapABI = [
  {
    type: 'function',
    name: 'quoteExactIn',
    inputs: [
      {
        name: 'strategy',
        type: 'tuple',
        components: [
          { name: 'maker', type: 'address' },
          { name: 'token0', type: 'address' },
          { name: 'token1', type: 'address' },
          { name: 'feeBps', type: 'uint256' },
          { name:  'amplificationFactor', type: 'uint256' },
          { name: 'salt', type: 'bytes32' },
        ],
      },
      { name: 'zeroForOne', type: 'bool' },
      { name:  'amountIn', type:  'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability:  'view',
  },
  {
    type: 'function',
    name: 'swapExactIn',
    inputs: [
      { name: 'strategy', type:  'tuple' /* ... */ },
      { name: 'zeroForOne', type: 'bool' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'to', type:  'address' },
      { name: 'takerData', type: 'bytes' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  // ... rest of ABI
] as const;

export const ERC20ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type:  'function',
    name:  'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability:  'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;
```

---

## **6.3 React Hooks**

### **useStrategy Hook - Create & Manage Strategies**

```typescript
// lib/hooks/useStrategy.ts
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useChainId } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { AquaABI, StableswapABI } from '@/lib/contracts/abis';
import { encodeAbiParameters, keccak256, parseUnits } from 'viem';

export interface CreateStrategyParams {
  type: 'stableswap' | 'concentrated';
  token0Symbol: string;
  token1Symbol: string;
  feeBps: number;  // 30 = 0.30%
  amplificationFactor?:  number;  // For stableswap
  priceLower?: string;  // For concentrated
  priceUpper?:  string;  // For concentrated
  amounts: [string, string];  // Human-readable amounts
}

export function useCreateStrategy() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data:  hash, isPending } = useWriteContract();
  const { isLoading:  isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createStrategy = async (params: CreateStrategyParams) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
    if (!contracts) throw new Error('Unsupported chain');

    // Get token addresses
    const token0 = getTokenAddress(chainId, params.token0Symbol);
    const token1 = getTokenAddress(chainId, params. token1Symbol);

    // Build strategy struct
    let encodedStrategy: `0x${string}`;
    
    if (params. type === 'stableswap') {
      encodedStrategy = encodeAbiParameters(
        [
          { type: 'address', name: 'maker' },
          { type: 'address', name: 'token0' },
          { type: 'address', name: 'token1' },
          { type: 'uint256', name: 'feeBps' },
          { type: 'uint256', name: 'amplificationFactor' },
          { type: 'bytes32', name: 'salt' },
        ],
        [
          address,
          token0,
          token1,
          BigInt(params.feeBps),
          BigInt(params.amplificationFactor || 100),
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ]
      );
    } else {
      // Concentrated liquidity
      encodedStrategy = encodeAbiParameters(
        [
          { type: 'address', name: 'maker' },
          { type: 'address', name: 'token0' },
          { type: 'address', name: 'token1' },
          { type: 'uint256', name: 'feeBps' },
          { type: 'uint256', name: 'priceLower' },
          { type: 'uint256', name: 'priceUpper' },
          { type: 'bytes32', name: 'salt' },
        ],
        [
          address,
          token0,
          token1,
          BigInt(params.feeBps),
          parseUnits(params.priceLower || '1', 18),
          parseUnits(params.priceUpper || '2', 18),
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ]
      );
    }

    // Parse amounts (assuming 6 decimals for stablecoins)
    const amounts = [
      parseUnits(params.amounts[0], 6),
      parseUnits(params.amounts[1], 6),
    ];

    // Call ship()
    writeContract({
      address: contracts. aqua,
      abi: AquaABI,
      functionName: 'ship',
      args: [
        params.type === 'stableswap' ?  contracts.stableswap : contracts. concentrated,
        encodedStrategy,
        [token0, token1],
        amounts,
      ],
    });

    // Calculate strategy hash
    const strategyHash = keccak256(encodedStrategy);
    return { strategyHash };
  };

  return {
    createStrategy,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Helper function
function getTokenAddress(chainId:  number, symbol: string): `0x${string}` {
  const tokens = TOKENS[chainId as keyof typeof TOKENS];
  return tokens[symbol as keyof typeof tokens];
}
```

---

### **useSwap Hook - Execute Swaps**

```typescript
// lib/hooks/useSwap.ts
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { StableswapABI, AquaABI } from '@/lib/contracts/abis';
import { parseUnits } from 'viem';

export interface SwapParams {
  strategy: StableswapStrategy;
  zeroForOne:  boolean;
  amountIn:  string;  // Human-readable
  slippageBps: number;  // 50 = 0.5%
}

export interface StableswapStrategy {
  maker: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  feeBps: bigint;
  amplificationFactor: bigint;
  salt:  `0x${string}`;
}

// Get quote
export function useSwapQuote(
  strategy: StableswapStrategy | undefined,
  zeroForOne:  boolean,
  amountIn:  string
) {
  const chainId = useChainId();
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];

  const amountInParsed = amountIn ?  parseUnits(amountIn, 6) : 0n;

  const { data: amountOut, isLoading } = useReadContract({
    address: contracts?. stableswap,
    abi: StableswapABI,
    functionName: 'quoteExactIn',
    args: strategy && amountIn ? [strategy, zeroForOne, amountInParsed] : undefined,
    query: {
      enabled: !! strategy && !!amountIn && parseFloat(amountIn) > 0,
      staleTime: 5000,  // 5 seconds
    },
  });

  return {
    amountOut,
    isLoading,
    formattedOutput: amountOut ? (Number(amountOut) / 1e6).toFixed(6) : '0',
  };
}

// Execute swap
export function useSwap() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContract, data:  hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const executeSwap = async (params: SwapParams) => {
    if (!address) throw new Error('Wallet not connected');
    
    const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS];
    if (!contracts) throw new Error('Unsupported chain');

    const amountIn = parseUnits(params.amountIn, 6);
    
    // Calculate min output with slippage
    const { data: quoteOut } = await useReadContract({
      address: contracts. stableswap,
      abi: StableswapABI,
      functionName: 'quoteExactIn',
      args: [params.strategy, params.zeroForOne, amountIn],
    });

    const minOut = quoteOut!  * BigInt(10000 - params.slippageBps) / 10000n;

    writeContract({
      address: contracts. stableswap,
      abi: StableswapABI,
      functionName: 'swapExactIn',
      args: [
        params.strategy,
        params.zeroForOne,
        amountIn,
        minOut,
        address,  // Send output to self
        '0x',  // No callback data
      ],
    });
  };

  return {
    executeSwap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}
```

---

## **6.4 UI Components**

### **Wallet Connection**

```typescript
// app/components/WalletConnect.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useChainId, useSwitchChain } from 'wagmi';
import { sepolia, polygonAmoy } from 'wagmi/chains';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        {/* Chain Switcher */}
        <select
          value={chainId}
          onChange={(e) => switchChain({ chainId: Number(e.target. value) })}
          className="px-3 py-2 bg-zinc-800 rounded"
        >
          <option value={sepolia.id}>Sepolia</option>
          <option value={polygonAmoy.id}>Polygon Amoy</option>
        </select>

        {/* Address Display */}
        <div className="px-4 py-2 bg-zinc-800 rounded">
          {address?. slice(0, 6)}...{address?.slice(-4)}
        </div>

        {/* Disconnect */}
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700"
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
```

---

### **Strategy Creation Form**

```typescript
// app/components/StrategyForm.tsx
"use client";

import { useState } from 'react';
import { useCreateStrategy } from '@/lib/hooks/useStrategy';
import { toast } from 'sonner';

export function StrategyForm() {
  const { createStrategy, isPending, isConfirming, isSuccess, hash } = useCreateStrategy();
  
  const [strategyType, setStrategyType] = useState<'stableswap' | 'concentrated'>('stableswap');
  const [fee, setFee] = useState(0. 30);
  const [amount0, setAmount0] = useState('1000');
  const [amount1, setAmount1] = useState('1000');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createStrategy({
        type: strategyType,
        token0Symbol: 'USDC',
        token1Symbol: 'USDT',
        feeBps: Math.round(fee * 100),  // 0.30% → 30 bps
        amplificationFactor:  100,
        amounts: [amount0, amount1],
      });

      toast.success('Strategy created! ', {
        description: `Hash: ${result.strategyHash. slice(0, 10)}...`,
      });
    } catch (error:  any) {
      toast.error('Failed to create strategy', {
        description: error.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Strategy Type */}
      <div>
        <label className="block mb-2 font-medium">Strategy Type</label>
        <select
          value={strategyType}
          onChange={(e) => setStrategyType(e.target.value as any)}
          className="w-full px-4 py-2 bg-zinc-800 rounded"
        >
          <option value="stableswap">Stableswap (USDC/USDT)</option>
          <option value="concentrated">Concentrated (ETH/USDC)</option>
        </select>
      </div>

      {/* Fee */}
      <div>
        <label className="block mb-2 font-medium">Fee:  {fee.toFixed(2)}%</label>
        <input
          type="range"
          min="0.01"
          max="1. 5"
          step="0.01"
          value={fee}
          onChange={(e) => setFee(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">USDC Amount</label>
          <input
            type="number"
            value={amount0}
            onChange={(e) => setAmount0(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 rounded"
            placeholder="1000"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">USDT Amount</label>
          <input
            type="number"
            value={amount1}
            onChange={(e) => setAmount1(e.target. value)}
            className="w-full px-4 py-2 bg-zinc-800 rounded"
            placeholder="1000"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full px-6 py-3 bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
      >
        {isPending && 'Confirm in Wallet... '}
        {isConfirming && 'Creating Strategy...'}
        {! isPending && !isConfirming && 'Create Strategy'}
      </button>

      {isSuccess && hash && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded">
          <p className="text-green-400">Strategy created successfully!</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            className="text-cyan-400 hover:underline"
          >
            View on Etherscan →
          </a>
        </div>
      )}
    </form>
  );
}
```

---

### **Swap Interface**

```typescript
// app/components/SwapForm.tsx
"use client";

import { useState } from 'react';
import { useSwap, useSwapQuote } from '@/lib/hooks/useSwap';
import { ArrowDown } from 'lucide-react';

// Mock strategy (in production, fetch from indexer)
const DEMO_STRATEGY = {
  maker: '0x.. .' as const,
  token0: '0x...' as const,
  token1: '0x...' as const,
  feeBps: 30n,
  amplificationFactor:  100n,
  salt: '0x0000000000000000000000000000000000000000000000000000000000000000' as const,
};

export function SwapForm() {
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(50);  // 0.5%

  const { amountOut, formattedOutput, isLoading:  isQuoting } = useSwapQuote(
    DEMO_STRATEGY,
    true,  // USDC → USDT
    amountIn
  );

  const { executeSwap, isPending, isConfirming } = useSwap();

  const handleSwap = async () => {
    await executeSwap({
      strategy:  DEMO_STRATEGY,
      zeroForOne: true,
      amountIn,
      slippageBps: slippage,
    });
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="space-y-4 max-w-lg">
      {/* Input */}
      <div>
        <label className="block mb-2 text-sm text-gray-400">From</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-800 rounded"
          />
          <div className="w-20 flex items-center justify-center bg-zinc-800 rounded">
            USDC
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowDown className="text-gray-400" />
      </div>

      {/* Output */}
      <div>
        <label className="block mb-2 text-sm text-gray-400">To (estimated)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00"
            value={formattedOutput}
            disabled
            className="flex-1 px-4 py-3 bg-zinc-800 rounded opacity-75"
          />
          <div className="w-20 flex items-center justify-center bg-zinc-800 rounded">
            USDT
          </div>
        </div>
      </div>

      {/* Quote Details */}
      {amountOut && (
        <div className="p-4 bg-zinc-800/50 rounded text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Rate:</span>
            <span>1 USDC = {(Number(formattedOutput) / Number(amountIn)).toFixed(4)} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Slippage Tolerance:</span>
            <span>{slippage / 100}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Minimum Received:</span>
            <span>{(Number(formattedOutput) * (1 - slippage / 10000)).toFixed(6)} USDT</span>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={! amountIn || ! amountOut || isLoading || isQuoting}
        className="w-full px-6 py-3 bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50"
      >
        {isPending && 'Confirm in Wallet...'}
        {isConfirming && 'Swapping...'}
        {isQuoting && 'Getting Quote...'}
        {!isLoading && !isQuoting && 'Swap'}
      </button>
    </div>
  );
}
```

---

# **PART 3: DEPLOYMENT**

---

# **7. Testing Strategy**

## **7.1 Contract Testing**

### **Test Setup**

```solidity
// test/StableswapAMM.t.sol
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import {Aqua} from "aqua/Aqua.sol";
import {StableswapAMM} from "../src/StableswapAMM.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract StableswapAMMTest is Test {
    Aqua public aqua;
    StableswapAMM public stableswap;
    MockERC20 public usdc;
    MockERC20 public usdt;
    
    address public maker = address(0x1);
    address public trader = address(0x2);
    
    function setUp() public {
        aqua = new Aqua();
        stableswap = new StableswapAMM(aqua);
        
        usdc = new MockERC20("USDC", "USDC", 6);
        usdt = new MockERC20("USDT", "USDT", 6);
        
        // Mint tokens
        usdc.mint(maker, 10_000e6);
        usdt.mint(maker, 10_000e6);
        usdc.mint(trader, 1_000e6);
        
        // Approvals
        vm.prank(maker);
        usdc.approve(address(aqua), type(uint256).max);
        vm.prank(maker);
        usdt.approve(address(aqua), type(uint256).max);
    }
    
    function testCreateStrategy() public {
        vm.prank(maker);
        
        StableswapAMM.Strategy memory strategy = StableswapAMM.Strategy({
            maker: maker,
            token0: address(usdc),
            token1: address(usdt),
            feeBps: 30,
            amplificationFactor: 100,
            salt: bytes32(0)
        });
        
        address[] memory tokens = new address[](2);
        tokens[0] = address(usdc);
        tokens[1] = address(usdt);
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1000e6;
        amounts[1] = 1000e6;
        
        bytes32 strategyHash = aqua.ship(
            address(stableswap),
            abi.encode(strategy),
            tokens,
            amounts
        );
        
        // Verify balances
        (uint256 balance0, uint256 balance1) = aqua.safeBalances(
            maker,
            address(stableswap),
            strategyHash,
            address(usdc),
            address(usdt)
        );
        
        assertEq(balance0, 1000e6);
        assertEq(balance1, 1000e6);
    }
    
    function testSwap() public {
        // ...  (similar to create, then execute swap)
    }
}
```

**Run Tests:**

```bash
forge test -vv
forge test --match-contract StableswapAMMTest
forge coverage
```

---

## **7.2 Frontend Testing**

### **Component Tests**

```typescript
// __tests__/StrategyForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StrategyForm } from '@/app/components/StrategyForm';

describe('StrategyForm', () => {
  it('should render form fields', () => {
    render(<StrategyForm />);
    
    expect(screen.getByText('Strategy Type')).toBeInTheDocument();
    expect(screen.getByText('Fee:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1000')).toBeInTheDocument();
  });
  
  it('should update fee on slider change', () => {
    render(<StrategyForm />);
    
    const slider = screen. getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.50' } });
    
    expect(screen.getByText(/Fee:  0.50%/)).toBeInTheDocument();
  });
});
```

---

# **8. Deployment Pipeline**

## **8.1 Smart Contract Deployment**

### **Deployment Script**

```solidity
// script/DeployAqua.s.sol
pragma solidity 0.8.30;

import "forge-std/Script.sol";
import {Aqua} from "aqua/Aqua.sol";
import {StableswapAMM} from "../src/StableswapAMM.sol";
import {ConcentratedLiquiditySwap} from "../src/ConcentratedLiquiditySwap.sol";

contract DeployAquaScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy Aqua
        Aqua aqua = new Aqua();
        console.log("Aqua deployed:", address(aqua));
        
        // 2. Deploy StableswapAMM
        StableswapAMM stableswap = new StableswapAMM(aqua);
        console.log("StableswapAMM deployed:", address(stableswap));
        
        // 3. Deploy ConcentratedLiquiditySwap
        ConcentratedLiquiditySwap concentrated = new ConcentratedLiquiditySwap(aqua);
        console.log("ConcentratedLiquiditySwap deployed:", address(concentrated));
        
        vm.stopBroadcast();
        
        // Save addresses
        _saveDeployment(address(aqua), address(stableswap), address(concentrated));
    }
    
    function _saveDeployment(address aqua, address stableswap, address concentrated) internal {
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "aqua": "', vm.toString(aqua), '",\n',
            '  "stableswap": "', vm.toString(stableswap), '",\n',
            '  "concentrated": "', vm. toString(concentrated), '"\n',
            '}'
        ));
        
        vm.writeFile("deployments/latest.json", json);
    }
}
```

**Deploy to Sepolia:**

```bash
# Set environment
export PRIVATE_KEY=0x...
export SEPOLIA_RPC=https://eth-sepolia.g. alchemy.com/v2/YOUR_KEY

# Deploy
forge script script/DeployAqua.s.sol \
  --rpc-url $SEPOLIA_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Output saved to:  deployments/latest.json
```

**Deploy to Polygon Amoy:**

```bash
export POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology

forge script script/DeployAqua.s.sol \
  --rpc-url $POLYGON_AMOY_RPC \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY
```

---

## **8.2 Frontend Deployment**

### **Environment Variables**

```