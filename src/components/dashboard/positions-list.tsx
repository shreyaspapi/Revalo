'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAavePortfolio } from '@/hooks/useAaveData';
import { useAccount } from 'wagmi';
import { formatUSD } from '@/lib/aave/utils';
import { TrendingUp, TrendingDown, Loader2, Coins } from 'lucide-react';

export function PositionsList() {
  const { isConnected } = useAccount();
  const { data: portfolio, isLoading } = useAavePortfolio();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
          <CardDescription>Connect wallet to view your positions</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
          <CardDescription>Loading positions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portfolio || (portfolio.supplies.length === 0 && portfolio.borrows.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
          <CardDescription>No active positions found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Positions</CardTitle>
        <CardDescription>
          Detailed view of your supplies and borrows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="supplies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supplies">
              <TrendingUp className="mr-2 h-4 w-4" />
              Supplies ({portfolio.supplies.length})
            </TabsTrigger>
            <TabsTrigger value="borrows">
              <TrendingDown className="mr-2 h-4 w-4" />
              Borrows ({portfolio.borrows.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supplies" className="space-y-4">
            {portfolio.supplies.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No supply positions
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio.supplies.map((supply) => (
                  <div
                    key={supply.underlyingAsset}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Coins className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{supply.symbol}</p>
                        <p className="text-sm text-muted-foreground">{supply.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{supply.balance}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatUSD(parseFloat(supply.balanceUSD))}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {supply.apy}% APY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/30 p-4">
              <p className="font-semibold">Total Supplied</p>
              <p className="text-xl font-bold">
                {formatUSD(portfolio.totalSupplyUSD)}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="borrows" className="space-y-4">
            {portfolio.borrows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No borrow positions
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio.borrows.map((borrow) => (
                  <div
                    key={borrow.underlyingAsset}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                        <Coins className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{borrow.symbol}</p>
                        <p className="text-sm text-muted-foreground">{borrow.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{borrow.balance}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatUSD(parseFloat(borrow.balanceUSD))}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {borrow.apy}% APY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/30 p-4">
              <p className="font-semibold">Total Borrowed</p>
              <p className="text-xl font-bold">
                {formatUSD(portfolio.totalBorrowUSD)}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {portfolio.healthFactor && (
          <div className="mt-6 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Factor</p>
                <p className="text-2xl font-bold">{portfolio.healthFactor}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available to Borrow</p>
                <p className="text-lg font-semibold">
                  {formatUSD(parseFloat(portfolio.availableBorrowsUSD))}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

