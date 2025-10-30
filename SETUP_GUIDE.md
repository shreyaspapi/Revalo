# Revalo - Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- Yarn package manager
- MetaMask or another Web3 wallet

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Revalo
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```bash
# Required: Network Configuration
NEXT_PUBLIC_CHAIN_ID=1

# Required: Get your own RPC URLs (free tier available)
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Required: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Get API Keys (Free)

#### A. Alchemy RPC (Recommended)

1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up for free account
3. Create a new app
4. Select "Ethereum" → "Mainnet"
5. Copy the HTTP URL
6. Repeat for Sepolia testnet

#### B. WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up for free account
3. Create a new project
4. Copy the Project ID

### 4. Run the App

```bash
# Development mode
yarn dev

# Open http://localhost:3000
```

### 5. Connect Your Wallet

1. Click "Connect Wallet" button in the top right
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection

### 6. View Your Aave Positions

If you have existing Aave positions, they will load automatically!

---

## Testing on Sepolia Testnet

Want to test without using real funds?

### 1. Switch to Sepolia

Update `.env.local`:
```bash
NEXT_PUBLIC_CHAIN_ID=11155111
```

### 2. Get Testnet ETH

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### 3. Use Aave on Sepolia

1. Go to [Aave App](https://app.aave.com/)
2. Switch to Sepolia network
3. Supply and borrow test tokens
4. Return to your app to view positions

---

## Troubleshooting

### "Cannot connect to wallet"
- Make sure MetaMask is installed
- Check that you're on the correct network (Mainnet or Sepolia)
- Try refreshing the page

### "Error loading portfolio"
- Verify your RPC URL is correct
- Check that you have API credits remaining
- Check browser console for detailed errors

### "No positions found"
- Ensure you have active positions on Aave
- Verify you're connected to the correct wallet
- Check that you're on the correct network

### RPC Rate Limits
If using free RPC tier:
- Requests are limited (usually 30-100 per second)
- Increase polling interval in `src/lib/aave/config.ts`
- Or upgrade to paid RPC tier

---

## What You Can Do

✅ **View Portfolio**
- Total net worth
- Net APY
- Estimated annual earnings

✅ **See Positions**
- Supply positions with balances and APYs
- Borrow positions with debt and APYs
- Total values in USD

✅ **Track Health**
- Health factor
- Available to borrow
- Loan-to-value ratio

✅ **Real-time Updates**
- Auto-refresh every 15 seconds
- Manual refresh available

---

## Project Structure

```
src/
├── app/                      # Next.js app router pages
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── portfolio-card.tsx
│   │   ├── position-cards.tsx
│   │   └── positions-list.tsx
│   └── ui/                  # Base UI components
├── hooks/
│   └── useAaveData.ts       # Custom Aave hooks
├── lib/
│   └── aave/
│       ├── config.ts        # Aave configuration
│       ├── aaveService.ts   # Aave service class
│       └── utils.ts         # Utility functions
├── providers/
│   └── web3-provider.tsx    # Web3 provider setup
└── types/
    └── aave.ts              # TypeScript types
```

---

## Next Steps

1. **Read Full Documentation**: See `AAVE_INTEGRATION.md` for detailed technical docs
2. **Customize**: Modify components to match your needs
3. **Extend**: Add more features like transactions, charts, alerts
4. **Deploy**: Deploy to Vercel, Netlify, or your hosting of choice

---

## Support

- Check `AAVE_INTEGRATION.md` for technical details
- Review code comments for inline documentation
- Open an issue for bugs or questions

---

## Important Notes

⚠️ **Security**
- Never commit your `.env.local` file
- Keep your API keys private
- Use environment variables for all secrets

⚠️ **Costs**
- Free RPC tiers have rate limits
- Consider paid tier for production
- Monitor your API usage

⚠️ **Networks**
- Mainnet = real money
- Sepolia = test network (no real value)
- Always test on Sepolia first!

---

Happy building! 🚀

