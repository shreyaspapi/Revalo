/**
 * Aave Official GraphQL API Configuration
 * 
 * Using Aave's official GraphQL API for querying user positions and market data.
 * This is the recommended and most reliable data source.
 * 
 * Docs: https://docs.aave.com/developers/apis/graphql-api
 * Playground: https://api.v3.aave.com/graphql
 * 
 * IMPORTANT: The official API only supports mainnet chains:
 * - Ethereum Mainnet (1)
 * - Polygon (137)
 * - Arbitrum (42161)
 * - Optimism (10)
 * - Base (8453)
 * - Gnosis (100)
 * 
 * Testnet chains (like Sepolia) are NOT supported by the official API.
 */

/**
 * Aave Official GraphQL API endpoint
 * Works for mainnet chains only - chainId is specified in the query
 */
export const AAVE_GRAPHQL_API = 'https://api.v3.aave.com/graphql';

/**
 * Supported chains - all use the same API endpoint
 * The chainId is specified in each query
 */
export const AAVE_SUBGRAPH_URLS: Record<number, string> = {
  1: AAVE_GRAPHQL_API,      // Ethereum Mainnet
  137: AAVE_GRAPHQL_API,    // Polygon
  42161: AAVE_GRAPHQL_API,  // Arbitrum
  10: AAVE_GRAPHQL_API,     // Optimism
  8453: AAVE_GRAPHQL_API,   // Base
  100: AAVE_GRAPHQL_API,    // Gnosis
};

/**
 * Get subgraph URL for a specific chain
 */
export function getSubgraphUrl(chainId: number): string {
  const url = AAVE_SUBGRAPH_URLS[chainId];
  if (!url) {
    throw new Error(`Aave subgraph not available for chain ID: ${chainId}`);
  }
  return url;
}

/**
 * Aave V3 Pool (Market) Addresses
 * These are the main lending pool addresses for each supported chain
 */
export const AAVE_MARKET_ADDRESSES: Record<number, string> = {
  1: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',        // Ethereum Mainnet
  137: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',      // Polygon
  42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',    // Arbitrum
  10: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',       // Optimism
  8453: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',     // Base
  100: '0xb50201558B00496A145fE76f7424749556E326D8',      // Gnosis
};

/**
 * Aave Official API GraphQL queries
 * Using the official API schema
 */
export const QUERIES = {
  /**
   * Get user supply positions
   */
  getUserSupplies: `
    query GetUserSupplies($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userSupplies(
        request: {
          markets: [{ address: $marketAddress, chainId: $chainId }]
          user: $userAddress
        }
      ) {
        market {
          name
          chain {
            chainId
          }
        }
        currency {
          symbol
          name
          address
          decimals
        }
        balance {
          amount {
            value
            decimals
          }
          usd
        }
        apy {
          raw
          decimals
          value
          formatted
        }
        isCollateral
        canBeCollateral
      }
    }
  `,

  /**
   * Get user borrow positions
   */
  getUserBorrows: `
    query GetUserBorrows($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userBorrows(
        request: {
          markets: [{ address: $marketAddress, chainId: $chainId }]
          user: $userAddress
        }
      ) {
        market {
          name
          chain {
            chainId
          }
        }
        currency {
          symbol
          name
          address
          decimals
        }
        debt {
          amount {
            value
            decimals
          }
          usd
        }
        apy {
          raw
          decimals
          value
          formatted
        }
      }
    }
  `,

  /**
   * Get user market state (account summary)
   */
  getUserMarketState: `
    query GetUserMarketState($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userMarketState(
        request: {
          market: $marketAddress
          chainId: $chainId
          user: $userAddress
        }
      ) {
        netWorth
        netAPY {
          raw
          decimals
          value
          formatted
        }
        healthFactor
        eModeEnabled
        totalCollateralBase
        totalDebtBase
        availableBorrowsBase
        currentLiquidationThreshold {
          raw
          decimals
          value
          formatted
        }
        ltv {
          raw
          decimals
          value
          formatted
        }
        isInIsolationMode
      }
    }
  `,

  /**
   * Get supported chains
   */
  getSupportedChains: `
    query Chains {
      chains {
        name
        chainId
        icon
      }
    }
  `,

  /**
   * Get sGHO (Savings GHO) balance
   * This is Aave V3's savings module - no slashing risk
   * Note: APY is not available in this query - it comes from Merit program
   */
  getSavingsGhoBalance: `
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
  `,
};



