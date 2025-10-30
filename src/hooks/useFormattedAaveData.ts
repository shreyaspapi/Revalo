'use client';

import { useMemo } from 'react';
import type { AavePortfolio, GHOData, UserPosition } from '@/types/aave';
import {
  formatBalance,
  formatHealthFactor,
  formatLargeUSD,
  formatPercentage,
  formatUSD,
} from '@/lib/aave/utils';

/**
 * Formatted user position with display-ready strings
 */
export interface FormattedUserPosition extends UserPosition {
  balanceFormatted: string; // e.g., "450,334.62"
  balanceUSDFormatted: string; // e.g., "$450,334.62"
  apyFormatted: string; // Already formatted from API
}

/**
 * Formatted portfolio data ready for display
 */
export interface FormattedAavePortfolio {
  supplies: FormattedUserPosition[];
  borrows: FormattedUserPosition[];
  totalSupplyUSD: number;
  totalSupplyUSDFormatted: string;
  totalBorrowUSD: number;
  totalBorrowUSDFormatted: string;
  netWorthUSD: number;
  netWorthUSDFormatted: string;
  healthFactor: string | null;
  healthFactorFormatted: string;
  availableBorrowsUSD: string;
  availableBorrowsUSDFormatted: string;
  currentLTV: string;
  currentLTVFormatted: string;
}

/**
 * Formatted GHO data ready for display
 */
export interface FormattedGHOData {
  balance: string;
  balanceFormatted: string;
  balanceUSD: string;
  balanceUSDFormatted: string;
  borrowed: string;
  borrowedFormatted: string;
  borrowedUSD: string;
  borrowedUSDFormatted: string;
  savingsBalance: string;
  savingsBalanceFormatted: string;
  savingsBalanceUSD: string;
  savingsBalanceUSDFormatted: string;
  borrowAPY: string;
  borrowAPYFormatted: string;
  supplyAPY: string;
  supplyAPYFormatted: string;
  savingsAPY: string;
  savingsAPYFormatted: string;
}

/**
 * Hook to get formatted Aave portfolio data for display
 * Formats raw numbers from the service layer for UI display
 */
export function useFormattedPortfolio(
  portfolio: AavePortfolio | null
): FormattedAavePortfolio | null {
  return useMemo(() => {
    if (!portfolio) return null;

    // Format supplies
    const supplies: FormattedUserPosition[] = portfolio.supplies.map((supply) => ({
      ...supply,
      balanceFormatted: formatBalance(supply.balance, { maxDecimals: 4 }),
      balanceUSDFormatted: formatUSD(supply.balanceUSD, 2),
      apyFormatted: supply.apy,
    }));

    // Format borrows
    const borrows: FormattedUserPosition[] = portfolio.borrows.map((borrow) => ({
      ...borrow,
      balanceFormatted: formatBalance(borrow.balance, { maxDecimals: 4 }),
      balanceUSDFormatted: formatUSD(borrow.balanceUSD, 2),
      apyFormatted: borrow.apy,
    }));

    return {
      supplies,
      borrows,
      totalSupplyUSD: portfolio.totalSupplyUSD,
      totalSupplyUSDFormatted: formatLargeUSD(portfolio.totalSupplyUSD, { compact: false }),
      totalBorrowUSD: portfolio.totalBorrowUSD,
      totalBorrowUSDFormatted: formatLargeUSD(portfolio.totalBorrowUSD, { compact: false }),
      netWorthUSD: portfolio.netWorthUSD,
      netWorthUSDFormatted: formatLargeUSD(portfolio.netWorthUSD, { compact: false }),
      healthFactor: portfolio.healthFactor,
      healthFactorFormatted: formatHealthFactor(portfolio.healthFactor),
      availableBorrowsUSD: portfolio.availableBorrowsUSD,
      availableBorrowsUSDFormatted: formatLargeUSD(portfolio.availableBorrowsUSD, { compact: false }),
      currentLTV: portfolio.currentLTV,
      currentLTVFormatted: portfolio.currentLTV, // Already formatted from API
    };
  }, [portfolio]);
}

/**
 * Hook to get formatted GHO data for display
 */
export function useFormattedGHOData(ghoData: GHOData | null): FormattedGHOData | null {
  return useMemo(() => {
    if (!ghoData) return null;

    return {
      balance: ghoData.balance,
      balanceFormatted: formatBalance(ghoData.balance, { maxDecimals: 4 }),
      balanceUSD: ghoData.balanceUSD,
      balanceUSDFormatted: formatUSD(ghoData.balanceUSD, 2),
      borrowed: ghoData.borrowed,
      borrowedFormatted: formatBalance(ghoData.borrowed, { maxDecimals: 4 }),
      borrowedUSD: ghoData.borrowedUSD,
      borrowedUSDFormatted: formatUSD(ghoData.borrowedUSD, 2),
      savingsBalance: ghoData.savingsBalance,
      savingsBalanceFormatted: formatBalance(ghoData.savingsBalance, { maxDecimals: 4 }),
      savingsBalanceUSD: ghoData.savingsBalanceUSD,
      savingsBalanceUSDFormatted: formatUSD(ghoData.savingsBalanceUSD, 2),
      borrowAPY: ghoData.borrowAPY,
      borrowAPYFormatted: ghoData.borrowAPY, // Already formatted
      supplyAPY: ghoData.supplyAPY,
      supplyAPYFormatted: ghoData.supplyAPY, // Already formatted
      savingsAPY: ghoData.savingsAPY,
      savingsAPYFormatted: formatPercentage(parseFloat(ghoData.savingsAPY)),
    };
  }, [ghoData]);
}

/**
 * Utility function to format a single balance for display
 */
export function formatPositionBalance(balance: string | number, maxDecimals: number = 4): string {
  return formatBalance(balance, { maxDecimals });
}

/**
 * Utility function to format a single USD amount for display
 */
export function formatPositionUSD(amount: string | number): string {
  return formatUSD(amount, 2);
}

