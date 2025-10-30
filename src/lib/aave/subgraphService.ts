import { GraphQLClient } from 'graphql-request';
import type {
  AavePortfolio,
  UserPosition,
  GHOData,
} from '@/types/aave';
import { getSubgraphUrl, QUERIES } from './subgraphConfig';
import { formatTokenAmount, formatUSD } from './utils';

/**
 * Subgraph response types
 */
interface SubgraphUserReserve {
  id: string;
  reserve: {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    underlyingAsset: string;
    liquidityRate: string;
    variableBorrowRate: string;
    priceInUsd: string;
  };
  currentATokenBalance: string;
  currentVariableDebt: string;
  currentStableDebt: string;
  liquidityRate: string;
  variableBorrowRate: string;
  usageAsCollateralEnabledOnUser: boolean;
  scaledATokenBalance: string;
  scaledVariableDebt: string;
}

interface SubgraphUserResponse {
  user: {
    id: string;
    reserves: SubgraphUserReserve[];
  } | null;
}

/**
 * Aave Subgraph Service
 * Uses The Graph Protocol - 100% FREE, no API keys needed!
 */
export class AaveSubgraphService {
  private client: GraphQLClient;
  private chainId: number;

  constructor(chainId: number = 1) {
    this.chainId = chainId;
    const subgraphUrl = getSubgraphUrl(chainId);
    this.client = new GraphQLClient(subgraphUrl, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Convert Ray units (27 decimals) to APY percentage
   */
  private rayToAPY(ray: string): string {
    try {
      // Ray has 27 decimals, convert to percentage
      const rayBN = BigInt(ray);
      const RAY = BigInt(10) ** BigInt(27);
      const percentage = Number(rayBN * BigInt(100)) / Number(RAY);
      return percentage.toFixed(2);
    } catch {
      return '0';
    }
  }

  /**
   * Get user's complete Aave portfolio from subgraph
   */
  async getUserPortfolio(userAddress: string): Promise<AavePortfolio> {
    try {
      // Normalize address to lowercase (subgraph uses lowercase)
      const normalizedAddress = userAddress.toLowerCase();

      const response = await this.client.request<SubgraphUserResponse>(
        QUERIES.getUserAccount,
        { userAddress: normalizedAddress }
      );

      if (!response.user) {
        // User has no positions
        return {
          supplies: [],
          borrows: [],
          totalSupplyUSD: 0,
          totalBorrowUSD: 0,
          netWorthUSD: 0,
          healthFactor: '0',
          availableBorrowsUSD: '0',
          currentLTV: '0',
        };
      }

      const userReserves = response.user.reserves;

      // Parse supplies (deposits)
      const supplies: UserPosition[] = [];
      let totalSupplyUSD = 0;

      // Parse borrows
      const borrows: UserPosition[] = [];
      let totalBorrowUSD = 0;

      for (const userReserve of userReserves) {
        const reserve = userReserve.reserve;
        const priceInUsd = parseFloat(reserve.priceInUsd);

        // Check for supply position
        const supplyBalance = BigInt(userReserve.currentATokenBalance || '0');
        if (supplyBalance > 0n) {
          const balance = formatTokenAmount(
            userReserve.currentATokenBalance,
            reserve.decimals
          );
          const balanceNum = parseFloat(balance.replace(/,/g, ''));
          const balanceUSD = balanceNum * priceInUsd;

          supplies.push({
            symbol: reserve.symbol,
            name: reserve.name,
            balance,
            balanceUSD: balanceUSD.toFixed(2),
            apy: this.rayToAPY(userReserve.liquidityRate || reserve.liquidityRate),
            underlyingAsset: reserve.underlyingAsset,
            decimals: reserve.decimals,
          });

          totalSupplyUSD += balanceUSD;
        }

        // Check for borrow position (variable debt)
        const borrowBalance = BigInt(userReserve.currentVariableDebt || '0');
        if (borrowBalance > 0n) {
          const balance = formatTokenAmount(
            userReserve.currentVariableDebt,
            reserve.decimals
          );
          const balanceNum = parseFloat(balance.replace(/,/g, ''));
          const balanceUSD = balanceNum * priceInUsd;

          borrows.push({
            symbol: reserve.symbol,
            name: reserve.name,
            balance,
            balanceUSD: balanceUSD.toFixed(2),
            apy: this.rayToAPY(userReserve.variableBorrowRate || reserve.variableBorrowRate),
            underlyingAsset: reserve.underlyingAsset,
            decimals: reserve.decimals,
          });

          totalBorrowUSD += balanceUSD;
        }
      }

      // Calculate net worth
      const netWorthUSD = totalSupplyUSD - totalBorrowUSD;

      // Calculate health factor (simplified)
      // For accurate health factor, would need collateral factors and liquidation thresholds
      const healthFactor = totalBorrowUSD > 0
        ? (totalSupplyUSD / totalBorrowUSD).toFixed(2)
        : '999';

      // Calculate available borrows (simplified - usually 80% of collateral minus current borrows)
      const availableBorrowsUSD = Math.max(0, totalSupplyUSD * 0.8 - totalBorrowUSD);

      // Calculate current LTV
      const currentLTV = totalSupplyUSD > 0
        ? ((totalBorrowUSD / totalSupplyUSD) * 100).toFixed(2)
        : '0';

      return {
        supplies,
        borrows,
        totalSupplyUSD,
        totalBorrowUSD,
        netWorthUSD,
        healthFactor,
        availableBorrowsUSD: availableBorrowsUSD.toFixed(2),
        currentLTV,
      };
    } catch (error) {
      console.error('Error fetching portfolio from subgraph:', error);
      throw new Error(
        'Unable to fetch portfolio data. Please check your internet connection and try again.'
      );
    }
  }

  /**
   * Get GHO specific data
   */
  async getGHOData(userAddress: string): Promise<GHOData | null> {
    try {
      const portfolio = await this.getUserPortfolio(userAddress);
      
      // Find GHO in supplies
      const ghoSupply = portfolio.supplies.find(s => s.symbol === 'GHO');
      
      // Find GHO in borrows
      const ghoBorrow = portfolio.borrows.find(b => b.symbol === 'GHO');

      if (!ghoSupply && !ghoBorrow) {
        return null;
      }

      return {
        balance: ghoSupply?.balance || '0',
        balanceUSD: ghoSupply?.balanceUSD || '0',
        borrowed: ghoBorrow?.balance || '0',
        borrowedUSD: ghoBorrow?.balanceUSD || '0',
        stakingBalance: '0', // Would need separate query for staking
        stakingBalanceUSD: '$0',
        borrowAPY: ghoBorrow?.apy || '0',
        supplyAPY: ghoSupply?.apy || '0',
      };
    } catch (error) {
      console.error('Error fetching GHO data:', error);
      return null;
    }
  }
}

