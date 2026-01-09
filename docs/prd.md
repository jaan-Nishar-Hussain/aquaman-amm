# 🌊 AQUA0 — Protocol‑Grade Technical PRD (Deep)

**Document Type:** Protocol Engineering PRD
**Audience:** Core Blockchain Engineers, Auditors, Infra Teams
**Depth Level:** Low‑level execution, invariants, failure modes

---

## 📑 Table of Contents

A. System Overview & First Principles
B. Module A — Liquidity Accounting Layer (Aqua / 1inch)
C. Module B — Execution Layer (Custom AMMs)
D. Module C — Cross‑Chain Settlement Layer
E. Module D — Intent & Coordination Layer
F. Module E — Frontend, UX & Trust Boundaries
G. Global Security Model & Threat Analysis
H. System Invariants Summary

---

# A️⃣ System Overview & First Principles

## A.1 Core Thesis

Aqua0 separates **liquidity ownership**, **liquidity accounting**, and **trade execution** into independent layers.

Traditional AMMs collapse all three into one contract, causing:

* Capital fragmentation
* Custodial risk
* Cross‑chain composability failure

Aqua0 enforces **strict separation of concerns**.

---

## A.2 Fundamental Design Rule

> **No contract ever owns pooled user funds.**

All value transfers originate from user wallets and are strictly bounded by accounting rules.

---

## A.3 Global Execution Model

A swap in Aqua0 is **not** a single function call.

It is a **distributed transaction** composed of:

1. Intent creation
2. Dual token movement
3. Conditional execution
4. State reconciliation

Atomicity is enforced **logically**, not by single‑chain transactions.

---

# B️⃣ Module A — Liquidity Accounting Layer (Aqua)

## B.1 Purpose

This module is the **financial safety core** of the system.

It answers exactly one question:

> *How much liquidity is a strategy allowed to spend right now?*

It does **not**:

* Price assets
* Execute swaps
* Bridge tokens

---

## B.2 State Model

### Persistent State

```
_balances[maker][app][strategyHash][token] → Balance

Balance {
  amount: uint248,
  tokensCount: uint8
}
```

### Derived State

* Strategy is **active** iff `tokensCount != 0 && tokensCount != DOCKED`
* Strategy identity = `keccak256(abi.encode(strategyStruct))`

---

## B.3 Virtual Balance Definition

A **virtual balance** is a *spending allowance*, not custody.

Formally:

```
virtualBalance ≤ actualWalletBalance
```

This inequality is enforced at execution time via `transferFrom`.

---

## B.4 Core Invariants

### Invariant A1 — No Double Spend

For any `(maker, strategy, token)`:

```
Σ(pull(token)) ≤ initialVirtualBalance(token) + Σ(push(token))
```

This invariant prevents:

* Multi‑strategy over‑allocation
* Re‑entrancy based draining

---

### Invariant A2 — Strategy Immutability

Once `strategyHash` is created:

* Parameters can **never** change
* Only balances evolve

This guarantees deterministic behavior across chains.

---

## B.5 Execution Semantics

### pull()

**Pre‑conditions**:

* Caller is registered app
* Strategy active
* Balance sufficient

**Effects**:

1. Decrease virtual balance
2. Execute `transferFrom(maker → recipient)`

**Failure** → full revert

---

### push()

Used to reconcile token inflow after swap execution.

**Critical Property**:

* push does NOT imply profit
* it restores accounting symmetry

---

## B.6 Trust Boundary

Aqua trusts:

* Its own invariant checks
* Delegate allow‑list

Aqua does **not** trust:

* AMM pricing
* Cross‑chain delivery
* Frontend correctness

---

# C️⃣ Module B — Execution Layer (AMMs)

## C.1 Purpose

This module is **pure math + bounded execution**.

It decides:

* How much tokenOut is owed
* Whether a swap is valid

It does **not**:

* Store liquidity
* Bridge assets
* Track ownership

---

## C.2 General AMM Execution Pattern

```
read balances → compute output → pull(tokenOut) → callback → push(tokenIn)
```

Failure at ANY step reverts entire execution.

---

## C.3 StableswapAMM

### Pricing Model

Hybrid invariant:

```
out = w * constantSum + (1-w) * constantProduct
```

Where:

```
w = A / (A + 1)
```

High A ⇒ low curvature ⇒ minimal slippage

---

### Invariants

* Slippage bounded by fee + curvature
* Total value monotonic (fees extracted)

---

## C.4 ConcentratedLiquiditySwap

### Pricing Constraint

Swap valid iff:

```
priceLower ≤ currentPrice ≤ priceUpper
```

Outside range ⇒ strategy becomes inert.

---

### Capital Efficiency

Effective liquidity multiplier is deterministic and monotonic with range tightness.

This prevents hidden leverage.

---

## C.5 Failure Modes

| Failure              | Effect      |
| -------------------- | ----------- |
| Price out of range   | Hard revert |
| Insufficient balance | Hard revert |
| Callback missing     | Hard revert |

No partial execution possible.

---

# D️⃣ Module C — Cross‑Chain Settlement Layer

## D.1 Purpose

Solve **distributed atomic execution** without shared state.

---

## D.2 State Machine

```
PENDING → PARTIAL → EXECUTED
       ↘ REFUNDED
```

Tokens are escrowed **temporarily**, never pooled.

---

## D.3 Atomicity Model

Atomicity condition:

```
(tokenInArrived AND tokenOutArrived) ⇒ executeSwap
ELSE ⇒ refundAll
```

There is no third state.

---

## D.4 Failure Recovery

| Failure           | Resolution |
| ----------------- | ---------- |
| One token arrives | Wait       |
| Timeout           | Refund     |
| Swap revert       | Refund     |

Funds safety > liveness.

---

# E️⃣ Module D — Intent & Coordination Layer

## E.1 Intent Definition

An intent is a **declarative promise**:

> “I am willing to trade X for ≥Y before time T.”

---

## E.2 Intent Lifecycle

```
CREATED → FULFILLED → SETTLED
     ↘ CANCELLED
```

Only the trader can cancel.

---

## E.3 Invariants

* Trader funds locked exactly once
* Intent can settle at most once
* Expired intents are unfillable

---

## E.4 LP Commitment Model

LP fulfillment is:

* Optional
* Non‑custodial
* Economically incentivized

No slashing. No forced execution.

---

# F️⃣ Module E — Frontend & Trust Boundaries

## F.1 Frontend Role

Frontend is **non‑authoritative**.

It may lie.

Contracts do not trust it.

---

## F.2 User Trust Assumptions

Users trust:

* Aqua invariants
* ERC‑20 correctness

Users do NOT trust:

* UI quotes
* Indexers
* Backend APIs

---

# G️⃣ Global Security Model

## G.1 Threat Classes

| Threat              | Mitigation                |
| ------------------- | ------------------------- |
| Reentrancy          | Pull‑before‑callback      |
| Double spend        | Virtual balance invariant |
| Cross‑chain failure | Refund logic              |
| Malicious UI        | On‑chain checks           |

---

## G.2 What Can Break UX but NOT Funds

* Indexer downtime
* Frontend outage
* Message delay

---

## G.3 What Can Break Funds (Explicit)

* Aqua invariant violation (catastrophic)
* ERC‑20 with broken `transferFrom`

---

# H️⃣ System‑Wide Invariants (Summary)

1. No pooled custody
2. No double spend
3. Strategy immutability
4. Bounded execution
5. Refund > partial success

---

## ✅ Final Definition

> **Aqua0 is a distributed, non‑custodial liquidity execution protocol that enforces strict accounting invariants while enabling cross‑chain, intent‑based swaps without pooled liquidity.**
