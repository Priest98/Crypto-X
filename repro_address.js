
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import fs from 'fs';

const network = bitcoin.networks.regtest;
const dummyHash = Buffer.alloc(20, 0x11); // 20 bytes of 0x11

try {
    const { address } = bitcoin.payments.p2wpkh({ hash: dummyHash, network });
    console.log('Valid Regtest Address:', address);

    fs.writeFileSync('valid_address.txt', address);
    console.log('Address written to valid_address.txt');

} catch (error) {
    console.error('Error:', error.message);
}
