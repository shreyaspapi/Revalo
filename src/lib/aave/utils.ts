import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';

/**
 * Format a token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  try {
    const formatted = formatUnits(amount.toString(), decimals);
    const num = parseFloat(formatted);
    
    if (num === 0) return '0';
    if (num < 0.01) return '<0.01';
    
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    });
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
}

/**
 * Format USD value with currency symbol
 */
export function formatUSD(
  amount: string | number,
  displayDecimals: number = 2
): string {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (num === 0) return '$0.00';
    if (num < 0.01) return '<$0.01';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: displayDecimals,
      maximumFractionDigits: displayDecimals,
    }).format(num);
  } catch (error) {
    console.error('Error formatting USD:', error);
    return '$0.00';
  }
}

/**
 * Format APY as percentage
 */
export function formatAPY(apy: string | number): string {
  try {
    const num = typeof apy === 'string' ? parseFloat(apy) : apy;
    
    if (num === 0) return '0%';
    if (Math.abs(num) < 0.01) return '<0.01%';
    
    return `${num.toFixed(2)}%`;
  } catch (error) {
    console.error('Error formatting APY:', error);
    return '0%';
  }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Convert ray (27 decimals) to percentage
 */
export function rayToPercent(ray: string): number {
  try {
    const rayBN = new BigNumber(ray);
    const RAY = new BigNumber(10).pow(27);
    return rayBN.dividedBy(RAY).multipliedBy(100).toNumber();
  } catch (error) {
    console.error('Error converting ray to percent:', error);
    return 0;
  }
}

/**
 * Calculate health factor color
 */
export function getHealthFactorColor(healthFactor: string): string {
  const hf = parseFloat(healthFactor);
  
  if (hf >= 3) return 'text-green-600';
  if (hf >= 1.5) return 'text-yellow-600';
  if (hf >= 1.1) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Calculate health factor status
 */
export function getHealthFactorStatus(healthFactor: string): {
  label: string;
  color: string;
} {
  const hf = parseFloat(healthFactor);
  
  if (hf >= 3) {
    return { label: 'Healthy', color: 'text-green-600' };
  }
  if (hf >= 1.5) {
    return { label: 'Good', color: 'text-yellow-600' };
  }
  if (hf >= 1.1) {
    return { label: 'Caution', color: 'text-orange-600' };
  }
  return { label: 'At Risk', color: 'text-red-600' };
}

/**
 * Normalize address to lowercase
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Safely parse BigNumber
 */
export function safeParseBigNumber(value: string | number): BigNumber {
  try {
    return new BigNumber(value);
  } catch (error) {
    console.error('Error parsing BigNumber:', error);
    return new BigNumber(0);
  }
}

/**
 * Calculate net APY (weighted average of supply and borrow APYs)
 */
export function calculateNetAPY(
  totalSupply: number,
  totalBorrow: number,
  supplyAPY: number,
  borrowAPY: number
): number {
  if (totalSupply === 0) return 0;
  
  const supplyEarnings = totalSupply * (supplyAPY / 100);
  const borrowCosts = totalBorrow * (borrowAPY / 100);
  const netEarnings = supplyEarnings - borrowCosts;
  
  return (netEarnings / totalSupply) * 100;
}

/**
 * Estimate annual earnings based on net APY
 */
export function estimateAnnualEarnings(
  totalValue: number,
  apy: number
): number {
  return totalValue * (apy / 100);
}

/**
 * Format health factor with appropriate precision
 * Returns "N/A" for null/infinite health factors
 */
export function formatHealthFactor(healthFactor: string | null | undefined): string {
  if (!healthFactor || healthFactor === 'null' || healthFactor === 'N/A') {
    return 'N/A';
  }
  
  try {
    const hf = parseFloat(healthFactor);
    
    // Check for infinity or very large numbers
    if (!isFinite(hf) || hf > 1000000) {
      return '∞';
    }
    
    // Format with 2 decimal places
    if (hf >= 100) {
      return hf.toFixed(0); // No decimals for large numbers
    } else if (hf >= 10) {
      return hf.toFixed(1); // 1 decimal for medium numbers
    } else {
      return hf.toFixed(2); // 2 decimals for small numbers
    }
  } catch (error) {
    console.error('Error formatting health factor:', error);
    return 'N/A';
  }
}

/**
 * Format token balance with smart precision
 * Shows more decimals for small amounts, fewer for large amounts
 */
export function formatBalance(
  balance: string | number,
  options?: {
    maxDecimals?: number;
    minDecimals?: number;
    compact?: boolean;
  }
): string {
  const {
    maxDecimals = 4,
    minDecimals = 2,
    compact = false,
  } = options || {};
  
  try {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    
    if (num === 0) return '0';
    if (!isFinite(num)) return '0';
    
    // For very small numbers
    if (Math.abs(num) < 0.0001) {
      return num.toExponential(2);
    }
    
    // For small numbers, show more decimals
    if (Math.abs(num) < 1) {
      return num.toFixed(Math.min(6, maxDecimals));
    }
    
    // Use compact notation for large numbers
    if (compact && Math.abs(num) >= 10000) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(num);
    }
    
    // Standard formatting
    return num.toLocaleString('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    });
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
}

/**
 * Format large USD amounts with smart precision and compact notation
 */
export function formatLargeUSD(
  amount: string | number,
  options?: {
    compact?: boolean;
    maxDecimals?: number;
  }
): string {
  const { compact = true, maxDecimals = 2 } = options || {};
  
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (num === 0) return '$0.00';
    if (!isFinite(num)) return '$0.00';
    
    // For amounts over 10K, use compact notation by default
    if (compact && Math.abs(num) >= 10000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(num);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
    }).format(num);
  } catch (error) {
    console.error('Error formatting large USD:', error);
    return '$0.00';
  }
}

/**
 * Format percentage with appropriate precision
 */
export function formatPercentage(
  value: string | number,
  maxDecimals: number = 2
): string {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (!isFinite(num) || num === 0) return '0%';
    
    // For very small percentages
    if (Math.abs(num) < 0.01) {
      return '<0.01%';
    }
    
    return `${num.toFixed(maxDecimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '0%';
  }
}

