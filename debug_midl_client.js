
import * as bitcoin from 'bitcoinjs-lib';
import { midlClient } from './lib/midlClient';

// Test wallet info (replace with valid test data if needed)
const testWallet = {
    address: 'tb1qzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3apj6d3', // Testnet4 address
    type: 'Xverse'
};

const testAmount = 1000; // 1000 sats
const testRecipient = 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4'; // Store address

// Test midlClient functionality
async function debugMidlClient() {
    try {
        console.log('=== Testing MidlClient ===');
        console.log('Current network:', 'testnet4');
        console.log('Test wallet:', testWallet.address);
        console.log('Recipient address:', testRecipient);
        console.log('Amount:', testAmount, 'sats');

        // Test if midlClient is initialized correctly
        console.log('midlClient exists:', !!midlClient);

        // Test mapToSatsConnectNetwork
        const satsNetwork = midlClient.mapToSatsConnectNetwork('testnet4');
        console.log('Sats Connect network:', satsNetwork);

        // Test PSBT construction (requires actual network access)
        console.log('=== Testing PSBT construction ===');
        const { midlService } = await import('./lib/midlService');
        try {
            const psbt = await midlService.constructPSBT(
                testWallet.address,
                testRecipient,
                testAmount
            );
            console.log('PSBT constructed successfully');
            console.log('PSBT length:', psbt.length, 'bytes');
        } catch (error) {
            console.error('Error constructing PSBT:', error);
            console.error('Stack trace:', error.stack);
        }
    } catch (error) {
        console.error('=== DEBUG ERROR ===');
        console.error('Error:', error);
        console.error('Stack trace:', error.stack);
    }
}

debugMidlClient();
