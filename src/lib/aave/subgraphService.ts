import { GraphQLClient } from 'graphql-request';
import type {
  AavePortfolio,
  UserPosition,
  GHOData,
} from '@/types/aave';
import { getSubgraphUrl, QUERIES, AAVE_MARKET_ADDRESSES, AAVE_GRAPHQL_API } from './subgraphConfig';
import { 
  formatTokenAmount, 
  formatUSD, 
  formatBalance, 
  formatHealthFactor,
  formatLargeUSD 
} from './utils';

/**
 * Aave Official API response types
 */
interface AaveSupplyPosition {
  market: {
    name: string;
    chain: {
      chainId: number;
    };
  };
  currency: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  balance: {
    amount: {
      value: string;
      decimals: number;
    };
    usd: string;
  };
  apy: {
    raw: string;
    decimals: number;
    value: string;
    formatted: string;
  };
  isCollateral: boolean;
  canBeCollateral: boolean;
}

interface AaveBorrowPosition {
  market: {
    name: string;
    chain: {
      chainId: number;
    };
  };
  currency: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
  };
  debt: {
    amount: {
      value: string;
      decimals: number;
    };
    usd: string;
  };
  apy: {
    raw: string;
    decimals: number;
    value: string;
    formatted: string;
  };
}

interface PercentValue {
  raw: string;
  decimals: number;
  value: string;
  formatted: string;
}

interface AaveMarketState {
  netWorth: string;
  netAPY: PercentValue;
  healthFactor: string | null;
  eModeEnabled: boolean;
  totalCollateralBase: string;
  totalDebtBase: string;
  availableBorrowsBase: string;
  currentLiquidationThreshold: PercentValue;
  ltv: PercentValue;
  isInIsolationMode: boolean;
}

interface UserSuppliesResponse {
  userSupplies: AaveSupplyPosition[];
}

interface UserBorrowsResponse {
  userBorrows: AaveBorrowPosition[];
}

interface UserMarketStateResponse {
  userMarketState: AaveMarketState;
}

/**
 * Aave Official API Service
 * Uses Aave's official GraphQL API - FREE, no API keys needed!
 */
export class AaveSubgraphService {
  private client: GraphQLClient;
  private chainId: number;
  private marketAddress: string;

  constructor(chainId: number = 1) {
    this.chainId = chainId;
    const apiUrl = getSubgraphUrl(chainId);
    this.marketAddress = AAVE_MARKET_ADDRESSES[chainId];
    
    if (!this.marketAddress) {
      throw new Error(`Market address not configured for chain ID: ${chainId}`);
    }
    
    // Check if this chain is supported by Aave's official API
    // Currently, the official API only supports mainnet chains (1, 137, 42161, 10, 8453, 100)
    // Testnets like Sepolia (11155111) are not supported
    const supportedChains = [1, 137, 42161, 10, 8453, 100]; // Ethereum, Polygon, Arbitrum, Optimism, Base, Gnosis
    if (!supportedChains.includes(chainId)) {
      throw new Error(
        `Aave's official API does not support chain ID ${chainId}. ` +
        `Supported chains: Ethereum Mainnet (1), Polygon (137), Arbitrum (42161), Optimism (10), Base (8453), Gnosis (100). ` +
        `Testnet chains like Sepolia are not available.`
      );
    }
    
    this.client = new GraphQLClient(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get user's complete Aave portfolio from official API
   */
  async getUserPortfolio(userAddress: string): Promise<AavePortfolio> {
    try {
      // Fetch supplies, borrows, and market state in parallel
      const [suppliesResponse, borrowsResponse, marketStateResponse] = await Promise.all([
        this.client.request<UserSuppliesResponse>(
          QUERIES.getUserSupplies,
          {
            marketAddress: this.marketAddress,
            chainId: this.chainId,
            userAddress: userAddress,
          }
        ),
        this.client.request<UserBorrowsResponse>(
          QUERIES.getUserBorrows,
          {
            marketAddress: this.marketAddress,
            chainId: this.chainId,
            userAddress: userAddress,
          }
        ),
        this.client.request<UserMarketStateResponse>(
          QUERIES.getUserMarketState,
          {
            marketAddress: this.marketAddress,
            chainId: this.chainId,
            userAddress: userAddress,
          }
        ),
      ]);

      // Parse supplies (handle empty arrays)
      // Keep raw numbers as strings for calculations, format in UI layer
      const supplies: UserPosition[] = (suppliesResponse.userSupplies || []).map((supply) => {
        const balanceNum = parseFloat(supply.balance.amount.value);
        const balanceUSDNum = parseFloat(supply.balance.usd);
        
        return {
          symbol: supply.currency.symbol,
          name: supply.currency.name,
          balance: balanceNum.toFixed(6), // Keep as parseable number string
          balanceUSD: balanceUSDNum.toFixed(2), // Keep as parseable number string
          apy: supply.apy.formatted,
          underlyingAsset: supply.currency.address,
          decimals: supply.currency.decimals,
        };
      });

      // Parse borrows (handle empty arrays) - NOTE: Changed from balance to debt
      const borrows: UserPosition[] = (borrowsResponse.userBorrows || []).map((borrow) => {
        const debtNum = parseFloat(borrow.debt.amount.value);
        const debtUSDNum = parseFloat(borrow.debt.usd);
        
        return {
          symbol: borrow.currency.symbol,
          name: borrow.currency.name,
          balance: debtNum.toFixed(6), // Keep as parseable number string
          balanceUSD: debtUSDNum.toFixed(2), // Keep as parseable number string
          apy: borrow.apy.formatted,
          underlyingAsset: borrow.currency.address,
          decimals: borrow.currency.decimals,
        };
      });

      // Parse market state
      const marketState = marketStateResponse.userMarketState;
      const totalSupplyUSD = parseFloat(marketState.totalCollateralBase);
      const totalBorrowUSD = parseFloat(marketState.totalDebtBase);
      const netWorthUSD = parseFloat(marketState.netWorth);

      return {
        supplies,
        borrows,
        totalSupplyUSD,
        totalBorrowUSD,
        netWorthUSD,
        healthFactor: marketState.healthFactor || 'N/A', // Keep as string, N/A if no borrows
        availableBorrowsUSD: marketState.availableBorrowsBase, // Keep raw for calculations
        currentLTV: marketState.ltv.formatted,
      };
    } catch (error) {
      console.error('Error fetching portfolio from Aave API:', error);
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          marketAddress: this.marketAddress,
          chainId: this.chainId,
          userAddress,
        });
      }
      throw error; // Rethrow the original error for better debugging
    }
  }

  /**
   * Get supported chains from Aave API
   */
  static async getSupportedChains(): Promise<Array<{ name: string; chainId: number; icon: string }>> {
    try {
      const client = new GraphQLClient(AAVE_GRAPHQL_API, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await client.request<{ chains: Array<{ name: string; chainId: number; icon: string }> }>(
        QUERIES.getSupportedChains
      );
      
      return response.chains;
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      throw error;
    }
  }

  /**
   * Query sGHO (Savings GHO) balance for a user
   */
  private async querySavingsGhoBalance(userAddress: string): Promise<{
    usdPerToken: string;
    amount: {
      raw: string;
      value: string;
      decimals: number;
    };
    usd: string;
  } | null> {
    try {
      const client = new GraphQLClient(AAVE_GRAPHQL_API, {
        headers: {},
      });

      const variables = {
        userAddress: userAddress.toLowerCase(),
      };

      const response: any = await client.request(QUERIES.getSavingsGhoBalance, variables);
      return response.savingsGhoBalance;
    } catch (error) {
      console.error('Error fetching sGHO balance:', error);
      return null;
    }
  }

  /**
   * Fetch sGHO APY from Merit/ASR
   * 
   * NOTE: The sGHO APY (currently ~7.18%) is NOT available in the Aave GraphQL API.
   * It comes from the Merit rewards program and the Aave Savings Rate (ASR).
   * 
   * TODO: Replace this with one of these integrations:
   * 1. Query the Aave Savings Rate (ASR) smart contract on-chain
   *    Contract: (need to find ASR contract address)
   *    Method: getRate() or similar
   * 
   * 2. Call a separate Aave API endpoint for global sGHO stats
   *    Example: https://api.aave.com/sgho/stats (if available)
   * 
   * 3. Calculate from Merit rewards distribution
   *    Use userMeritRewards query with proper integration
   * 
   * Until proper integration is implemented, returns N/A.
   */
  private async fetchSGHOAPY(): Promise<string> {
    try {
      // TODO: Implement real-time APY fetching from:
      // - Aave Savings Rate (ASR) contract
      // - Merit rewards API
      // - Or other official source
      
      // Return N/A until proper integration is implemented
      return 'N/A';
    } catch (error) {
      console.error('Error fetching sGHO APY:', error);
      return 'N/A';
    }
  }

  /**
   * Get GHO specific data (including savings)
   */
  async getGHOData(userAddress: string): Promise<GHOData | null> {
    try {
      const portfolio = await this.getUserPortfolio(userAddress);
      
      // Find GHO in supplies
      const ghoSupply = portfolio.supplies.find(s => s.symbol === 'GHO' || s.symbol.toLowerCase() === 'gho');
      
      // Find GHO in borrows
      const ghoBorrow = portfolio.borrows.find(b => b.symbol === 'GHO' || b.symbol.toLowerCase() === 'gho');

      // Fetch sGHO (Savings GHO) balance and APY
      let savingsBalance = '0';
      let savingsBalanceUSD = '0';
      let savingsAPY = 'N/A'; // APY from Merit program - N/A until proper integration
      
      try {
        // Only fetch on Ethereum Mainnet (sGHO only on mainnet)
        if (this.chainId === 1) {
          const savingsResponse = await this.querySavingsGhoBalance(userAddress);
          if (savingsResponse) {
            savingsBalance = savingsResponse.amount.value || '0';
            savingsBalanceUSD = savingsResponse.usd || '0';
            
            // NOTE: sGHO APY is NOT available in the Aave GraphQL API
            // It comes from the Merit rewards program
            // TODO: Integrate with:
            // 1. Aave Savings Rate (ASR) contract for real-time APY
            // 2. Or use Merit rewards distribution rate
            // 3. Or call a separate Aave API endpoint for global sGHO stats
            // 
            // For now, returns N/A
            savingsAPY = await this.fetchSGHOAPY();
          }
        }
      } catch (savingsError) {
        console.error('Error fetching sGHO balance:', savingsError);
        savingsAPY = 'N/A'; // N/A on error
      }

      // Only return data if user has any GHO-related position
      if (!ghoSupply && !ghoBorrow && parseFloat(savingsBalance) === 0) {
        return null;
      }

      return {
        balance: ghoSupply?.balance || '0',
        balanceUSD: ghoSupply?.balanceUSD || '0',
        borrowed: ghoBorrow?.balance || '0',
        borrowedUSD: ghoBorrow?.balanceUSD || '0',
        savingsBalance,
        savingsBalanceUSD,
        savingsAPY,
        borrowAPY: ghoBorrow?.apy || '0',
        supplyAPY: ghoSupply?.apy || '0',
      };
    } catch (error) {
      console.error('Error fetching GHO data:', error);
      return null;
    }
  }
}

