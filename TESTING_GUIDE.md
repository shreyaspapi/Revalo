# Testing Guide - Aave Integration

This guide will walk you through testing the Aave integration step by step.

## 🎯 Testing Options

You have two options for testing:

1. **Sepolia Testnet** (Recommended) - Use fake tokens, no risk
2. **Ethereum Mainnet** - Use real positions (if you have them)

---

## Option 1: Testing on Sepolia Testnet (Recommended) ⭐

This is the safest way to test since you'll use test tokens with no real value.

### Step 1: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Use Sepolia testnet
NEXT_PUBLIC_CHAIN_ID=11155111

# Get RPC URLs from Alchemy (free tier works fine)
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Get from WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Step 2: Get Free API Keys

#### A. Alchemy RPC (5 minutes)

1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for free account
3. Click "Create new app"
4. Fill in:
   - Name: "Revalo"
   - Chain: Ethereum
   - Network: Sepolia (for test), Mainnet (for prod)
5. Click on your app
6. Click "API Key" button
7. Copy the HTTP URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/...`)
8. Paste into your `.env.local` file

**Repeat for both Mainnet and Sepolia networks.**

#### B. WalletConnect Project ID (3 minutes)

1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Sign up for free account
3. Click "Create New Project"
4. Name it "Revalo"
5. Copy the Project ID
6. Paste into your `.env.local` file

### Step 3: Get Sepolia Test ETH

You need Sepolia ETH to use Aave on testnet:

**Faucets (pick one):**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

**Steps:**
1. Visit a faucet
2. Enter your wallet address
3. Complete CAPTCHA or login requirement
4. Wait 1-2 minutes for ETH to arrive
5. Check your wallet - you should see ~0.5 SepoliaETH

### Step 4: Create Test Positions on Aave

Now create some positions to test with:

1. **Go to Aave App:** [https://app.aave.com/](https://app.aave.com/)

2. **Switch to Sepolia:**
   - Click network selector (top right)
   - Select "Sepolia testnet"
   - Connect your wallet

3. **Get Test Tokens:**
   - Go to "Faucet" in Aave app (should appear on testnet)
   - Request test DAI, USDC, or other tokens
   - Wait for transaction to confirm

4. **Supply Assets:**
   - Go to "Dashboard"
   - Click "Supply" next to DAI or USDC
   - Enter amount (e.g., 100 DAI)
   - Approve and confirm transactions
   - Wait for confirmation

5. **Borrow Assets (Optional):**
   - After supplying, you can borrow
   - Click "Borrow" next to an asset
   - Enter amount (stay well below your limit!)
   - Confirm transaction

### Step 5: Run Your App

```bash
# Install dependencies (if not already done)
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Test the Integration

1. **Connect Wallet:**
   - Click "Connect Wallet" button
   - Select your wallet (MetaMask)
   - Make sure you're on Sepolia network
   - Approve connection

2. **Check Data Loading:**
   - You should see a loading spinner first
   - Data should load within 5-10 seconds
   - Check browser console (F12) for any errors

3. **Verify Portfolio Card:**
   - ✅ Shows your total net worth (should match Aave app)
   - ✅ Shows Net APY percentage
   - ✅ Shows estimated annual earnings
   - ✅ Values update automatically

4. **Verify Position Cards:**
   - ✅ Total Supplied shows your supply value
   - ✅ GHO Borrowed shows amount (if you borrowed GHO)
   - ✅ stkGHO shows staking balance
   - ✅ APY percentages are displayed

5. **Verify Positions List:**
   - ✅ Click "Supplies" tab - see your supplied assets
   - ✅ Click "Borrows" tab - see your borrowed assets
   - ✅ Each position shows balance, USD value, and APY
   - ✅ Health factor is displayed
   - ✅ Available to borrow is shown

6. **Test Auto-Refresh:**
   - Wait 15 seconds
   - Data should refresh automatically
   - Check Network tab in DevTools to see API calls

### Step 7: Test Edge Cases

1. **Test Wallet Disconnection:**
   - Disconnect wallet from MetaMask
   - App should show "Connect wallet" prompt

2. **Test Network Switch:**
   - Switch to a different network (e.g., Ethereum Mainnet)
   - App should show "No positions" or error

3. **Test Empty State:**
   - Use a wallet with no Aave positions
   - Should show "No Aave positions found"

---

## Option 2: Testing on Ethereum Mainnet

**⚠️ Warning:** This uses real money and real positions. Only do this if you already have Aave positions.

### Step 1: Update Environment

Update `.env.local`:

```bash
# Use Ethereum Mainnet
NEXT_PUBLIC_CHAIN_ID=1

# Your RPC URLs
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Step 2: Connect Wallet

1. Start the app: `yarn dev`
2. Connect wallet with existing Aave positions
3. Make sure you're on Ethereum Mainnet
4. Your real positions should load

### Step 3: Verify Data Accuracy

Cross-check with Aave app:
1. Open [https://app.aave.com/](https://app.aave.com/) in another tab
2. Compare values:
   - Total supplied
   - Total borrowed
   - Individual positions
   - APY percentages
   - Health factor

Values should match within ~1% (due to block timing).

---

## 🔍 What to Test

### ✅ Functional Testing Checklist

**Basic Functionality:**
- [ ] App starts without errors
- [ ] Wallet connects successfully
- [ ] Data loads within 10 seconds
- [ ] All components render properly
- [ ] No console errors

**Portfolio Card:**
- [ ] Shows correct net worth
- [ ] Net APY displays (positive or negative)
- [ ] Estimated earnings calculated
- [ ] Loading state works
- [ ] Error state works (try disconnecting internet)

**Position Cards:**
- [ ] Total supplied is accurate
- [ ] GHO borrowed is accurate
- [ ] stkGHO balance is correct
- [ ] APY values are reasonable
- [ ] Loading spinners work

**Positions List:**
- [ ] Supplies tab shows all supplied assets
- [ ] Borrows tab shows all borrowed assets
- [ ] Balances match Aave app
- [ ] USD values are correct
- [ ] APY for each position is shown
- [ ] Health factor displays
- [ ] Available to borrow is accurate

**Auto-Refresh:**
- [ ] Data refreshes every 15 seconds
- [ ] No memory leaks (check memory in DevTools)
- [ ] Polling stops when tab is inactive (optional)

**Edge Cases:**
- [ ] Works with no positions
- [ ] Works when wallet disconnected
- [ ] Handles network errors gracefully
- [ ] Works after network switch
- [ ] Works after wallet change

### 🎨 Visual Testing

**Responsive Design:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

**Browsers:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Brave

**Dark/Light Mode:**
- [ ] Components are readable in both modes

---

## 🐛 Troubleshooting

### Problem: "Cannot connect wallet"

**Solution:**
1. Install MetaMask extension
2. Create/unlock wallet
3. Make sure you're on correct network
4. Try refreshing page

### Problem: "Error loading portfolio"

**Possible causes:**
1. **Invalid RPC URL**
   - Check `.env.local` has correct URLs
   - Verify API key is valid
   - Check you haven't hit rate limits

2. **Wrong network**
   - Check `NEXT_PUBLIC_CHAIN_ID` matches network in wallet
   - Sepolia = 11155111
   - Mainnet = 1

3. **No internet connection**
   - Check internet connection
   - Check firewall settings

**Debug steps:**
```bash
# Check console for errors
# Press F12 -> Console tab

# Look for red error messages
# Copy error and search documentation
```

### Problem: "No positions found" but I have positions

**Solutions:**
1. **Wrong wallet:**
   - Make sure you're connected with the correct wallet
   - Check wallet address matches Aave positions

2. **Wrong network:**
   - If positions on Mainnet, use `NEXT_PUBLIC_CHAIN_ID=1`
   - If positions on Sepolia, use `NEXT_PUBLIC_CHAIN_ID=11155111`

3. **Data not synced:**
   - Wait 15 seconds for auto-refresh
   - Try manually refreshing page
   - Check Aave app to confirm positions exist

### Problem: Values don't match Aave app

**This is normal if:**
- Difference is < 1% (blocks update at different times)
- APY changes frequently (that's normal)

**This is a problem if:**
- Values are completely different
- Check you're comparing same network
- Check both apps show same wallet address

### Problem: "Rate limit exceeded"

**Solution:**
1. You've hit free tier limits on RPC provider
2. Options:
   - Wait 1 minute and try again
   - Upgrade to paid RPC tier
   - Use different RPC provider
   - Increase polling interval in `src/lib/aave/config.ts`:
   ```typescript
   export const POLLING_INTERVAL = 30000; // Change to 30 seconds
   ```

### Problem: Data takes too long to load

**Solutions:**
1. **Slow RPC:**
   - Try different RPC provider
   - Use paid tier for faster responses

2. **Too many positions:**
   - This is normal for users with many positions
   - Consider implementing pagination

3. **Network issues:**
   - Check internet speed
   - Try on different network

---

## 📊 Expected Performance

**Loading Times:**
- Initial load: 3-10 seconds
- Auto-refresh: 1-3 seconds
- Network switch: 5-8 seconds

**Data Accuracy:**
- Should match Aave app within 1%
- Updates every 15 seconds
- Real-time during active usage

---

## 🧪 Advanced Testing

### Test with Multiple Wallets

```typescript
// Test these scenarios:
1. Wallet with many positions (10+)
2. Wallet with few positions (1-2)
3. Wallet with no positions
4. Wallet with only supplies
5. Wallet with only borrows
6. Wallet with GHO borrowed
7. Wallet with stkGHO staked
```

### Test Network Switching

```typescript
// Steps:
1. Load app on Sepolia with positions
2. Switch to Mainnet in wallet
3. Check app handles gracefully
4. Switch back to Sepolia
5. Verify data reloads correctly
```

### Test Error Recovery

```typescript
// Steps:
1. Load app successfully
2. Disconnect internet
3. Wait for error state
4. Reconnect internet
5. Verify data reloads automatically
```

---

## ✅ Success Criteria

Your integration is working correctly if:

1. ✅ Wallet connects without errors
2. ✅ Data loads within 10 seconds
3. ✅ All positions display correctly
4. ✅ Values match Aave app (within 1%)
5. ✅ APY calculations are reasonable
6. ✅ Auto-refresh works
7. ✅ Loading states appear
8. ✅ Error states are user-friendly
9. ✅ Empty states work
10. ✅ No console errors
11. ✅ No linter errors
12. ✅ Responsive on mobile

---

## 📹 Demo Video (Optional)

Record a quick test:
1. Connect wallet
2. Show portfolio loading
3. Show all positions
4. Switch between tabs
5. Show auto-refresh

This helps verify everything works end-to-end!

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for errors (F12)
2. Review `AAVE_INTEGRATION.md` troubleshooting section
3. Verify all environment variables are set
4. Try Sepolia testnet first
5. Check that all dependencies installed: `yarn install`

---

## Next Steps After Testing

Once testing is complete:

1. ✅ Document any issues found
2. ✅ Fix bugs if needed
3. ✅ Deploy to production
4. ✅ Monitor RPC usage
5. ✅ Set up error tracking (optional)

Happy testing! 🚀

