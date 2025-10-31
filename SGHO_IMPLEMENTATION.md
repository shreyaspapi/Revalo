# sGHO (Savings GHO) Implementation Guide

## Summary

This document explains how sGHO (Savings GHO) balance and APY are fetched in this application.

## What is sGHO?

sGHO (Savings GHO) is Aave's staking token for GHO stablecoin. Users can stake their GHO tokens to receive sGHO, which earns yield through weekly reward distributions from the Aave Merit program.

## Implementation Status

### ✅ What's Working

1. **sGHO Balance Fetching** - Fully implemented using Aave GraphQL API
   - Query: `savingsGhoBalance`
   - Returns: User balance, USD value, price per token
   - Location: `src/lib/aave/sGhoService.ts`

2. **Integration with Aave Service** - Complete
   - `getGHOData()` method uses sGHO service
   - `getStakingData()` method uses sGHO service
   - Location: `src/lib/aave/aaveService.ts`

### ⚠️ Known Limitation: sGHO APY

**The sGHO APY is NOT available through the Aave GraphQL API.**

According to Aave Discord support:
- APY is annualized from weekly distribution schedule
- Rewards accrue continuously in background
- Rewards become claimable only after each round (weekly)
- No direct API endpoint for current APY rate

**Current Status**: APY shows as "N/A%"

## GraphQL API Queries

### 1. Get sGHO Balance

```graphql
query GetSavingsGhoBalance($userAddress: EvmAddress!) {
  savingsGhoBalance(
    request: { user: $userAddress }
  ) {
    usdPerToken
    amount {
      raw
      value
      decimals
    }
    usd
  }
}
```

**Response Example:**
```json
{
  "savingsGhoBalance": {
    "usdPerToken": "1",
    "amount": {
      "raw": "12606700549702153676227",
      "value": "12606.700549702153676227",
      "decimals": 18
    },
    "usd": "12606.700549702153676227"
  }
}
```

### 2. Get Claimable Merit Rewards (Optional)

```graphql
query GetUserMeritRewards($userAddress: EvmAddress!) {
  userMeritRewards(
    request: { user: $userAddress, chainId: 1 }
  ) {
    chain
    claimable {
      currency {
        symbol
        name
      }
      amount {
        value
      }
    }
  }
}
```

This shows weekly GHO rewards that can be claimed, but not the APY rate.

## Options to Get sGHO APY

Since the APY is not available from the API, here are your options:

### Option A: Hardcoded/Config Value (Recommended for MVP)

**Pros:**
- Simple and fast
- No additional API calls
- Reliable

**Cons:**
- Needs manual updates periodically
- Not real-time

**Implementation:**
```typescript
// In src/lib/aave/sGhoService.ts
export function getEstimatedSGhoAPY(): string {
  const ESTIMATED_SGHO_APY = '6.5'; // Update this periodically
  return ESTIMATED_SGHO_APY;
}
```

Check current APY at: https://app.aave.com/

### Option B: On-Chain Contract Calls

**Pros:**
- Real-time data
- Accurate

**Cons:**
- Requires RPC calls
- More complex
- Need to know sGHO contract ABI

**Implementation:**
```typescript
// Read from sGHO contract:
// - Get current reward rate per second
// - Get total sGHO supply
// - Calculate: (rewardRate * 31536000 / totalSupply) * 100
```

sGHO Contract: `0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d` (Ethereum Mainnet)

### Option C: Scrape Aave Frontend

**Not Recommended:**
- Fragile and may break
- Against terms of service
- Rate limiting issues

### Option D: Use Aave Subgraph

**Pros:**
- Accurate historical data
- Can calculate average APY

**Cons:**
- Complex queries
- May not have real-time APY
- Additional dependency

## Testing

A test script is provided: `test-sgho-working.js`

Run it:
```bash
node test-sgho-working.js
```

This will:
1. Fetch sGHO balance for a test address
2. Show claimable merit rewards
3. Demonstrate the working implementation

## Files Modified

1. **Created:**
   - `src/lib/aave/sGhoService.ts` - New service for sGHO GraphQL queries

2. **Updated:**
   - `src/lib/aave/aaveService.ts` - Integrated sGHO service into existing methods

3. **Test Files:**
   - `test-sgho-working.js` - Working test demonstrating the solution

## Recommendation

For your production app, I recommend:

1. **Short-term (MVP):**
   - Keep APY as "N/A%" with a note: "APY varies weekly based on GHO staking rewards"
   - This is honest and transparent to users

2. **Medium-term:**
   - Hardcode a typical APY value (5-8%)
   - Add a note: "APY: ~6.5% (varies weekly)"
   - Update this value weekly or monthly

3. **Long-term:**
   - Implement on-chain reading from sGHO contract
   - Calculate APY in real-time
   - Cache the result for performance

## API Endpoint

Aave GraphQL API: `https://api.v3.aave.com/graphql`

## References

- Aave Documentation: https://docs.aave.com/
- Aave App: https://app.aave.com/
- Aave Discord: Confirmed APY is calculated from weekly distributions, not available via API

## Conclusion

The implementation successfully fetches sGHO balance and USD value. The APY limitation is a known issue with the Aave API itself, not with our implementation. For production use, displaying "N/A%" or a hardcoded estimated value is acceptable and transparent.

