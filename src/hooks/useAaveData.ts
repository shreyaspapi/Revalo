'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import type {
  AavePortfolio,
  GHOData,
  SavingsStakingData,
  UseAaveDataReturn,
} from '@/types/aave';
import { AaveSubgraphService } from '@/lib/aave/subgraphService';
import { POLLING_INTERVAL } from '@/lib/aave/config';

/**
 * Helper hook to get the address to use (test address or connected wallet)
 * Priority: URL param > env var > connected wallet
 */
function useTestAddress(): string | undefined {
  const { address: connectedAddress } = useAccount();
  const searchParams = useSearchParams();
  
  // Check URL parameter first (highest priority)
  const urlTestAddress = searchParams.get('testAddress');
  if (urlTestAddress) {
    console.log('🧪 Using test address from URL:', urlTestAddress);
    return urlTestAddress;
  }
  
  // Check environment variable (second priority)
  const envTestAddress = process.env.NEXT_PUBLIC_TEST_ADDRESS;
  if (envTestAddress && process.env.NODE_ENV === 'development') {
    console.log('🧪 Using test address from env:', envTestAddress);
    return envTestAddress;
  }
  
  // Fall back to connected wallet
  return connectedAddress;
}

/**
 * Hook to fetch user's complete Aave portfolio
 * Supports test mode via URL param: ?testAddress=0x...
 */
export function useAavePortfolio(): UseAaveDataReturn<AavePortfolio> {
  const address = useTestAddress();
  const chainId = useChainId();
  const [data, setData] = useState<AavePortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const service = new AaveSubgraphService(chainId);
      const portfolio = await service.getUserPortfolio(address);
      setData(portfolio);
    } catch (err) {
      console.error('Error fetching Aave portfolio:', err);
      // Preserve the original error for better debugging
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    fetchData();

    // Set up polling for real-time updates
    const interval = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook to fetch GHO specific data
 * Supports test mode via URL param: ?testAddress=0x...
 */
export function useGHOData(): UseAaveDataReturn<GHOData> {
  const address = useTestAddress();
  const chainId = useChainId();
  const [data, setData] = useState<GHOData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const service = new AaveSubgraphService(chainId);
      const ghoData = await service.getGHOData(address);
      setData(ghoData);
    } catch (err) {
      console.error('Error fetching GHO data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook to fetch staking data (stkAAVE only, sGHO is in GHO data)
 * Fetches real balances from staking contracts
 */
export function useStakingData(): UseAaveDataReturn<SavingsStakingData> {
  const address = useTestAddress();
  const [data, setData] = useState<SavingsStakingData | null>(null); // No hardcoded defaults
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!address) {
      setData(null); // No wallet connected, no hardcoded data
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamic import to avoid build issues
      const { getStakingBalances, estimateStakingUSDValue } = await import('@/lib/aave/stakingService');
      
      const balances = await getStakingBalances(address);
      
      // Estimate USD values (you can improve this with real price feeds)
      const usdValues = estimateStakingUSDValue(
        balances.stkAAVE.balanceFormatted,
        230   // AAVE price (you should fetch this from an oracle)
      );

      setData({
        sGHO: { balance: 'N/A', balanceUSD: 'N/A', apy: 'N/A' }, // sGHO data is now in GHO
        stkAAVE: {
          balance: balances.stkAAVE.balanceFormatted,
          balanceUSD: `$${usdValues.stkAAVEUSD.toFixed(2)}`,
          apy: balances.stkAAVE.apy,
        },
      });
    } catch (err) {
      console.error('Error fetching staking data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Combined hook for fetching all Aave data at once
 */
export function useAaveData() {
  const portfolio = useAavePortfolio();
  const ghoData = useGHOData();
  const stakingData = useStakingData();

  return {
    portfolio,
    ghoData,
    stakingData,
    isLoading:
      portfolio.isLoading ||
      ghoData.isLoading ||
      stakingData.isLoading,
    hasError:
      !!portfolio.error ||
      !!ghoData.error ||
      !!stakingData.error,
  };
}

