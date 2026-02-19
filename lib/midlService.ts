// lib/midlService.ts

/**
 * MIDL Service - Blockchain Interaction Layer
 * 
 * Handles:
 * - Wallet synchronization (balance, UTXOs, transactions)
 * - UTXO fetching for transaction construction
 * - Transaction broadcasting
 * - Blockchain state management
 */

import { Buffer } from 'buffer';
import { NETWORK_CONFIG } from '../constants';

export interface WalletSyncResult {
    balance: number; // in satoshis
    utxos: UTXO[];
    transactions: Transaction[];
}

export interface UTXO {
    txid: string;
    vout: number;
    value: number; // in satoshis
    status: {
        confirmed: boolean;
        block_height?: number;
    };
}

export interface Transaction {
    txid: string;
    status?: {
        confirmed: boolean;
        block_height?: number;
    };
    vin: any[];
    vout: any[];
    fee?: number;
}

/**
 * Sync wallet state with blockchain
 * Fetches balance, UTXOs, and transaction history
 */
export async function syncWallet(address: string, network: string = 'regtest'): Promise<WalletSyncResult> {
    console.log('[MIDL Service] Syncing wallet:', address, 'on', network);

    try {
        // Fetch all data in parallel for performance
        const [balance, utxos, transactions] = await Promise.all([
            getBalance(address, network),
            fetchUtxos(address, network),
            fetchTransactions(address, network)
        ]);

        console.log('[MIDL Service] Wallet synced - Balance:', balance, 'UTXOs:', utxos.length, 'Txs:', transactions.length);

        return {
            balance,
            utxos,
            transactions,
        };
    } catch (error) {
        console.error('[MIDL Service] Wallet sync failed:', error);
        throw new Error('Failed to sync wallet with blockchain');
    }
}

/**
 * Fetch spendable UTXOs for an address
 */
export async function fetchUtxos(address: string, network: string = 'regtest'): Promise<UTXO[]> {
    const apiBase = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].mempoolApi;
    console.log('[MIDL Service] Fetching UTXOs for:', address);
    console.log('[MIDL Service] API endpoint:', `${apiBase}/address/${address}/utxo`);

    try {
        const response = await fetch(`${apiBase}/address/${address}/utxo`);

        console.log('[MIDL Service] UTXO fetch response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MIDL Service] UTXO fetch failed with error:', errorText);
            throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
        }

        const utxos: UTXO[] = await response.json();

        console.log('[MIDL Service] Raw UTXO response:', JSON.stringify(utxos, null, 2));
        console.log('[MIDL Service] Found', utxos.length, 'UTXOs');
        return utxos;
    } catch (error) {
        console.error('[MIDL Service] UTXO fetch failed:', error);
        return [];
    }
}

/**
 * Fetch transaction history for an address
 */
export async function fetchTransactions(address: string, network: string = 'regtest'): Promise<Transaction[]> {
    const apiBase = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].mempoolApi;
    console.log('[MIDL Service] Fetching transactions for:', address);

    try {
        const response = await fetch(`${apiBase}/address/${address}/txs`);

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        const txs: Transaction[] = await response.json();

        console.log('[MIDL Service] Found', txs.length, 'transactions');
        return txs;
    } catch (error) {
        console.error('[MIDL Service] Transaction fetch failed:', error);
        return [];
    }
}

/**
 * Construct a PSBT (Partially Signed Bitcoin Transaction) for Xverse to sign
 */
export async function constructPSBT(
    senderAddress: string,
    recipientAddress: string,
    amountSats: number,
    networkName: string = 'regtest'
): Promise<string> {
    console.log('[MIDL Service] Constructing PSBT...');
    console.log('[MIDL Service] Sender:', senderAddress);
    console.log('[MIDL Service] Recipient:', recipientAddress);
    console.log('[MIDL Service] Amount:', amountSats, 'sats');

    try {
        const bitcoin = await import('bitcoinjs-lib');
        // CRITICAL: We use Testnet network here because we are using tb1 addresses (Testnet format)
        // to spoof Xverse. The resulting scriptPubKey (00 14 <hash>) is identical to Regtest
        // so it remains valid on the Regtest chain.
        // We use Regtest network now as Xverse is correctly configured for Regtest
        const network = bitcoin.networks.regtest;

        // Fetch UTXOs
        const utxos = await fetchUtxos(senderAddress, networkName);
        console.log('[MIDL Service] Available UTXOs:', utxos.length);

        if (utxos.length === 0) {
            throw new Error('No UTXOs available');
        }

        // Estimate fee: 1 sat/vbyte * ~180 vbytes
        const estimatedFee = 200; // sats
        const totalNeeded = amountSats + estimatedFee;

        // Select UTXOs
        let selectedUtxos: UTXO[] = [];
        let totalInput = 0;

        for (const utxo of utxos) {
            selectedUtxos.push(utxo);
            totalInput += utxo.value;
            if (totalInput >= totalNeeded) break;
        }

        if (totalInput < totalNeeded) {
            throw new Error(`Insufficient funds. Have: ${totalInput}, Need: ${totalNeeded}`);
        }

        const change = totalInput - amountSats - estimatedFee;
        console.log('[MIDL Service] Selected', selectedUtxos.length, 'UTXOs, Change:', change);

        // Create PSBT
        const psbt = new bitcoin.Psbt({ network });

        // Add inputs
        for (const utxo of selectedUtxos) {
            // For SegWit addresses (bcrt1q...), we use witnessUtxo instead of nonWitnessUtxo
            // witnessUtxo requires: script (scriptPubKey) and value

            // Get the scriptPubKey for this address
            const script = bitcoin.address.toOutputScript(senderAddress, network);

            psbt.addInput({
                hash: utxo.txid,
                index: utxo.vout,
                witnessUtxo: {
                    script: script,
                    value: BigInt(utxo.value),
                },
                sighashType: 1, // SIGHASH_ALL
            });
        }

        // Add recipient output
        psbt.addOutput({
            address: recipientAddress,
            value: BigInt(amountSats),
        });

        // Add change output if > dust
        if (change > 1000) {
            psbt.addOutput({
                address: senderAddress,
                value: BigInt(change),
            });
        }

        console.log('[MIDL Service] PSBT constructed successfully');
        return psbt.toBase64();
    } catch (error) {
        console.error('[MIDL Service] PSBT construction failed:', error);
        throw error;
    }
}

/**
 * Broadcast a signed transaction to the network
 */
export async function broadcastTransaction(signedTxHex: string, network: string = 'regtest'): Promise<string> {
    const apiBase = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].mempoolApi;
    console.log('[MIDL Service] Broadcasting transaction...');

    try {
        const response = await fetch(`${apiBase}/tx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: signedTxHex,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Broadcast failed: ${errorText}`);
        }

        const txid = await response.text();
        console.log('[MIDL Service] Transaction broadcasted successfully:', txid);

        return txid;
    } catch (error) {
        console.error('[MIDL Service] Broadcast failed:', error);
        throw error;
    }
}

/**
 * Get current balance for an address (in satoshis)
 */
export async function getBalance(address: string, network: string = 'regtest'): Promise<number> {
    const apiBase = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].mempoolApi;
    console.log('[MIDL Service] Fetching balance for:', address);

    try {
        const response = await fetch(`${apiBase}/address/${address}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch balance: ${response.statusText}`);
        }

        const data = await response.json();

        // Calculate confirmed + unconfirmed balance
        const confirmed = (data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0);
        const unconfirmed = (data.mempool_stats?.funded_txo_sum || 0) - (data.mempool_stats?.spent_txo_sum || 0);
        const totalBalance = confirmed + unconfirmed;

        console.log('[MIDL Service] Balance:', totalBalance, 'sats (confirmed:', confirmed, 'unconfirmed:', unconfirmed, ')');
        return totalBalance;
    } catch (error) {
        console.error('[MIDL Service] Balance fetch failed:', error);
        return 0;
    }
}

/**
 * Get UTXOs for an address (alias for fetchUtxos)
 */
export async function getUtxos(address: string): Promise<UTXO[]> {
    return fetchUtxos(address);
}

/**
 * Export midl object for compatibility
 */
export const midl = {
    syncWallet,
    getBalance,
    getUtxos,
    fetchUtxos,
    fetchTransactions,
    broadcastTransaction,
    constructPSBT,
};

/**
 * Export midlService object
 */
export const midlService = {
    syncWallet,
    fetchUtxos,
    fetchTransactions,
    broadcastTransaction,
    getBalance,
    getUtxos,
    constructPSBT,
};
