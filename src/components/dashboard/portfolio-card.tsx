'use client';

import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";
import { useAavePortfolio, useGHOData } from "@/hooks/useAaveData";
import { useAccount } from "wagmi";
import { formatUSD, formatAPY, calculateNetAPY, estimateAnnualEarnings } from "@/lib/aave/utils";
import { useMemo } from "react";

export function PortfolioCard() {
  const { address, isConnected } = useAccount();
  const { data: portfolio, isLoading, error } = useAavePortfolio();
  const { data: ghoData } = useGHOData();

  // Calculate net APY and estimated earnings
  const { netAPY, estimatedEarnings } = useMemo(() => {
    if (!portfolio) return { netAPY: 0, estimatedEarnings: 0 };

    // Calculate weighted average APY
    const totalSupplyAPY = portfolio.supplies.reduce((sum, supply) => {
      const balanceUSD = parseFloat(supply.balanceUSD);
      const apy = parseFloat(supply.apy);
      return sum + (balanceUSD * apy);
    }, 0);

    const totalBorrowAPY = portfolio.borrows.reduce((sum, borrow) => {
      const balanceUSD = parseFloat(borrow.balanceUSD);
      const apy = parseFloat(borrow.apy);
      return sum + (balanceUSD * apy);
    }, 0);

    const avgSupplyAPY = portfolio.totalSupplyUSD > 0
      ? totalSupplyAPY / portfolio.totalSupplyUSD
      : 0;

    const avgBorrowAPY = portfolio.totalBorrowUSD > 0
      ? totalBorrowAPY / portfolio.totalBorrowUSD
      : 0;

    const netAPY = calculateNetAPY(
      portfolio.totalSupplyUSD,
      portfolio.totalBorrowUSD,
      avgSupplyAPY,
      avgBorrowAPY
    );

    const estimatedEarnings = estimateAnnualEarnings(portfolio.netWorthUSD, netAPY);

    return { netAPY, estimatedEarnings };
  }, [portfolio]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading portfolio data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-8 rounded-2xl border border-destructive/50 bg-card p-8">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Error loading portfolio</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show connect wallet state
  if (!isConnected || !address) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Connect your wallet to view your Aave portfolio</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!portfolio || (portfolio.supplies.length === 0 && portfolio.borrows.length === 0)) {
    return (
      <div className="mb-8 rounded-2xl border border-border bg-card p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Aave positions found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start supplying or borrowing on Aave to see your portfolio here
          </p>
        </div>
      </div>
    );
  }

  const isPositiveAPY = netAPY >= 0;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-8">
      <div
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#718096",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          marginBottom: "16px",
        }}
      >
        Your Portfolio
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-4">
          <h2 className="text-6xl font-bold text-foreground">
            {formatUSD(portfolio.netWorthUSD)}
          </h2>
          <span 
            className={`flex items-center gap-1.5 text-base font-semibold ${
              isPositiveAPY ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveAPY ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {formatAPY(Math.abs(netAPY))}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Net worth across all AAVE positions
        </p>
      </div>

      <div className="mb-8 border-t border-border"></div>

      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Anti-GHO Balance
            </p>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Soon
            </span>
          </div>
          <p className="text-5xl font-bold text-foreground">0</p>
          <p className="mt-3 text-sm text-muted-foreground">anti-GHO tokens</p>
        </div>

        <div>
          <p className="mb-6 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Est. Annual Earnings
          </p>
          <p className="text-5xl font-bold text-foreground">
            {Math.abs(estimatedEarnings).toFixed(0)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            anti-GHO ≈ {formatUSD(Math.abs(estimatedEarnings))}
          </p>
        </div>

        <div>
          <p className="mb-6 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Net APY
          </p>
          <p className={`text-5xl font-bold ${isPositiveAPY ? 'text-foreground' : 'text-red-600'}`}>
            {formatAPY(netAPY)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Annual percentage yield</p>
        </div>
      </div>
    </div>
  );
}

