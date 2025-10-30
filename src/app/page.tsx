import { Header } from '@/components/dashboard/header';
import { PortfolioCard } from '@/components/dashboard/portfolio-card';
import { PositionCards } from '@/components/dashboard/position-cards';
import { PositionsList } from '@/components/dashboard/positions-list';
import { NotificationSignup } from '@/components/dashboard/notification-signup';

// Force dynamic rendering since we use client-side hooks
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <PortfolioCard />
        <PositionCards />
        <PositionsList />
        <NotificationSignup />
      </main>
    </div>
  );
}
