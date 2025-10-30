'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Revalo
          </h1>
        </Link>
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/'
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/docs"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/docs'
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Docs
          </Link>
          <Link
            href="/strategies"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/strategies'
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Strategies
          </Link>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}

