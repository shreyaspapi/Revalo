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

