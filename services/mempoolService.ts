import { Network } from '../types';
import { NETWORK_CONFIG } from '../constants';

export interface Transaction {
    txid: string;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_hash?: string;
        block_time?: number;
    };
    vin: Array<{
        txid: string;
        vout: number;
        prevout: {
            scriptpubkey: string;
            scriptpubkey_address: string;
            value: number;
        };
    }>;
    vout: Array<{
        scriptpubkey: string;
        scriptpubkey_address: string;
        value: number;
    }>;
    size: number;
    weight: number;
    fee: number;
}

export interface FormattedTransaction {
    txid: string;
    type: 'incoming' | 'outgoing';
    amount: number; // in satoshis
    amountBTC: number; // in BTC
    confirmed: boolean;
    confirmations: number;
    timestamp?: number;
    fee?: number;
    blockHeight?: number;
}

/**
 * Mempool API Service
 * 
 * Fetches transaction data from the Mempool API for different Bitcoin networks.
 * Used for transaction history since MIDL SDK doesn't provide this functionality.
 */
class MempoolService {
    private getApiUrl(network: Network): string {
        return NETWORK_CONFIG[network].mempoolApi;
    }

    /**
     * Fetch transaction history for an address
     */
    async getAddressTransactions(address: string, network: Network): Promise<Transaction[]> {
        const apiUrl = this.getApiUrl(network);

        try {
            const response = await fetch(`${apiUrl}/address/${address}/txs`);

            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.statusText}`);
            }

            const transactions: Transaction[] = await response.json();
            return transactions;
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }
    }

    /**
     * Get current block height (for calculating confirmations)
     */
    async getCurrentBlockHeight(network: Network): Promise<number> {
        const apiUrl = this.getApiUrl(network);

        try {
            const response = await fetch(`${apiUrl}/blocks/tip/height`);

            if (!response.ok) {
                throw new Error(`Failed to fetch block height: ${response.statusText}`);
            }

            const height = await response.text();
            return parseInt(height, 10);
        } catch (error) {
            console.error('Error fetching block height:', error);
            return 0;
        }
    }

    /**
     * Format raw transactions into user-friendly format
     */
    async formatTransactions(
        transactions: Transaction[],
        userAddress: string,
        network: Network
    ): Promise<FormattedTransaction[]> {
        const currentHeight = await this.getCurrentBlockHeight(network);

        return transactions.map(tx => {
            // Determine if incoming or outgoing
            const isIncoming = tx.vout.some(
                out => out.scriptpubkey_address === userAddress
            );

            const isOutgoing = tx.vin.some(
                input => input.prevout.scriptpubkey_address === userAddress
            );

            // Calculate amount
            let amount = 0;

            if (isIncoming && !isOutgoing) {
                // Pure incoming transaction
                amount = tx.vout
                    .filter(out => out.scriptpubkey_address === userAddress)
                    .reduce((sum, out) => sum + out.value, 0);
            } else if (isOutgoing) {
                // Outgoing transaction (or both)
                const sent = tx.vin
                    .filter(input => input.prevout.scriptpubkey_address === userAddress)
                    .reduce((sum, input) => sum + input.prevout.value, 0);

                const received = tx.vout
                    .filter(out => out.scriptpubkey_address === userAddress)
                    .reduce((sum, out) => sum + out.value, 0);

                amount = received - sent; // Negative if net outgoing
            }

            // Calculate confirmations
            const confirmations = tx.status.confirmed && tx.status.block_height
                ? currentHeight - tx.status.block_height + 1
                : 0;

            return {
                txid: tx.txid,
                type: amount >= 0 ? 'incoming' : 'outgoing',
                amount: Math.abs(amount),
                amountBTC: Math.abs(amount) / 100000000,
                confirmed: tx.status.confirmed,
                confirmations,
                timestamp: tx.status.block_time,
                fee: tx.fee,
                blockHeight: tx.status.block_height,
            };
        });
    }

    /**
     * Get transaction details by txid
     */
    async getTransaction(txid: string, network: Network): Promise<Transaction> {
        const apiUrl = this.getApiUrl(network);

        try {
            const response = await fetch(`${apiUrl}/tx/${txid}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch transaction: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
    }
}

export const mempoolService = new MempoolService();
