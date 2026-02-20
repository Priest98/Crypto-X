
import { midlService } from './lib/midlService.js';

// Test with the valid address from valid_address.txt
const testAddress = 'bcrt1qzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3lgth6c';

async function testMidlService() {
    console.log('=== Testing midlService ===');
    console.log('Test address:', testAddress);
    console.log('');

    // Test 1: Get balance
    console.log('1. Testing getBalance...');
    try {
        const balance = await midlService.getBalance(testAddress);
        console.log('✅ Balance:', balance, 'sats');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    // Test 2: Get UTXOs
    console.log('2. Testing getUtxos...');
    try {
        const utxos = await midlService.getUtxos(testAddress);
        console.log('✅ UTXOs found:', utxos.length);
        if (utxos.length > 0) {
            console.log('✅ First UTXO:', utxos[0]);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    // Test 3: Fetch transactions
    console.log('3. Testing fetchTransactions...');
    try {
        const transactions = await midlService.fetchTransactions(testAddress);
        console.log('✅ Transactions found:', transactions.length);
        if (transactions.length > 0) {
            console.log('✅ First transaction:', transactions[0]);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    console.log('');

    // Test 4: Sync wallet
    console.log('4. Testing syncWallet...');
    try {
        const walletState = await midlService.syncWallet(testAddress);
        console.log('✅ Sync successful');
        console.log('   Balance:', walletState.balance, 'sats');
        console.log('   UTXOs:', walletState.utxos.length);
        console.log('   Transactions:', walletState.transactions.length);
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testMidlService();
