'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: string;
}

function StatCard({ title, value, subtitle, badge }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
            {title}
          </CardDescription>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        title="ANTI-GHO BALANCE"
        value="0"
        subtitle="anti-GHO tokens"
        badge="Soon"
      />
      <StatCard
        title="EST. ANNUAL EARNINGS"
        value="142"
        subtitle="anti-GHO ≈ $142"
      />
      <StatCard title="APY" value="2.84%" subtitle="Annual percentage yield" />
    </div>
  );
}

