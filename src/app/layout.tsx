import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/web3-provider";

export const metadata: Metadata = {
  title: "Revalo - AAVE Analytics",
  description: "Analytics tool for AAVE stakers and anti-GHO rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
