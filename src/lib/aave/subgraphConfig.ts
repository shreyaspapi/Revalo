/**
 * The Graph - Aave Subgraph Configuration
 * 
 * These endpoints are FREE to use - no API key required!
 * Learn more: https://thegraph.com/explorer
 */

/**
 * Official Aave V3 Subgraph endpoints
 * These are completely FREE and don't require any API keys
 */
export const AAVE_SUBGRAPH_URLS: Record<number, string> = {
  // Ethereum Mainnet - Aave V3
  1: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
  
  // Sepolia Testnet - Aave V3
  11155111: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-sepolia',
  
  // Alternative: Studio endpoints (also free)
  // 1: 'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/...',
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
 * GraphQL query fragments for reuse
 */
export const FRAGMENTS = {
  userReserve: `
    fragment UserReserveData on UserReserve {
      id
      reserve {
        id
        symbol
        name
        decimals
        underlyingAsset
        liquidityRate
        variableBorrowRate
        stableBorrowRate
        priceInUsd
      }
      currentATokenBalance
      currentVariableDebt
      currentStableDebt
      liquidityRate
      variableBorrowRate
      stableBorrowRate
      scaledATokenBalance
      scaledVariableDebt
      usageAsCollateralEnabledOnUser
    }
  `,
  
  reserve: `
    fragment ReserveData on Reserve {
      id
      symbol
      name
      decimals
      underlyingAsset
      liquidityRate
      variableBorrowRate
      stableBorrowRate
      availableLiquidity
      totalLiquidity
      totalATokenSupply
      totalCurrentVariableDebt
      totalPrincipalStableDebt
      priceInUsd
      lastUpdateTimestamp
    }
  `,
};

/**
 * Common GraphQL queries
 */
export const QUERIES = {
  /**
   * Get user account data with all positions
   */
  getUserAccount: `
    query GetUserAccount($userAddress: String!) {
      user(id: $userAddress) {
        id
        reserves {
          ...UserReserveData
        }
      }
    }
    ${FRAGMENTS.userReserve}
  `,

  /**
   * Get all reserves (markets)
   */
  getReserves: `
    query GetReserves {
      reserves(first: 100, orderBy: totalLiquidity, orderDirection: desc) {
        ...ReserveData
      }
    }
    ${FRAGMENTS.reserve}
  `,

  /**
   * Get specific user reserves
   */
  getUserReserves: `
    query GetUserReserves($userAddress: String!) {
      userReserves(where: { user: $userAddress }) {
        ...UserReserveData
      }
    }
    ${FRAGMENTS.userReserve}
  `,
};

