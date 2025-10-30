/**
 * Test script for Aave GraphQL API queries
 * Run with: node test-aave-api.js
 */

const fetch = require('node-fetch');

const AAVE_API = 'https://api.v3.aave.com/graphql';

// Test configuration
const TEST_CONFIG = {
  marketAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Ethereum Mainnet Pool
  chainId: 1,
  userAddress: '0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c', // Example address with positions (Aave deployer)
};

async function queryGraphQL(query, variables) {
  const response = await fetch(AAVE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  return data;
}

// Test 1: Get supported chains
async function testChains() {
  console.log('\n🔍 Test 1: Getting supported chains...\n');
  
  const query = `
    query Chains {
      chains {
        name
        chainId
        icon
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, {});
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! Supported chains:');
      result.data.chains.forEach(chain => {
        console.log(`   - ${chain.name} (Chain ID: ${chain.chainId})`);
      });
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test 2: Get user supplies
async function testUserSupplies() {
  console.log('\n🔍 Test 2: Getting user supplies...\n');
  
  const query = `
    query GetUserSupplies($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userSupplies(
        request: {
          markets: [{ address: $marketAddress, chainId: $chainId }]
          user: $userAddress
        }
      ) {
        market {
          name
          chain {
            chainId
          }
        }
        currency {
          symbol
          name
          address
          decimals
        }
        balance {
          amount {
            value
            decimals
          }
          usd
        }
        apy {
          raw
          decimals
          value
          formatted
        }
        isCollateral
        canBeCollateral
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, TEST_CONFIG);
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! User supplies:');
      console.log(JSON.stringify(result.data.userSupplies, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test 3: Get user borrows
async function testUserBorrows() {
  console.log('\n🔍 Test 3: Getting user borrows...\n');
  
  const query = `
    query GetUserBorrows($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userBorrows(
        request: {
          markets: [{ address: $marketAddress, chainId: $chainId }]
          user: $userAddress
        }
      ) {
        market {
          name
          chain {
            chainId
          }
        }
        currency {
          symbol
          name
          address
          decimals
        }
        debt {
          amount {
            value
            decimals
          }
          usd
        }
        apy {
          raw
          decimals
          value
          formatted
        }
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, TEST_CONFIG);
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! User borrows:');
      console.log(JSON.stringify(result.data.userBorrows, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test 4: Get user market state
async function testUserMarketState() {
  console.log('\n🔍 Test 4: Getting user market state...\n');
  
  const query = `
    query GetUserMarketState($marketAddress: EvmAddress!, $chainId: ChainId!, $userAddress: EvmAddress!) {
      userMarketState(
        request: {
          market: $marketAddress
          chainId: $chainId
          user: $userAddress
        }
      ) {
        netWorth
        netAPY {
          raw
          decimals
          value
          formatted
        }
        healthFactor
        eModeEnabled
        totalCollateralBase
        totalDebtBase
        availableBorrowsBase
        currentLiquidationThreshold {
          raw
          decimals
          value
          formatted
        }
        ltv {
          raw
          decimals
          value
          formatted
        }
        isInIsolationMode
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, TEST_CONFIG);
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! User market state:');
      console.log(JSON.stringify(result.data.userMarketState, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Test 5: Introspection query to get MarketUserState schema
async function testIntrospection() {
  console.log('\n🔍 Test 5: Getting MarketUserState schema...\n');
  
  const query = `
    query IntrospectionQuery {
      __type(name: "MarketUserState") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, {});
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ MarketUserState schema:');
      console.log(JSON.stringify(result.data.__type, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Aave GraphQL API Test Suite');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nTesting with:');
  console.log(`  Market: ${TEST_CONFIG.marketAddress}`);
  console.log(`  Chain ID: ${TEST_CONFIG.chainId}`);
  console.log(`  User: ${TEST_CONFIG.userAddress}`);
  console.log('\n═══════════════════════════════════════════════════════════');

  await testChains();
  await testUserSupplies();
  await testUserBorrows();
  await testUserMarketState();
  await testIntrospection();
  await testGHOMarketData();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   Tests Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Test: Get sGHO balance with APY
async function testGHOMarketData() {
  console.log('\n🔍 Test: Getting sGHO balance with APY...\n');
  
  const query = `
    query GetSavingsGhoBalance($userAddress: EvmAddress!) {
      savingsGhoBalance(
        request: { user: $userAddress }
      ) {
        usdPerToken
        amount {
          raw
          value
          decimals
        }
        usd
        apy {
          raw
          decimals
          value
          formatted
        }
      }
    }
  `;

  const variables = {
    userAddress: '0xed88Bb12282fb2cF3B0D510Fcb47518F91aE6010', // Address with sGHO
  };

  try {
    const result = await queryGraphQL(query, variables);
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! sGHO Balance with APY:');
      console.log(JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Also test global sGHO info
  console.log('\n🔍 Test: Getting global sGHO info...\n');
  
  const globalQuery = `
    query GetSavingsGhoInfo {
      savingsGho {
        apy {
          raw
          decimals
          value
          formatted
        }
        totalDeposited
        priceUsd
      }
    }
  `;

  try {
    const result = await queryGraphQL(globalQuery, {});
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
    } else {
      console.log('✅ Success! Global sGHO Info:');
      console.log(JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the tests
runAllTests().catch(console.error);

