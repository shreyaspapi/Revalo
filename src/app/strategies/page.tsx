import { Header } from '@/components/dashboard/header';

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Strategies</h1>
          <p className="mt-4 text-muted-foreground">Coming soon...</p>
        </div>
      </main>
    </div>
  );
}

