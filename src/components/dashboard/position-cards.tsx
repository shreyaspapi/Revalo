'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Wallet, TrendingUp, Link2, Loader2 } from 'lucide-react';
import { useAavePortfolio, useStakingData, useGHOData } from '@/hooks/useAaveData';
import { useAccount } from 'wagmi';
import { formatUSD } from '@/lib/aave/utils';

interface PositionCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: 'wallet' | 'trending' | 'link';
  dollarValue?: string;
  apy?: string;
  isLoading?: boolean;
}

function PositionCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  dollarValue,
  apy,
  isLoading 
}: PositionCardProps) {
  const IconComponent =
    icon === 'wallet' ? Wallet : icon === 'trending' ? TrendingUp : Link2;

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
            {title}
          </CardDescription>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        {dollarValue && (
          <p className="mt-2 text-sm font-medium text-foreground">
            Value: {dollarValue}
          </p>
        )}
        {apy && (
          <p className="mt-1 text-xs text-green-600">
            APY: {apy}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PositionCards() {
  const { isConnected } = useAccount();
  const { data: portfolio, isLoading: portfolioLoading } = useAavePortfolio();
  const { data: stakingData, isLoading: stakingLoading } = useStakingData();
  const { data: ghoData, isLoading: ghoLoading } = useGHOData();

  // If wallet not connected, show message
  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PositionCard
          title="TOTAL SUPPLIED"
          value="N/A"
          subtitle="Connect wallet to view data"
          icon="wallet"
          dollarValue="N/A"
        />
        <PositionCard
          title="GHO BORROWED"
          value="N/A"
          subtitle="Connect wallet to view data"
          icon="trending"
          dollarValue="N/A"
        />
        <PositionCard
          title="SAVINGS GHO"
          value="N/A"
          subtitle="Connect wallet to view data"
          icon="link"
          dollarValue="N/A"
        />
      </div>
    );
  }

  // Handle errors - show error message instead of data
  if (portfolio === null && !portfolioLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PositionCard
          title="ERROR"
          value="N/A"
          subtitle="Unable to fetch data"
          icon="wallet"
          dollarValue="N/A"
        />
        <PositionCard
          title="ERROR"
          value="N/A"
          subtitle="Unable to fetch data"
          icon="trending"
          dollarValue="N/A"
        />
        <PositionCard
          title="ERROR"
          value="N/A"
          subtitle="Unable to fetch data"
          icon="link"
          dollarValue="N/A"
        />
      </div>
    );
  }

  // Calculate total supplied
  const totalSupplied = portfolio?.totalSupplyUSD ?? null;
  const totalSuppliedStr = totalSupplied !== null && totalSupplied > 0 
    ? totalSupplied.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : totalSupplied === 0 ? '0' : 'N/A';

  // Calculate total borrowed
  const totalBorrowed = portfolio?.totalBorrowUSD ?? null;
  const totalBorrowedStr = totalBorrowed !== null && totalBorrowed > 0
    ? totalBorrowed.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : totalBorrowed === 0 ? '0' : 'N/A';

  // Get GHO borrowed amount
  const ghoBorrowed = portfolio?.borrows.find(b => b.symbol === 'GHO');
  const ghoBorrowedAmount = ghoBorrowed?.balance || (portfolio ? '0' : 'N/A');
  const ghoBorrowedValue = ghoBorrowed?.balanceUSD || (portfolio ? '0' : 'N/A');
  const ghoBorrowedAPY = ghoBorrowed?.apy || (portfolio ? '0' : 'N/A');

  // Get sGHO (Savings GHO) balance - comes from ghoData now
  const sGHOBalance = ghoData?.savingsBalance || (ghoData ? '0' : 'N/A');
  const sGHOValue = ghoData?.savingsBalanceUSD || (ghoData ? '0' : 'N/A');
  const sGHOAPY = ghoData?.savingsAPY || (ghoData ? 'N/A' : 'N/A');

  // Calculate average supply APY
  const avgSupplyAPY = portfolio && portfolio.supplies.length > 0 && totalSupplied && totalSupplied > 0
    ? (portfolio.supplies.reduce((sum, supply) => {
        const balanceUSD = parseFloat(supply.balanceUSD);
        const apy = parseFloat(supply.apy);
        return sum + (balanceUSD * apy);
      }, 0) / totalSupplied).toFixed(2)
    : portfolio && totalSupplied === 0 ? '0' : 'N/A';

  // Calculate average borrow APY
  const avgBorrowAPY = portfolio && portfolio.borrows.length > 0 && totalBorrowed && totalBorrowed > 0
    ? (portfolio.borrows.reduce((sum, borrow) => {
        const balanceUSD = parseFloat(borrow.balanceUSD);
        const apy = parseFloat(borrow.apy);
        return sum + (balanceUSD * apy);
      }, 0) / totalBorrowed).toFixed(2)
    : portfolio && totalBorrowed === 0 ? '0' : 'N/A';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PositionCard
        title="TOTAL SUPPLIED"
        value={totalSuppliedStr}
        subtitle={portfolio ? `${portfolio.supplies.length} asset${portfolio.supplies.length !== 1 ? 's' : ''} supplied` : 'No data available'}
        icon="wallet"
        dollarValue={totalSupplied !== null ? formatUSD(totalSupplied) : 'N/A'}
        apy={avgSupplyAPY}
        isLoading={portfolioLoading}
      />
      <PositionCard
        title="GHO BORROWED"
        value={
          ghoBorrowedAmount === 'N/A'
            ? 'N/A'
            : Number(ghoBorrowedAmount.replace(/,/g, '')).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })
        }
        subtitle={portfolio ? 'GHO tokens' : 'No data available'}
        icon="trending"
        dollarValue={ghoBorrowedValue === 'N/A' ? 'N/A' : formatUSD(parseFloat(ghoBorrowedValue))}
        apy={ghoBorrowedAPY}
        isLoading={portfolioLoading || ghoLoading}
      />
      <PositionCard
        title="SAVINGS GHO"
        value={
          sGHOBalance === 'N/A'
            ? 'N/A'
            : Number(sGHOBalance.replace(/,/g, '')).toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })
        }
        subtitle={ghoData ? 'sGHO tokens' : 'No data available'}
        icon="link"
        dollarValue={sGHOValue === 'N/A' ? 'N/A' : formatUSD(parseFloat(sGHOValue))}
        apy={sGHOAPY}
        isLoading={ghoLoading}
      />
    </div>
  );
}

