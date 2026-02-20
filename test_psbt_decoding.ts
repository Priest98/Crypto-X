
import * as bitcoin from 'bitcoinjs-lib';

async function testDecoding() {
    console.log('Testing PSBT Decoding Logic...');

    // 1. Create a dummy PSBT
    const network = bitcoin.networks.regtest;
    const psbt = new bitcoin.Psbt({ network });

    // Mock UTXO
    const utxo = {
        txid: 'a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0',
        vout: 0,
        value: 50000
    };
    const sender = 'bcrt1qzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3lgth6c';
    const script = bitcoin.address.toOutputScript(sender, network);

    psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: { script, value: BigInt(utxo.value) }
    });

    psbt.addOutput({ address: sender, value: BigInt(49000) });

    const base64 = psbt.toBase64();
    console.log('Generated PSBT Base64');

    // 2. Simulate logic in midlClient.ts
    try {
        console.log('Attempting to decode...');
        const tempPsbt = bitcoin.Psbt.fromBase64(base64);
        const signingIndexes = tempPsbt.txInputs.map((_, i) => i);
        console.log('Signing Indexes:', signingIndexes);

        if (signingIndexes.length !== 1 || signingIndexes[0] !== 0) {
            throw new Error('Incorrect signing indexes calculated');
        }
        console.log('SUCCESS: Decoding logic works');
    } catch (e) {
        console.error('FAILURE: Decoding logic failed', e);
    }
}

testDecoding();
