
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.regtest;

// Generate random keypair
const keyPair = ECPair.makeRandom({ network });
const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });

console.log('Valid Regtest Address:', address);
