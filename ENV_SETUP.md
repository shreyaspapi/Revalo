# Environment Variables Setup

This guide will help you set up the required environment variables for Revalo.

## Quick Start

Create a `.env.local` file in the root directory with the following content:

```env
# Required: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Required Variables

### WalletConnect Project ID

**Required for wallet connection to work.**

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
   ```

## Optional Variables

### The Graph API Key (Optional for Future Use)

**Note:** Currently not required as the app uses free public gateways for The Graph subgraphs.

The app queries The Graph's decentralized network to get your Aave positions. It uses free public gateways by default. If you experience rate limits in the future, you can get a Graph API key:

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Create a free account
3. Create an API key (optional)

For now, this is not needed.

### RPC Endpoints (Not Required)

**The app no longer requires RPC endpoints!**

The app now uses Aave's official GraphQL API exclusively, which provides all the data needed without requiring RPC calls. The RPC configuration options have been removed to simplify setup.

## Example .env.local File

```env
# Required - WalletConnect Project ID for wallet connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456

# Optional - Default network (defaults to Ethereum Mainnet)
# NEXT_PUBLIC_CHAIN_ID=1
```

That's it! Just one required environment variable.

## Supported Networks

The app uses Aave's official GraphQL API, which **only supports mainnet chains**:

- ✅ **Ethereum Mainnet** (Chain ID: 1)
- ✅ **Polygon** (Chain ID: 137)
- ✅ **Arbitrum** (Chain ID: 42161)
- ✅ **Optimism** (Chain ID: 10)
- ✅ **Base** (Chain ID: 8453)
- ✅ **Gnosis** (Chain ID: 100)

**❌ Testnet chains (Sepolia, Goerli, etc.) are NOT supported** by the official Aave API.

## Troubleshooting

### "Failed to fetch" error
- This usually means the Aave GraphQL API is temporarily unavailable
- Check your internet connection
- Try refreshing the page
- The official Aave API is highly reliable, so this should be rare

### "indexedDB is not defined" error
- This error should be fixed in the latest version
- If you still see it, try clearing your browser cache and restarting the dev server

### WalletConnect warnings
- "WalletConnect Core is already initialized" (multiple times) - This is a **known issue** with React Strict Mode in development
- React Strict Mode intentionally double-mounts components to help detect side effects
- This warning **only appears in development** and will not occur in production builds
- The app will work perfectly despite this warning - it's cosmetic only
- To verify: Run `yarn build && yarn start` - the warning will disappear in production mode

### "Chain ID not supported" error
- This means you're connected to an unsupported network (likely a testnet)
- **Solution:** Switch your wallet to one of the supported mainnet chains listed above
- The official Aave API does not support testnet chains

### No data showing after connecting wallet
- Make sure you're connected to a supported mainnet chain (see list above)
- Verify you have actual positions in Aave Protocol on that chain
- Check the browser console for any error messages

## Next Steps

After setting up your `.env.local` file:

1. Restart your development server:
   ```bash
   yarn dev
   ```

2. Open your browser to http://localhost:3000

3. Connect your wallet and start using Revalo!

