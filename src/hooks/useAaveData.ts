'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type {
  AavePortfolio,
  GHOData,
  StakingData,
  UseAaveDataReturn,
  FormattedUserSummary,
} from '@/types/aave';
import { AaveSubgraphService } from '@/lib/aave/subgraphService';
import { CACHE_TIME, POLLING_INTERVAL } from '@/lib/aave/config';

/**
 * Hook to fetch user's complete Aave portfolio
 */
export function useAavePortfolio(): UseAaveDataReturn<AavePortfolio> {
  const { address } = useAccount();
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
      setError(err as Error);
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
 */
export function useGHOData(): UseAaveDataReturn<GHOData> {
  const { address } = useAccount();
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
 * Hook to fetch staking data (stkAAVE and stkGHO)
 */
export function useStakingData(): UseAaveDataReturn<StakingData> {
  const { address } = useAccount();
  const chainId = useChainId();
  const [data, setData] = useState<StakingData | null>(null);
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
      
      const service = new AaveService(chainId);
      const stakingData = await service.getStakingData(address);
      
      setData(stakingData);
    } catch (err) {
      console.error('Error fetching staking data:', err);
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
 * Hook to fetch user summary
 */
export function useUserSummary(): UseAaveDataReturn<FormattedUserSummary> {
  const { address } = useAccount();
  const chainId = useChainId();
  const [data, setData] = useState<FormattedUserSummary | null>(null);
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
      
      const service = new AaveService(chainId);
      const summary = await service.getUserSummary(address);
      
      setData(summary);
    } catch (err) {
      console.error('Error fetching user summary:', err);
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
 * Combined hook for fetching all Aave data at once
 */
export function useAaveData() {
  const portfolio = useAavePortfolio();
  const ghoData = useGHOData();
  const stakingData = useStakingData();
  const userSummary = useUserSummary();

  return {
    portfolio,
    ghoData,
    stakingData,
    userSummary,
    isLoading:
      portfolio.isLoading ||
      ghoData.isLoading ||
      stakingData.isLoading ||
      userSummary.isLoading,
    hasError:
      !!portfolio.error ||
      !!ghoData.error ||
      !!stakingData.error ||
      !!userSummary.error,
  };
}

