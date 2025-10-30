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

  // If wallet not connected, show placeholder
  if (!isConnected) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PositionCard
          title="TOTAL SUPPLIED"
          value="0"
          subtitle="Connect wallet to view"
          icon="wallet"
          dollarValue="$0.00"
        />
        <PositionCard
          title="TOTAL BORROWED"
          value="0"
          subtitle="Connect wallet to view"
          icon="trending"
          dollarValue="$0.00"
        />
        <PositionCard
          title="STKGHO"
          value="0"
          subtitle="Connect wallet to view"
          icon="link"
          dollarValue="$0.00"
        />
      </div>
    );
  }

  // Calculate total supplied
  const totalSupplied = portfolio?.totalSupplyUSD || 0;
  const totalSuppliedStr = totalSupplied > 0 
    ? totalSupplied.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '0';

  // Calculate total borrowed
  const totalBorrowed = portfolio?.totalBorrowUSD || 0;
  const totalBorrowedStr = totalBorrowed > 0
    ? totalBorrowed.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '0';

  // Get GHO borrowed amount
  const ghoBorrowed = portfolio?.borrows.find(b => b.symbol === 'GHO');
  const ghoBorrowedAmount = ghoBorrowed?.balance || '0';
  const ghoBorrowedValue = ghoBorrowed?.balanceUSD || '0';
  const ghoBorrowedAPY = ghoBorrowed?.apy || '0';

  // Get stkGHO balance
  const stkGHOBalance = stakingData?.stkGHO.balance || '0';
  const stkGHOValue = stakingData?.stkGHO.balanceUSD || '$0.00';
  const stkGHOAPY = stakingData?.stkGHO.apy || '0';

  // Calculate average supply APY
  const avgSupplyAPY = portfolio && portfolio.supplies.length > 0
    ? (portfolio.supplies.reduce((sum, supply) => {
        const balanceUSD = parseFloat(supply.balanceUSD);
        const apy = parseFloat(supply.apy);
        return sum + (balanceUSD * apy);
      }, 0) / totalSupplied).toFixed(2)
    : '0';

  // Calculate average borrow APY
  const avgBorrowAPY = portfolio && portfolio.borrows.length > 0
    ? (portfolio.borrows.reduce((sum, borrow) => {
        const balanceUSD = parseFloat(borrow.balanceUSD);
        const apy = parseFloat(borrow.apy);
        return sum + (balanceUSD * apy);
      }, 0) / totalBorrowed).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <PositionCard
        title="TOTAL SUPPLIED"
        value={totalSuppliedStr}
        subtitle={`${portfolio?.supplies.length || 0} asset${portfolio?.supplies.length !== 1 ? 's' : ''} supplied`}
        icon="wallet"
        dollarValue={formatUSD(totalSupplied)}
        apy={avgSupplyAPY}
        isLoading={portfolioLoading}
      />
      <PositionCard
        title="GHO BORROWED"
        value={ghoBorrowedAmount}
        subtitle="GHO tokens"
        icon="trending"
        dollarValue={formatUSD(parseFloat(ghoBorrowedValue))}
        apy={ghoBorrowedAPY}
        isLoading={portfolioLoading || ghoLoading}
      />
      <PositionCard
        title="STKGHO"
        value={stkGHOBalance}
        subtitle="stkGHO tokens"
        icon="link"
        dollarValue={stkGHOValue}
        apy={stkGHOAPY}
        isLoading={stakingLoading}
      />
    </div>
  );
}

