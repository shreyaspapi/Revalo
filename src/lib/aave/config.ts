import { ChainId } from '@aave/contract-helpers';
import type { AaveAddresses } from '@/types/aave';

/**
 * Aave V3 Protocol Addresses for different networks
 * https://docs.aave.com/developers/deployed-contracts/v3-mainnet
 */
export const AAVE_ADDRESSES: Record<number, AaveAddresses> = {
  // Ethereum Mainnet
  [ChainId.mainnet]: {
    lendingPool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    protocolDataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    priceOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
    ghoToken: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    stkAAVE: '0x4da27a545c0c5B758a6BA100e3a049001de870f5',
  },
  // Sepolia Testnet V3
  // Official addresses from: https://docs.aave.com/developers/deployed-contracts/v3-testnet-addresses
  [ChainId.sepolia]: {
    lendingPool: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Pool
    protocolDataProvider: '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31', // AaveProtocolDataProvider  
    priceOracle: '0x2da88497588bf89281816106C7259e31AF45a663', // AaveOracle
    ghoToken: '0xc4bF5CbDaBE595361438F8c6a187bDc330539c60', // GHO Token
    poolAddressesProvider: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A', // PoolAddressesProvider
    wrappedTokenGateway: '0x387d311e47e80b498169e6fb51d3193167d89F7D', // WrappedTokenGateway
  },
};

/**
 * Common token addresses on Ethereum Mainnet
 */
export const TOKEN_ADDRESSES = {
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  GHO: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
};

/**
 * RPC endpoints for different networks
 * Note: These are OPTIONAL now - we use The Graph subgraphs by default (FREE!)
 * Only needed if you want to use the RPC-based AaveService instead of AaveSubgraphService
 */
export const RPC_URLS: Record<number, string> = {
  [ChainId.mainnet]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  [ChainId.sepolia]: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
};

/**
 * Get the appropriate chain ID based on environment
 */
export function getChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? parseInt(chainId) : ChainId.mainnet;
}

/**
 * Get Aave addresses for the current network
 */
export function getAaveAddresses(chainId: number = getChainId()): AaveAddresses {
  const addresses = AAVE_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Aave addresses not configured for chain ID: ${chainId}`);
  }
  return addresses;
}

/**
 * Get RPC URL for the current network
 */
export function getRpcUrl(chainId: number = getChainId()): string {
  const rpcUrl = RPC_URLS[chainId];
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for chain ID: ${chainId}`);
  }
  return rpcUrl;
}

/**
 * Market reference currency decimals (USD in most cases)
 */
export const MARKET_REFERENCE_CURRENCY_DECIMALS = 8;

/**
 * Default number of decimals for display
 */
export const DISPLAY_DECIMALS = 2;

/**
 * Number of milliseconds to cache data
 */
export const CACHE_TIME = 30000; // 30 seconds

/**
 * Polling interval for real-time updates (in milliseconds)
 */
export const POLLING_INTERVAL = 15000; // 15 seconds

