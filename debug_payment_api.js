
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api/payments';

// Test case 1: Check if server is running
console.log('1. Testing server connection...');
try {
    const response = await fetch('http://localhost:3001/');
    const text = await response.text();
    console.log('✅ Server is running:', text);
} catch (error) {
    console.error('❌ Server connection error:', error.message);
}

// Test case 2: Check /api/payments/verify endpoint with invalid TXID
console.log('\n2. Testing verify endpoint with invalid TXID...');
try {
    const response = await fetch(`${BASE_URL}/verify/invalid_txid`);
    const data = await response.json();
    console.log('✅ Verify endpoint response:', data);
} catch (error) {
    console.error('❌ Verify endpoint error:', error.message);
}

// Test case 3: Check /api/payments/store endpoint
console.log('\n3. Testing store endpoint...');
const testPaymentData = {
    txid: 'test_txid_123',
    orderId: 'test_order_456',
    amount: 10000,
    walletAddress: 'bcrt1qzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3lgth6c',
    network: 'regtest'
};

try {
    const response = await fetch(`${BASE_URL}/store`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPaymentData)
    });
    const data = await response.json();
    console.log('✅ Store endpoint response:', data);
} catch (error) {
    console.error('❌ Store endpoint error:', error.message);
}
