/**
 * sGHO (Savings GHO) Test Script
 * 
 * This demonstrates how to fetch sGHO balance using the Aave GraphQL API.
 * Run with: node test-sgho-working.js
 * 
 * NOTE: sGHO APY is NOT available through the API.
 * See SGHO_IMPLEMENTATION.md for details and implementation notes.
 */

const fetch = require('node-fetch');

const AAVE_API = 'https://api.v3.aave.com/graphql';

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

// Working solution: Get sGHO balance
async function getSavingsGhoBalance(userAddress) {
  console.log('\n🔍 Getting sGHO balance...\n');
  
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
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, { userAddress });
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
      return null;
    } else {
      console.log('✅ Success! sGHO Balance:');
      const data = result.data.savingsGhoBalance;
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n📊 Summary:');
      console.log(`   Balance: ${data.amount.value} sGHO`);
      console.log(`   Value: $${data.usd}`);
      console.log(`   Price: $${data.usdPerToken} per sGHO`);
      
      return data;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Working solution: Get claimable merit rewards  
async function getUserMeritRewards(userAddress) {
  console.log('\n🔍 Getting claimable merit rewards...\n');
  
  const query = `
    query GetUserMeritRewards($userAddress: EvmAddress!) {
      userMeritRewards(
        request: { user: $userAddress, chainId: 1 }
      ) {
        chain
        claimable {
          currency {
            symbol
            name
            address
          }
          amount {
            raw
            value
            decimals
          }
        }
        transaction {
          to
          from
          data
        }
      }
    }
  `;

  try {
    const result = await queryGraphQL(query, { userAddress });
    if (result.errors) {
      console.error('❌ Error:', JSON.stringify(result.errors, null, 2));
      return null;
    } else {
      console.log('✅ Success! Merit Rewards:');
      const data = result.data.userMeritRewards;
      
      if (data && data.claimable && data.claimable.length > 0) {
        console.log('\n📊 Claimable Rewards:');
        data.claimable.forEach(reward => {
          console.log(`   ${reward.currency.symbol}: ${reward.amount.value}`);
        });
      } else {
        console.log('\n   No claimable rewards at this time');
      }
      
      return data;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Implementation summary
function showImplementationSummary() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   IMPLEMENTATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('✅ WORKING QUERIES:\n');
  
  console.log('1. savingsGhoBalance - Get user sGHO balance');
  console.log('   - Returns: balance, USD value, price per token');
  console.log('   - Status: ✅ Working\n');
  
  console.log('2. userMeritRewards - Get claimable GHO rewards');
  console.log('   - Returns: claimable rewards from weekly distributions');
  console.log('   - Status: ✅ Working\n');
  
  console.log('❌ APY ISSUE:\n');
  
  console.log('The sGHO APY is NOT directly available through the API.');
  console.log('According to Aave Discord:');
  console.log('  - APY is annualized from weekly distribution schedule');
  console.log('  - Rewards accrue in background, claimable after each round');
  console.log('  - No direct GraphQL field for current APY\n');
  
  console.log('💡 SOLUTION:\n');
  
  console.log('For your implementation, you can:');
  console.log('  1. Display sGHO balance using savingsGhoBalance query ✅');
  console.log('  2. Show APY as "N/A%" or "Varies Weekly" ⚠️');
  console.log('  3. (Optional) Fetch current APY from:');
  console.log('     - Aave app.aave.com frontend (inspect network calls)');
  console.log('     - Hardcode based on current rate (~5-8% typically)');
  console.log('     - Add manual update mechanism\n');
  
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run all tests with a real user
async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   sGHO WORKING SOLUTION TEST');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Test with an address that has sGHO
  const testAddress = '0xed88Bb12282fb2cF3B0D510Fcb47518F91aE6010';
  
  console.log(`\nTesting with address: ${testAddress}\n`);
  
  await getSavingsGhoBalance(testAddress);
  await getUserMeritRewards(testAddress);
  
  showImplementationSummary();
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run
runTests().catch(console.error);

