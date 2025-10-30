import { ethers } from 'ethers';
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from '@aave/contract-helpers';
import { formatReserves, formatUserSummary } from '@aave/math-utils';
import type {
  AavePortfolio,
  UserPosition,
  FormattedUserSummary,
  GHOData,
  StakingData,
} from '@/types/aave';
import {
  getAaveAddresses,
  getRpcUrl,
  MARKET_REFERENCE_CURRENCY_DECIMALS,
} from './config';
import { formatTokenAmount, formatUSD, rayToPercent } from './utils';

// ERC20 ABI for token balance queries
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

/**
 * Service class for interacting with Aave protocol
 */
export class AaveService {
  private provider: ethers.providers.JsonRpcProvider;
  private chainId: number;
  private poolDataProvider: UiPoolDataProvider;

  constructor(chainId: number = ChainId.mainnet) {
    this.chainId = chainId;
    const rpcUrl = getRpcUrl(chainId);
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const addresses = getAaveAddresses(chainId);
    this.poolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: addresses.protocolDataProvider,
      provider: this.provider,
      chainId: this.chainId,
    });
  }

  /**
   * Get user's Aave portfolio data
   */
  async getUserPortfolio(userAddress: string): Promise<AavePortfolio> {
    try {
      const addresses = getAaveAddresses(this.chainId);

      // Fetch reserves and user reserves data
      const reserves = await this.poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: addresses.lendingPool,
      }).catch((error) => {
        if (error.code === 'CALL_EXCEPTION') {
          throw new Error(
            'RPC Error: Unable to connect to blockchain. Please set up a proper RPC URL in your .env.local file. ' +
            'Get a free API key from Alchemy (https://www.alchemy.com/) or Infura (https://www.infura.io/). ' +
            'See TESTING_GUIDE.md for setup instructions.'
          );
        }
        throw error;
      });

      const userReserves = await this.poolDataProvider.getUserReservesHumanized({
        lendingPoolAddressProvider: addresses.lendingPool,
        user: userAddress,
      }).catch((error) => {
        if (error.code === 'CALL_EXCEPTION') {
          throw new Error(
            'RPC Error: Unable to fetch user data. Check your RPC URL configuration in .env.local'
          );
        }
        throw error;
      });

      // Format the data
      const formattedReserves = formatReserves({
        reserves: reserves.reservesData,
        currentTimestamp: Math.floor(Date.now() / 1000),
        marketReferenceCurrencyDecimals: MARKET_REFERENCE_CURRENCY_DECIMALS,
        marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      const userSummary = formatUserSummary({
        currentTimestamp: Math.floor(Date.now() / 1000),
        marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: MARKET_REFERENCE_CURRENCY_DECIMALS,
        userReserves: userReserves.userReserves,
        formattedReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
      });

      // Parse supplies
      const supplies: UserPosition[] = userReserves.userReserves
        .filter((reserve) => parseFloat(reserve.scaledATokenBalance) > 0)
        .map((reserve) => {
          const formattedReserve = formattedReserves.find(
            (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
          );

          const balance = formatTokenAmount(
            reserve.scaledATokenBalance,
            formattedReserve?.decimals || 18
          );

          const priceInUSD = parseFloat(formattedReserve?.priceInUSD || '0');
          const balanceNum = parseFloat(balance.replace(/,/g, ''));
          const balanceUSD = (balanceNum * priceInUSD).toFixed(2);

          return {
            symbol: formattedReserve?.symbol || 'UNKNOWN',
            name: formattedReserve?.name || 'Unknown',
            balance,
            balanceUSD,
            apy: rayToPercent(formattedReserve?.supplyAPY || '0').toFixed(2),
            underlyingAsset: reserve.underlyingAsset,
            decimals: formattedReserve?.decimals || 18,
          };
        });

      // Parse borrows
      const borrows: UserPosition[] = userReserves.userReserves
        .filter((reserve) => parseFloat(reserve.scaledVariableDebt) > 0)
        .map((reserve) => {
          const formattedReserve = formattedReserves.find(
            (r) => r.underlyingAsset.toLowerCase() === reserve.underlyingAsset.toLowerCase()
          );

          const balance = formatTokenAmount(
            reserve.scaledVariableDebt,
            formattedReserve?.decimals || 18
          );

          const priceInUSD = parseFloat(formattedReserve?.priceInUSD || '0');
          const balanceNum = parseFloat(balance.replace(/,/g, ''));
          const balanceUSD = (balanceNum * priceInUSD).toFixed(2);

          return {
            symbol: formattedReserve?.symbol || 'UNKNOWN',
            name: formattedReserve?.name || 'Unknown',
            balance,
            balanceUSD,
            apy: rayToPercent(formattedReserve?.variableBorrowAPY || '0').toFixed(2),
            underlyingAsset: reserve.underlyingAsset,
            decimals: formattedReserve?.decimals || 18,
          };
        });

      return {
        supplies,
        borrows,
        totalSupplyUSD: parseFloat(userSummary.totalLiquidityUSD),
        totalBorrowUSD: parseFloat(userSummary.totalBorrowsUSD),
        netWorthUSD: parseFloat(userSummary.netWorthUSD),
        healthFactor: userSummary.healthFactor,
        availableBorrowsUSD: userSummary.availableBorrowsUSD,
        currentLTV: userSummary.currentLoanToValue,
      };
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      throw error;
    }
  }

  /**
   * Get GHO specific data for the user
   */
  async getGHOData(userAddress: string): Promise<GHOData | null> {
    try {
      const addresses = getAaveAddresses(this.chainId);
      
      if (!addresses.ghoToken) {
        return null; // GHO not available on this network
      }

      const ghoContract = new ethers.Contract(
        addresses.ghoToken,
        ERC20_ABI,
        this.provider
      );

      const balance = await ghoContract.balanceOf(userAddress);
      const decimals = await ghoContract.decimals();

      // Fetch portfolio to get GHO borrow data
      const portfolio = await this.getUserPortfolio(userAddress);
      const ghoBorrow = portfolio.borrows.find(
        (b) => b.symbol === 'GHO'
      );

      // Get stkGHO balance if available
      let stkGHOBalance = '0';
      if (addresses.stkGHO) {
        const stkGHOContract = new ethers.Contract(
          addresses.stkGHO,
          ERC20_ABI,
          this.provider
        );
        stkGHOBalance = await stkGHOContract.balanceOf(userAddress);
      }

      return {
        balance: formatTokenAmount(balance.toString(), decimals),
        balanceUSD: formatUSD(parseFloat(formatTokenAmount(balance.toString(), decimals))),
        borrowed: ghoBorrow?.balance || '0',
        borrowedUSD: ghoBorrow?.balanceUSD || '0',
        stakingBalance: formatTokenAmount(stkGHOBalance, decimals),
        stakingBalanceUSD: formatUSD(parseFloat(formatTokenAmount(stkGHOBalance, decimals))),
        borrowAPY: ghoBorrow?.apy || '0',
        supplyAPY: '0', // GHO typically doesn't earn supply APY
      };
    } catch (error) {
      console.error('Error fetching GHO data:', error);
      return null;
    }
  }

  /**
   * Get staking data (stkAAVE and stkGHO)
   */
  async getStakingData(userAddress: string): Promise<StakingData> {
    try {
      const addresses = getAaveAddresses(this.chainId);
      
      let stkAAVEBalance = '0';
      let stkGHOBalance = '0';

      // Get stkAAVE balance
      if (addresses.stkAAVE) {
        const stkAAVEContract = new ethers.Contract(
          addresses.stkAAVE,
          ERC20_ABI,
          this.provider
        );
        stkAAVEBalance = await stkAAVEContract.balanceOf(userAddress);
      }

      // Get stkGHO balance
      if (addresses.stkGHO) {
        const stkGHOContract = new ethers.Contract(
          addresses.stkGHO,
          ERC20_ABI,
          this.provider
        );
        stkGHOBalance = await stkGHOContract.balanceOf(userAddress);
      }

      // For demo, using approximate APY values
      // In production, fetch these from the protocol
      const stkAAVEAPY = '7.5';
      const stkGHOAPY = '3.2';

      return {
        stkAAVE: {
          balance: formatTokenAmount(stkAAVEBalance, 18),
          balanceUSD: '0', // Would need AAVE price to calculate
          apy: stkAAVEAPY,
        },
        stkGHO: {
          balance: formatTokenAmount(stkGHOBalance, 18),
          balanceUSD: formatUSD(parseFloat(formatTokenAmount(stkGHOBalance, 18))),
          apy: stkGHOAPY,
        },
      };
    } catch (error) {
      console.error('Error fetching staking data:', error);
      return {
        stkAAVE: { balance: '0', balanceUSD: '$0', apy: '0' },
        stkGHO: { balance: '0', balanceUSD: '$0', apy: '0' },
      };
    }
  }

  /**
   * Get user summary
   */
  async getUserSummary(userAddress: string): Promise<FormattedUserSummary | null> {
    try {
      const addresses = getAaveAddresses(this.chainId);

      const reserves = await this.poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: addresses.lendingPool,
      });

      const userReserves = await this.poolDataProvider.getUserReservesHumanized({
        lendingPoolAddressProvider: addresses.lendingPool,
        user: userAddress,
      });

      const formattedReserves = formatReserves({
        reserves: reserves.reservesData,
        currentTimestamp: Math.floor(Date.now() / 1000),
        marketReferenceCurrencyDecimals: MARKET_REFERENCE_CURRENCY_DECIMALS,
        marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      const userSummary = formatUserSummary({
        currentTimestamp: Math.floor(Date.now() / 1000),
        marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: MARKET_REFERENCE_CURRENCY_DECIMALS,
        userReserves: userReserves.userReserves,
        formattedReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
      });

      return userSummary as FormattedUserSummary;
    } catch (error) {
      console.error('Error fetching user summary:', error);
      return null;
    }
  }
}

