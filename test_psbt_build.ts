
import * as bitcoin from 'bitcoinjs-lib';

async function testPSBT() {
    console.log('Testing PSBT Construction...');
    try {
        const network = bitcoin.networks.regtest;
        const sender = 'bcrt1qzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3lgth6c';
        const recipient = 'bcrt1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
        const amount = 10000;

        const psbt = new bitcoin.Psbt({ network });

        // Mock UTXO
        const utxo = {
            txid: 'a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0',
            vout: 0,
            value: 50000
        };

        const script = bitcoin.address.toOutputScript(sender, network);
        console.log('Sender Script:', script.toString('hex'));

        psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                script: script,
                value: BigInt(utxo.value)
            }
        });

        psbt.addOutput({
            address: recipient,
            value: BigInt(amount)
        });

        // Change
        psbt.addOutput({
            address: sender,
            value: BigInt(utxo.value - amount - 200)
        });

        console.log('PSBT constructed successfully');
        console.log('Base64:', psbt.toBase64());
    } catch (e) {
        console.error('PSBT Validation Failed:', e);
    }
}

testPSBT();
