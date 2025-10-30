# Revalo

A modern DeFi dashboard for tracking and managing your Aave protocol positions. Built with Next.js, TypeScript, and the Aave SDK.

## ✨ Features

- 🔗 **Web3 Wallet Integration** - Connect with MetaMask, WalletConnect, and more via RainbowKit
- 📊 **Real-time Portfolio Tracking** - View your complete Aave V3 positions
- 💰 **Supply & Borrow Positions** - Detailed breakdown of all your positions
- 📈 **Live APY Calculations** - Real-time supply and borrow APY tracking
- 🔄 **Auto-refresh** - Data updates automatically every 15 seconds
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS and shadcn/ui
- 🔐 **Type-safe** - Built with TypeScript for reliability
- ⚡ **Performance Optimized** - Smart caching and efficient data fetching

## 🚀 Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Environment Variables (Optional!)

**NEW: Using The Graph subgraph - NO API KEYS NEEDED! 🎉**

The app now works out of the box with no configuration! Optionally create `.env.local` to customize:

```bash
# Optional: Network selection (defaults to Mainnet)
NEXT_PUBLIC_CHAIN_ID=1  # 1 = Mainnet, 11155111 = Sepolia
```

That's it! No RPC URLs or API keys required!

### 3. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

## 📖 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Step-by-step setup instructions
- **[Aave Integration](AAVE_INTEGRATION.md)** - Detailed technical documentation
- **[API Reference](#)** - Component and hook reference (see inline docs)

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Web3**: Wagmi, Viem, RainbowKit
- **Aave SDK**: @aave/contract-helpers, @aave/math-utils
- **State Management**: React Query (@tanstack/react-query)

## 📁 Project Structure

```
src/
├── app/                          # Next.js pages
│   ├── page.tsx                 # Main dashboard
│   ├── docs/                    # Documentation page
│   └── strategies/              # Strategies page
├── components/
│   ├── dashboard/               # Dashboard components
│   │   ├── portfolio-card.tsx  # Portfolio overview
│   │   ├── position-cards.tsx  # Position summary cards
│   │   └── positions-list.tsx  # Detailed positions list
│   └── ui/                      # Base UI components (shadcn)
├── hooks/
│   └── useAaveData.ts          # Custom Aave data hooks
├── lib/
│   └── aave/                    # Aave integration
│       ├── aaveService.ts      # Core service class
│       ├── config.ts           # Configuration
│       ├── utils.ts            # Utility functions
│       └── index.ts            # Main export
├── providers/
│   └── web3-provider.tsx       # Web3 provider setup
└── types/
    └── aave.ts                  # TypeScript types
```

## 🎯 Key Features Explained

### Portfolio Overview
- Total net worth across all positions
- Calculated net APY (weighted average)
- Estimated annual earnings
- Real-time position tracking

### Position Cards
- Total supplied assets with average APY
- GHO borrowed amount
- stkGHO staking balance
- Quick glance at your positions

### Detailed Positions List
- Tabbed view of supplies and borrows
- Individual asset breakdown
- Balance, USD value, and APY for each position
- Health factor and available borrowing capacity

## 🔧 Development

### Install Dependencies
```bash
yarn install
```

### Run Dev Server
```bash
yarn dev
```

### Build for Production
```bash
yarn build
yarn start
```

### Lint Code
```bash
yarn lint
```

## 🧪 Testing

### Test on Sepolia (Recommended)

1. Set `NEXT_PUBLIC_CHAIN_ID=11155111` in `.env.local`
2. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Use Aave on [Sepolia testnet](https://app.aave.com/)
4. Connect your wallet to see test positions

### Test on Mainnet

1. Set `NEXT_PUBLIC_CHAIN_ID=1` in `.env.local`
2. Connect wallet with existing Aave positions
3. View real portfolio data

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/):
- Button
- Card
- Input
- Tabs
- Custom loading states
- Error boundaries

## 📊 Aave Integration

### Supported Networks
- Ethereum Mainnet
- Sepolia Testnet

### Supported Features
- ✅ View supply positions
- ✅ View borrow positions
- ✅ Track GHO positions
- ✅ Monitor stkGHO staking
- ✅ Real-time APY tracking
- ✅ Health factor monitoring
- ⏳ Supply/Borrow transactions (coming soon)
- ⏳ Position management (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Resources

- [Aave Protocol](https://aave.com/)
- [Aave Docs](https://docs.aave.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

## 🙏 Acknowledgments

- Aave Protocol team for the excellent SDK
- shadcn for the beautiful UI components
- RainbowKit team for wallet integration
- Wagmi team for React hooks

---

Built with ❤️ using Next.js and the Aave Protocol
