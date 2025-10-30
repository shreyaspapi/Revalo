/**
 * Aave Staking Service
 * Fetches balances for stkAAVE token
 * Note: stkGHO has been removed in favor of sGHO (Savings GHO) which has no slashing risk
 */

import { ethers } from 'ethers';

// Minimal ERC20 ABI for balance queries
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Staking contract ABI for rewards/APY data
// Based on Aave StakedTokenV3 contract
const STAKING_ABI = [
  ...ERC20_ABI,
  'function COOLDOWN_SECONDS() view returns (uint256)',
  'function UNSTAKE_WINDOW() view returns (uint256)',
  'function getRewardsData(address, address) view returns (uint256, uint256, uint256, uint256)',
  'function assets(address) view returns (uint128, uint128, uint256)',
  'function getTotalRewardsBalance(address) view returns (uint256)',
];

// Staking token address on Ethereum Mainnet
export const STAKING_ADDRESSES = {
  stkAAVE: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
} as const;

/**
 * Get RPC provider for Ethereum Mainnet
 */
function getProvider(): ethers.providers.JsonRpcProvider {
  // Use public RPC endpoint (free tier)
  const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com';
  return new ethers.providers.JsonRpcProvider(rpcUrl);
}

/**
 * Fetch staking APY for stkAAVE
 * Note: APY should be fetched from Aave's official API or on-chain data
 * Returning N/A until proper integration is implemented
 */
async function getStakingAPY(): Promise<string> {
  try {
    // TODO: Fetch real APY from Aave API or staking contract
    // For now, return N/A instead of hardcoded values
    return 'N/A';
  } catch (error) {
    console.error('Error fetching staking APY:', error);
    return 'N/A';
  }
}

/**
 * Fetch stkAAVE balance for a user
 */
export async function getStkAAVEBalance(userAddress: string): Promise<{
  balance: string;
  balanceFormatted: string;
  apy: string;
}> {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(STAKING_ADDRESSES.stkAAVE, ERC20_ABI, provider);
    
    const [balance, decimals, apy] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals(),
      getStakingAPY(),
    ]);

    // Format with full precision first
    const fullPrecision = ethers.utils.formatUnits(balance, decimals);
    
    // Limit to 6 decimal places max for display (parseable number string)
    const balanceNum = parseFloat(fullPrecision);
    const balanceFormatted = balanceNum.toFixed(6);
    
    return {
      balance: balance.toString(),
      balanceFormatted,
      apy,
    };
  } catch (error) {
    console.error('Error fetching stkAAVE balance:', error);
    return {
      balance: '0',
      balanceFormatted: '0',
      apy: 'N/A',
    };
  }
}

/**
 * Fetch stkAAVE balance (keeping function for compatibility)
 */
export async function getStakingBalances(userAddress: string): Promise<{
  stkAAVE: {
    balance: string;
    balanceFormatted: string;
    apy: string;
  };
}> {
  try {
    const stkAAVE = await getStkAAVEBalance(userAddress);
    return { stkAAVE };
  } catch (error) {
    console.error('Error fetching staking balances:', error);
    return {
      stkAAVE: { balance: '0', balanceFormatted: '0', apy: 'N/A' },
    };
  }
}

/**
 * Get staking token price (approximate from market data)
 * stkAAVE is ~1:1 with AAVE
 */
export function estimateStakingUSDValue(
  stkAAVEBalance: string,
  aavePrice: number = 230   // You'll want to fetch this from a price oracle
): {
  stkAAVEUSD: number;
} {
  const stkAAVEAmount = parseFloat(stkAAVEBalance);
  const stkAAVEUSD = stkAAVEAmount * aavePrice;
  
  return {
    stkAAVEUSD,
  };
}

