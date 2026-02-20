
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import fs from 'fs';

// Use Testnet instead of Regtest
const network = bitcoin.networks.testnet;
const dummyHash = Buffer.alloc(20, 0x11); // 20 bytes of 0x11

try {
    const { address } = bitcoin.payments.p2wpkh({ hash: dummyHash, network });
    console.log('Valid Testnet Address:', address);

    fs.writeFileSync('valid_testnet_address.txt', address);

} catch (error) {
    console.error('Error:', error.message);
}
