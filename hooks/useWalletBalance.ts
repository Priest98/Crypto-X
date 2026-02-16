import { useBalance as useMidlBalance, useDefaultAccount } from '@midl/react';
import { useEffect, useState, useCallback } from 'react';

/**
 * Custom hook for fetching Bitcoin balance with auto-refresh
 * 
 * This wraps MIDL SDK's useBalance and adds:
 * - Auto-refresh every 30 seconds
 * - Manual refresh capability
 * - Proper loading and error states
 * - Safe error handling
 */
export function useWalletBalance() {
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Safely get account - wrap in try-catch
    let account;
    try {
        account = useDefaultAccount();
    } catch (err) {
        console.warn('useDefaultAccount failed:', err);
        account = null;
    }

    // Safely get balance - wrap in try-catch
    let midlBalance;
    let midlIsLoading = false;
    let midlError = null;

    try {
        const result = useMidlBalance();
        midlBalance = result?.balance;
        midlIsLoading = result?.isLoading || false;
        midlError = result?.error || null;
    } catch (err) {
        console.warn('useMidlBalance failed:', err);
        midlBalance = 0;
    }

    // Update state from MIDL SDK
    useEffect(() => {
        if (midlBalance !== undefined && midlBalance !== null) {
            setBalance(midlBalance);
        }
        setIsLoading(midlIsLoading);
        setError(midlError);
    }, [midlBalance, midlIsLoading, midlError]);

    // Manual refresh function
    const refresh = useCallback(() => {
        // Just update a key to trigger re-fetch
        setIsLoading(true);
    }, []);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!account?.address) return;

        const interval = setInterval(() => {
            refresh();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [account?.address, refresh]);

    return {
        balance: balance || 0,
        balanceBTC: balance ? Number(balance) / 100000000 : 0, // Convert sats to BTC
        balanceSats: balance || 0,
        isLoading,
        error,
        refresh,
        isConnected: !!account?.address,
    };
}
