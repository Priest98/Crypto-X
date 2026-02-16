// lib/walletService.ts
import { midl, syncWallet } from './midlService';

/**
 * Wallet Service - High-level wallet operations
 * Wraps MIDL service with convenient methods for wallet management
 */

export interface WalletData {
    balance: number;
    utxos: any[];
    transactions: any[];
}

/**
 * Get complete wallet data (balance, UTXOs, transactions)
 * This syncs the wallet with the blockchain before returning data
 */
export async function getWalletData(address: string): Promise<WalletData> {
    console.log('[WalletService] Getting wallet data for:', address);

    const { balance, utxos, transactions } = await syncWallet(address);

    console.log('[WalletService] Wallet balance:', balance);
    console.log('[WalletService] Wallet UTXOs:', utxos.length);
    console.log('[WalletService] Wallet transactions:', transactions.length);

    return {
        balance,
        utxos,
        transactions
    };
}

/**
 * Refresh wallet balance only
 */
export async function refreshBalance(address: string): Promise<number> {
    console.log('[WalletService] Refreshing balance for:', address);
    const balance = await midl.getBalance(address);
    console.log('[WalletService] Balance:', balance, 'sats');
    return balance;
}

/**
 * Check if wallet has sufficient UTXOs for a transaction
 */
export async function hasSpendableUTXOs(address: string, requiredAmount: number): Promise<boolean> {
    console.log('[WalletService] Checking spendable UTXOs for:', address, 'amount:', requiredAmount);

    const utxos = await midl.getUtxos(address);
    const confirmedUtxos = utxos.filter(u => u.status.confirmed);

    const totalSpendable = confirmedUtxos.reduce((sum, utxo) => sum + utxo.value, 0);

    console.log('[WalletService] Total spendable:', totalSpendable, 'sats from', confirmedUtxos.length, 'confirmed UTXOs');

    return totalSpendable >= requiredAmount;
}
