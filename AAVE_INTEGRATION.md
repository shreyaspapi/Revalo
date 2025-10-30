# Aave Integration Documentation

This document explains how the Aave protocol integration works in Revalo and how to use it.

## Overview

The application integrates with Aave V3 protocol to fetch real-time data about user positions, including:
- Supply positions (deposits)
- Borrow positions
- GHO token data
- Staking positions (stkAAVE, stkGHO)
- Portfolio metrics (total value, net worth, APY, health factor)

## Architecture

### 1. **Types** (`src/types/aave.ts`)
Comprehensive TypeScript interfaces for type safety:
- `AavePortfolio`: Complete user portfolio data
- `UserPosition`: Individual supply/borrow position
- `GHOData`: GHO-specific token data
- `StakingData`: Staking rewards data
- `FormattedUserSummary`: User account summary from Aave

### 2. **Configuration** (`src/lib/aave/config.ts`)
- Network-specific Aave contract addresses (Mainnet, Sepolia)
- RPC endpoint configuration
- Token addresses
- Constants (decimals, cache times, polling intervals)

Key functions:
- `getAaveAddresses(chainId)`: Returns Aave contract addresses for a network
- `getRpcUrl(chainId)`: Returns RPC URL for a network
- `getChainId()`: Returns current chain ID from environment

### 3. **Utilities** (`src/lib/aave/utils.ts`)
Helper functions for data formatting and calculations:
- `formatTokenAmount()`: Format token amounts with proper decimals
- `formatUSD()`: Format USD values as currency
- `formatAPY()`: Format APY percentages
- `calculateNetAPY()`: Calculate weighted net APY
- `estimateAnnualEarnings()`: Estimate annual earnings
- `rayToPercent()`: Convert Aave's ray format to percentages
- `getHealthFactorColor()`: Get color for health factor display

### 4. **Aave Service** (`src/lib/aave/aaveService.ts`)
Core service class for interacting with Aave protocol:

```typescript
class AaveService {
  constructor(chainId: number)
  
  async getUserPortfolio(userAddress: string): Promise<AavePortfolio>
  async getGHOData(userAddress: string): Promise<GHOData | null>
  async getStakingData(userAddress: string): Promise<StakingData>
  async getUserSummary(userAddress: string): Promise<FormattedUserSummary | null>
}
```

**Key Features:**
- Uses Aave's official SDK (@aave/contract-helpers, @aave/math-utils)
- Fetches data from Aave's UiPoolDataProvider
- Formats reserve and user data
- Handles multiple networks
- Calculates USD values and APYs

### 5. **React Hooks** (`src/hooks/useAaveData.ts`)
Custom hooks for fetching Aave data in React components:

#### `useAavePortfolio()`
Fetches complete user portfolio with supplies and borrows.

```typescript
const { data, isLoading, error, refetch } = useAavePortfolio();
```

#### `useGHOData()`
Fetches GHO-specific data (balance, borrowed amount, staking).

```typescript
const { data, isLoading, error, refetch } = useGHOData();
```

#### `useStakingData()`
Fetches staking positions (stkAAVE, stkGHO).

```typescript
const { data, isLoading, error, refetch } = useStakingData();
```

#### `useUserSummary()`
Fetches user account summary.

```typescript
const { data, isLoading, error, refetch } = useUserSummary();
```

#### `useAaveData()`
Combined hook that fetches all data at once.

```typescript
const { 
  portfolio, 
  ghoData, 
  stakingData, 
  userSummary, 
  isLoading, 
  hasError 
} = useAaveData();
```

**Features:**
- Automatic polling for real-time updates (15 seconds)
- Proper loading and error states
- Wallet connection detection
- Type-safe return values

## Components

### PortfolioCard (`src/components/dashboard/portfolio-card.tsx`)
Displays:
- Total net worth
- Net APY (weighted average)
- Estimated annual earnings
- Anti-GHO balance (coming soon)

**States:**
- Loading: Shows spinner
- Error: Shows error message
- Not connected: Prompts wallet connection
- Empty: Shows "no positions" message
- Success: Shows portfolio data

### PositionCards (`src/components/dashboard/position-cards.tsx`)
Displays:
- Total supplied assets
- GHO borrowed
- stkGHO balance

**Features:**
- Shows number of assets supplied
- Displays APY for each position
- Real-time loading indicators

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=1  # 1 for Mainnet, 11155111 for Sepolia

# RPC Endpoints (use your own from Infura/Alchemy)
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Get API Keys

#### RPC Provider (Required)
Choose one:
- **Alchemy**: https://www.alchemy.com/
- **Infura**: https://www.infura.io/
- **QuickNode**: https://www.quicknode.com/

#### WalletConnect Project ID (Required)
1. Go to https://cloud.walletconnect.com/
2. Create a new project
3. Copy the Project ID

### 3. Install Dependencies

```bash
yarn install
```

Key dependencies:
- `@aave/contract-helpers`: Aave protocol interaction
- `@aave/math-utils`: Mathematical utilities for Aave
- `ethers@5.7.2`: Ethereum library
- `wagmi`: React hooks for Ethereum
- `@rainbow-me/rainbowkit`: Wallet connection UI

### 4. Run the Application

```bash
# Development
yarn dev

# Production build
yarn build
yarn start
```

## Usage Examples

### Using Hooks in a Component

```typescript
'use client';

import { useAavePortfolio } from '@/hooks/useAaveData';
import { formatUSD } from '@/lib/aave/utils';

export function MyComponent() {
  const { data: portfolio, isLoading, error } = useAavePortfolio();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!portfolio) return <div>No data</div>;

  return (
    <div>
      <h2>Total Supply: {formatUSD(portfolio.totalSupplyUSD)}</h2>
      <h2>Total Borrow: {formatUSD(portfolio.totalBorrowUSD)}</h2>
      
      <h3>Supplies:</h3>
      {portfolio.supplies.map((supply) => (
        <div key={supply.underlyingAsset}>
          {supply.symbol}: {supply.balance} ({formatUSD(supply.balanceUSD)})
          APY: {supply.apy}%
        </div>
      ))}
    </div>
  );
}
```

### Creating a Custom Aave Service

```typescript
import { AaveService } from '@/lib/aave/aaveService';
import { ChainId } from '@aave/contract-helpers';

// Initialize service
const service = new AaveService(ChainId.mainnet);

// Fetch portfolio
const portfolio = await service.getUserPortfolio('0x...');

// Fetch GHO data
const ghoData = await service.getGHOData('0x...');
```

## Data Flow

1. **User connects wallet** → RainbowKit + Wagmi
2. **Hooks detect address** → `useAccount()` from wagmi
3. **Hooks trigger fetch** → `AaveService` methods called
4. **Service queries blockchain** → Via Aave SDK + Ethers
5. **Data formatted** → Using utility functions
6. **Components update** → React state updates with new data
7. **Polling continues** → Updates every 15 seconds

## Performance Optimizations

1. **Polling**: Data refreshes automatically every 15 seconds
2. **Caching**: React Query caches data for 30 seconds
3. **Memoization**: Complex calculations memoized with `useMemo`
4. **Conditional fetching**: Only fetches when wallet connected
5. **Error handling**: Graceful error states with retry logic

## Testing

### Testing on Sepolia Testnet

1. Set `NEXT_PUBLIC_CHAIN_ID=11155111`
2. Get Sepolia ETH from faucet: https://sepoliafaucet.com/
3. Supply/borrow on Aave Sepolia: https://app.aave.com/
4. View positions in the app

### Testing on Mainnet

1. Set `NEXT_PUBLIC_CHAIN_ID=1`
2. Connect wallet with existing Aave positions
3. View real portfolio data

## Troubleshooting

### "Error fetching portfolio"
- Check RPC URL is valid and has remaining credits
- Verify wallet is connected to correct network
- Check browser console for detailed error messages

### Data not updating
- Verify polling is working (check Network tab in DevTools)
- Check if wallet is still connected
- Try manually calling `refetch()` from hook

### "Aave addresses not configured"
- Verify `NEXT_PUBLIC_CHAIN_ID` is set correctly
- Check if network is supported (Mainnet or Sepolia)

### High RPC costs
- Increase polling interval in `config.ts`
- Use a better RPC provider with higher rate limits
- Implement request caching

## Best Practices

1. **Always handle loading states** - Show skeleton/spinner while fetching
2. **Always handle error states** - Show user-friendly error messages
3. **Check wallet connection** - Verify user is connected before showing data
4. **Format numbers properly** - Use utility functions for consistent formatting
5. **Validate addresses** - Use `isValidAddress()` before API calls
6. **Cache expensive calculations** - Use `useMemo` for derived data
7. **Use TypeScript** - Leverage types for type safety
8. **Handle edge cases** - Zero balances, no positions, network switches

## Future Enhancements

- [ ] Add historical data charts
- [ ] Implement transaction history
- [ ] Add supply/borrow UI
- [ ] Support more networks (Polygon, Arbitrum, Optimism)
- [ ] Add price alerts
- [ ] Implement position management
- [ ] Add liquidation warnings
- [ ] Support Aave V2

## Resources

- [Aave Docs](https://docs.aave.com/)
- [Aave SDK](https://github.com/aave/aave-utilities)
- [Deployed Contracts](https://docs.aave.com/developers/deployed-contracts/v3-mainnet)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check Aave documentation
4. Open an issue on the repository

