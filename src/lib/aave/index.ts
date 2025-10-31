/**
 * Aave Integration - Main Export
 * 
 * This file provides a clean interface to all Aave-related functionality.
 */

// Services
export { AaveService } from './aaveService';
export { AaveSubgraphService } from './subgraphService';
export { getSavingsGhoBalance, getClaimableMeritRewards, getEstimatedSGhoAPY, fetchSGhoAPY } from './sGhoService';

// sGHO Configuration
export { SGHO_APY, getSGhoAPY, SGHO_CONTRACT_ADDRESS, SGHO_CONFIG_INFO } from './sGhoConfig';

// Configuration
export {
  AAVE_ADDRESSES,
  TOKEN_ADDRESSES,
  RPC_URLS,
  getChainId,
  getAaveAddresses,
  getRpcUrl,
  MARKET_REFERENCE_CURRENCY_DECIMALS,
  DISPLAY_DECIMALS,
  CACHE_TIME,
  POLLING_INTERVAL,
} from './config';

// Subgraph Configuration
export { AAVE_SUBGRAPH_URLS, getSubgraphUrl, QUERIES } from './subgraphConfig';

// Utilities
export {
  formatTokenAmount,
  formatUSD,
  formatAPY,
  calculatePercentageChange,
  rayToPercent,
  getHealthFactorColor,
  getHealthFactorStatus,
  normalizeAddress,
  isValidAddress,
  safeParseBigNumber,
  calculateNetAPY,
  estimateAnnualEarnings,
} from './utils';

// Types are exported from their own file
export type * from '@/types/aave';

