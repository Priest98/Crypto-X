import { useEffect, useState, useCallback } from 'react';
import { midl } from '../lib/midlService';

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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Get wallet address from localStorage (persisted by StoreContext)
    useEffect(() => {
        const checkWallet = () => {
            try {
                const saved = localStorage.getItem('cryptox_wallet');
                if (saved) {
                    const walletData = JSON.parse(saved);
                    setWalletAddress(walletData.address || null);
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

    // Fetch balance from blockchain
    const fetchBalance = useCallback(async () => {
        if (!walletAddress) {
            setBalance(0);
            setIsLoading(false);
            setError(null);
            return;
        }

        console.log('[useWalletBalance] Fetching balance for:', walletAddress);
        setIsLoading(true);
        setError(null);

        try {
            const fetchedBalance = await midl.getBalance(walletAddress);
            console.log('[useWalletBalance] Balance fetched:', fetchedBalance, 'sats');
            setBalance(fetchedBalance);
            setError(null);
        } catch (err: any) {
            console.error('[useWalletBalance] Failed to fetch balance:', err);
            setError(err);
            // Don't reset balance on error - keep showing last known balance
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress]);

    // Fetch balance when wallet address changes
    useEffect(() => {
        if (walletAddress) {
            fetchBalance();
        } else {
            setBalance(0);
            setIsLoading(false);
            setError(null);
        }
    }, [walletAddress, fetchBalance]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!walletAddress) return;

        const interval = setInterval(() => {
            console.log('[useWalletBalance] Auto-refreshing balance...');
            fetchBalance();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [walletAddress, fetchBalance]);

    // Manual refresh function
    const refresh = useCallback(() => {
        console.log('[useWalletBalance] Manual refresh triggered');
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance: balance || 0,
        balanceBTC: balance ? Number(balance) / 100000000 : 0, // Convert sats to BTC
        balanceSats: balance || 0,
        isLoading,
        error,
        refresh,
        isConnected: !!walletAddress,
    };
}
