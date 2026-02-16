import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { mempoolService, FormattedTransaction } from '../services/mempoolService';

/**
 * Custom hook for fetching transaction history
 * 
 * Automatically fetches transactions when wallet connects
 * and provides manual refresh capability
 */
export function useTransactionHistory() {
    const { wallet, network } = useStore();
    const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!wallet?.address) {
            setTransactions([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const rawTxs = await mempoolService.getAddressTransactions(wallet.address, network);
            const formattedTxs = await mempoolService.formatTransactions(rawTxs, wallet.address, network);
            setTransactions(formattedTxs);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to fetch transactions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [wallet?.address, network]);

    // Fetch on wallet connect or network change
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        if (!wallet?.address) return;

        const interval = setInterval(() => {
            fetchTransactions();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, [fetchTransactions, wallet?.address]);

    return {
        transactions,
        isLoading,
        error,
        refresh: fetchTransactions,
    };
}
