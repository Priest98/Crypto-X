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

const MIDL_REGTEST_API = 'https://mempool.regtest.midl.xyz/api';

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
export async function syncWallet(address: string): Promise<WalletSyncResult> {
    console.log('[MIDL Service] Syncing wallet:', address);

    try {
        // Fetch all data in parallel for performance
        const [balance, utxos, transactions] = await Promise.all([
            getBalance(address),
            fetchUtxos(address),
            fetchTransactions(address)
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
export async function fetchUtxos(address: string): Promise<UTXO[]> {
    console.log('[MIDL Service] Fetching UTXOs for:', address);
    console.log('[MIDL Service] API endpoint:', `${MIDL_REGTEST_API}/address/${address}/utxo`);

    try {
        const response = await fetch(`${MIDL_REGTEST_API}/address/${address}/utxo`);

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
export async function fetchTransactions(address: string): Promise<Transaction[]> {
    console.log('[MIDL Service] Fetching transactions for:', address);

    try {
        const response = await fetch(`${MIDL_REGTEST_API}/address/${address}/txs`);

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
 * Broadcast a signed transaction to the network
 */
export async function broadcastTransaction(signedTxHex: string): Promise<string> {
    console.log('[MIDL Service] Broadcasting transaction...');

    try {
        const response = await fetch(`${MIDL_REGTEST_API}/tx`, {
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
export async function getBalance(address: string): Promise<number> {
    console.log('[MIDL Service] Fetching balance for:', address);

    try {
        const response = await fetch(`${MIDL_REGTEST_API}/address/${address}`);

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
};
