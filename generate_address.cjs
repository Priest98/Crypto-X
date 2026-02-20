
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');

bitcoin.initEccLib(ecc);

const network = bitcoin.networks.regtest;

const keyPair = bitcoin.ECPair.makeRandom({ network });
const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });

console.log('Valid Regtest Address:', address);
