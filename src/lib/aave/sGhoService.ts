/**
 * sGHO (Savings GHO) Service
 * Fetches sGHO balance and data using Aave GraphQL API
 * 
 * Note: sGHO APY is NOT available through the API directly.
 * According to Aave Discord, APY is calculated from weekly distributions.
 * We use a configurable APY value from sGhoConfig.ts
 */

import { getSGhoAPY } from './sGhoConfig';

const AAVE_GRAPHQL_API = 'https://api.v3.aave.com/graphql';

interface TokenAmount {
  raw: string;
  value: string;
  decimals: number;
}

interface SavingsGhoBalanceResponse {
  savingsGhoBalance: {
    usdPerToken: string;
    amount: TokenAmount;
    usd: string;
  } | null;
}

interface SavingsGhoData {
  balance: string;
  balanceUSD: string;
  apy: string; // Will be 'N/A' since not available from API
}

/**
 * Query the Aave GraphQL API
 */
async function queryAaveGraphQL(
  query: string,
  variables: Record<string, any>
): Promise<any> {
  try {
    const response = await fetch(AAVE_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error querying Aave GraphQL API:', error);
    throw error;
  }
}

/**
 * Get sGHO (Savings GHO) balance for a user
 */
export async function getSavingsGhoBalance(
  userAddress: string
): Promise<SavingsGhoData> {
  const query = `
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
  `;

  try {
    // Fetch balance and APY in parallel
    const [balanceData, apy] = await Promise.all([
      queryAaveGraphQL(query, { userAddress }),
      fetchSGhoAPY(),
    ]);

    const data: SavingsGhoBalanceResponse = balanceData;

    if (!data.savingsGhoBalance) {
      return {
        balance: '0',
        balanceUSD: '0',
        apy,
      };
    }

    const { amount, usd } = data.savingsGhoBalance;

    return {
      balance: amount.value,
      balanceUSD: usd,
      apy,
    };
  } catch (error) {
    console.error('Error fetching sGHO balance:', error);
    return {
      balance: '0',
      balanceUSD: '0',
      apy: 'N/A',
    };
  }
}

/**
 * Get claimable GHO merit rewards for a user
 * These are the weekly rewards that can be claimed
 */
export async function getClaimableMeritRewards(
  userAddress: string
): Promise<{
  claimable: Array<{
    symbol: string;
    amount: string;
  }>;
} | null> {
  const query = `
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
  `;

  try {
    const data = await queryAaveGraphQL(query, {
      userAddress,
    });

    if (!data.userMeritRewards || !data.userMeritRewards.claimable) {
      return null;
    }

    const claimable = data.userMeritRewards.claimable.map((reward: any) => ({
      symbol: reward.currency.symbol,
      amount: reward.amount.value,
    }));

    return { claimable };
  } catch (error) {
    console.error('Error fetching merit rewards:', error);
    return null;
  }
}

/**
 * NOTE: sGHO APY Implementation
 * 
 * The sGHO APY is NOT available through the Aave GraphQL API.
 * According to Aave support:
 * - APY is annualized from weekly distribution schedule
 * - Rewards accrue continuously but are claimable weekly
 * - No direct API endpoint for current APY
 * 
 * Options to get APY:
 * 1. Hardcode a typical rate (5-8% APY) and update manually
 * 2. Calculate from on-chain sGHO contract data
 * 3. Scrape from Aave frontend (not recommended)
 * 4. Use Aave Merit subgraph (complex)
 * 
 * For now, we return 'N/A' and can add a note in the UI:
 * "APY varies weekly based on GHO staking rewards"
 */

/**
 * Convert APR (in Ray units) to APY
 * Ray units = 10^27
 */
function rayToApy(liquidityRate: string): number {
  const RAY = Math.pow(10, 27);
  const SECONDS_PER_YEAR = 31536000;
  
  const rate = Number(liquidityRate) / RAY;
  const apy = (Math.pow(1 + rate / SECONDS_PER_YEAR, SECONDS_PER_YEAR) - 1) * 100;
  
  return apy;
}

/**
 * Fetch the current sGHO APY
 * 
 * NOTE: sGHO is a separate staking mechanism with weekly reward distributions.
 * The GHO reserve in Aave's lending pool has 0% supply APY (you can't earn by supplying GHO).
 * 
 * Instead, we use a configurable APY value that should be updated periodically.
 * See src/lib/aave/sGhoConfig.ts to update the APY value.
 */
export async function fetchSGhoAPY(): Promise<string> {
  try {
    // Get the configured APY value
    const apy = getSGhoAPY();
    return apy;
  } catch (error) {
    console.error('Error fetching sGHO APY:', error);
    return 'N/A';
  }
}

/**
 * Get the estimated/configured APY for sGHO
 * This returns the same value as fetchSGhoAPY but synchronously
 * 
 * To update the APY value, edit src/lib/aave/sGhoConfig.ts
 */
export function getEstimatedSGhoAPY(): string {
  return getSGhoAPY();
}

