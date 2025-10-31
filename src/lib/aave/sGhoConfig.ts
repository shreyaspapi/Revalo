/**
 * sGHO Configuration
 * 
 * This file contains configuration for sGHO (Savings GHO) including the current APY.
 * 
 * IMPORTANT: Update the SGHO_APY value periodically (weekly or monthly).
 * Check the current APY at: https://app.aave.com/
 * 
 * The sGHO APY is not available through the Aave GraphQL API because:
 * - sGHO is a separate staking mechanism (not a lending position)
 * - Rewards are distributed weekly through the Aave Merit program
 * - APY varies based on weekly distribution schedules
 */

/**
 * Current sGHO APY (as a percentage)
 * 
 * Last Updated: 2025-10-31
 * Source: https://app.aave.com/
 * 
 * Update Instructions:
 * 1. Visit https://app.aave.com/
 * 2. Navigate to GHO section
 * 3. Find the current sGHO APY
 * 4. Update the value below
 * 5. Update the "Last Updated" date above
 */
export const SGHO_APY = '5.85'; // Update this value periodically

/**
 * Get the current sGHO APY
 * Returns the APY as a percentage string
 */
export function getSGhoAPY(): string {
  return SGHO_APY;
}

/**
 * sGHO Contract Address (Ethereum Mainnet)
 */
export const SGHO_CONTRACT_ADDRESS = '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d';

/**
 * Check if the APY value needs updating
 * Returns true if the last update was more than 7 days ago
 */
export function isAPYStale(lastUpdatedDate: string): boolean {
  const lastUpdate = new Date(lastUpdatedDate);
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceUpdate > 7;
}

/**
 * Display configuration info
 */
export const SGHO_CONFIG_INFO = {
  apy: SGHO_APY,
  lastUpdated: '2025-10-31',
  source: 'https://app.aave.com/',
  updateFrequency: 'Weekly recommended',
  note: 'APY varies weekly based on GHO staking rewards',
};

