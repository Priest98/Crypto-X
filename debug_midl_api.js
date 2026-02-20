
const API_URL = 'https://mempool.staging.midl.xyz/api';
// Use the address from constants.ts that we just fixed
const STORE_ADDRESS = 'bcrt1q6rhng852dd3602521100566336c11100566336';

async function checkAddress(address) {
    console.log(`Checking address: ${address}`);
    try {
        const res = await fetch(`${API_URL}/address/${address}`);
        if (!res.ok) {
            console.error(`Error fetching address: ${res.status} ${res.statusText}`);
            return;
        }
        const data = await res.json();
        console.log('Address Info:', JSON.stringify(data, null, 2));

        const confirmed = (data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0);
        const unconfirmed = (data.mempool_stats?.funded_txo_sum || 0) - (data.mempool_stats?.spent_txo_sum || 0);
        console.log(`Balance: ${confirmed + unconfirmed} (Confirmed: ${confirmed}, Unconfirmed: ${unconfirmed})`);

        const resUtxo = await fetch(`${API_URL}/address/${address}/utxo`);
        if (!resUtxo.ok) {
            console.error(`Error fetching UTXO: ${resUtxo.status} ${resUtxo.statusText}`);
            return;
        }
        const utxos = await resUtxo.json();
        console.log(`UTXOs found: ${utxos.length}`);
        console.log('UTXOs:', JSON.stringify(utxos, null, 2));
    } catch (e) {
        console.error('Error fetching address data:', e);
    }
}

checkAddress(STORE_ADDRESS);
