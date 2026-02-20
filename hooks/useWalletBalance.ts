import { useEffect, useState, useCallback } from 'react';
import { getWalletState } from '../services/midlClient';

/**
 * Custom hook for fetching Bitcoin balance with auto-refresh
 * 
 * This fetches balance directly from MIDL service and provides:
 * - Real blockchain balance via MIDL regtest API
 * - Auto-refresh every 30 seconds
 * - Manual refresh capability
 * - Proper loading and error states
 * - Wallet address from localStorage (StoreContext persistence)
 */
export function useWalletBalance() {
    const [balance, setBalance] = useState(0);
    const [utxos, setUtxos] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Get wallet address from localStorage (persisted by StoreContext)
    useEffect(() => {
        const checkWallet = () => {
            try {
                const saved = localStorage.getItem('velencia_wallet');
                if (saved) {
                    try {
                        const walletData = JSON.parse(saved);
                        if (walletData && typeof walletData === 'object' && walletData.address) {
                            setWalletAddress(walletData.address);
                        } else {
                            setWalletAddress(null);
                        }
                    } catch (e) {
                        setWalletAddress(null);
                    }
                } else {
                    setWalletAddress(null);
                }
            } catch (err) {
                console.warn('[useWalletBalance] Failed to parse wallet from localStorage:', err);
                setWalletAddress(null);
            }
        };

        // Check immediately
        checkWallet();

        // Listen for storage changes (wallet connection/disconnection)
        window.addEventListener('storage', checkWallet);

        // Also check periodically in case of same-tab updates
        const interval = setInterval(checkWallet, 1000);

        return () => {
            window.removeEventListener('storage', checkWallet);
            clearInterval(interval);
        };
    }, []);

    // Fetch wallet state (balance, utxos, transactions)
    const refreshWallet = useCallback(async () => {
        if (!walletAddress) {
            setBalance(0);
            setUtxos([]);
            setTransactions([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        console.log('[useWalletBalance] Syncing blockchain state for:', walletAddress);
        setIsLoading(true);
        setError(null);

        try {
            // DIRECT SDK SYNC: Fetch balance, utxos, and history in one go
            const state = await getWalletState(walletAddress);

            setBalance(state.balance);
            setUtxos(state.utxos);
            setTransactions(state.transactions);

            console.log('[useWalletBalance] SDK Sync Success:', {
                balance: state.balance,
                utxos: state.utxos.length
            });

            setError(null);
        } catch (err: any) {
            console.error('[useWalletBalance] SDK sync failed:', err);
            setError(err);
            // Keep showing last known values on temporary network errors
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress]);

    // Fetch wallet state when wallet address changes
    useEffect(() => {
        if (walletAddress) {
            refreshWallet();
        } else {
            setBalance(0);
            setUtxos([]);
            setTransactions([]);
            setIsLoading(false);
            setError(null);
        }
    }, [walletAddress, refreshWallet]);

    // Expose to window for global access if needed (as requested by component logic)
    useEffect(() => {
        (window as any).refreshWallet = refreshWallet;
        return () => { delete (window as any).refreshWallet; };
    }, [refreshWallet]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!walletAddress) return;

        const interval = setInterval(() => {
            console.log('[useWalletBalance] Auto-refreshing wallet state...');
            refreshWallet();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [walletAddress, refreshWallet]);

    // Manual refresh function
    const refresh = useCallback(() => {
        console.log('[useWalletBalance] Manual refresh triggered');
        refreshWallet();
    }, [refreshWallet]);

    return {
        balance: balance || 0,
        balanceBTC: balance ? Number(balance) / 100000000 : 0, // Convert sats to BTC
        balanceSats: balance || 0,
        isLoading,
        error,
        refresh,
        refreshWallet, // Export explicitly as requested
        isConnected: !!walletAddress,
        utxos,
        transactions
    };
}
