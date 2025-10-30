import { BigNumber } from 'ethers';

/**
 * Represents a user's reserve data (token deposited or borrowed)
 */
export interface UserReserveData {
  underlyingAsset: string;
  scaledATokenBalance: string;
  usageAsCollateralEnabledOnUser: boolean;
  stableBorrowRate: string;
  scaledVariableDebt: string;
  principalStableDebt: string;
  stableBorrowLastUpdateTimestamp: number;
}

/**
 * Represents reserve data for a specific asset
 */
export interface ReserveData {
  id: string;
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  liquidityRate: string;
  variableBorrowRate: string;
  stableBorrowRate: string;
  availableLiquidity: string;
  totalPrincipalStableDebt: string;
  totalScaledVariableDebt: string;
  priceInMarketReferenceCurrency: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
}

/**
 * Formatted user summary data
 */
export interface FormattedUserSummary {
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  availableBorrowsUSD: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
  netAPY: number;
}

/**
 * Individual user position (supply or borrow)
 */
export interface UserPosition {
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  apy: string;
  underlyingAsset: string;
  decimals: number;
}

/**
 * Complete Aave portfolio data
 */
export interface AavePortfolio {
  supplies: UserPosition[];
  borrows: UserPosition[];
  totalSupplyUSD: number;
  totalBorrowUSD: number;
  netWorthUSD: number;
  healthFactor: string;
  availableBorrowsUSD: string;
  currentLTV: string;
}

/**
 * GHO specific data
 */
export interface GHOData {
  balance: string;
  balanceUSD: string;
  borrowed: string;
  borrowedUSD: string;
  savingsBalance: string;      // sGHO (Savings GHO) balance
  savingsBalanceUSD: string;   // sGHO balance in USD
  borrowAPY: string;
  supplyAPY: string;
  savingsAPY: string;          // APY earned from sGHO (Savings GHO)
}

/**
 * Savings and Staking data
 */
export interface SavingsStakingData {
  stkAAVE: {
    balance: string;
    balanceUSD: string;
    apy: string;
  };
  sGHO: {
    balance: string;
    balanceUSD: string;
    apy: string;
  };
}

/**
 * Hook return type for loading states
 */
export interface UseAaveDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Aave protocol addresses
 */
export interface AaveAddresses {
  lendingPool: string;
  protocolDataProvider: string;
  priceOracle: string;
  ghoToken?: string;
  stkAAVE?: string;
  stkGHO?: string;
  poolAddressesProvider?: string;
  wrappedTokenGateway?: string;
}

