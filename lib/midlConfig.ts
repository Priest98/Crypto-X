import { createMidlConfig } from "@midl/satoshi-kit";
import { regtest } from "@midl/core";
import { QueryClient } from "@tanstack/react-query";

/**
 * MIDL SDK Configuration using Satoshi-Kit
 * 
 * Matches official MIDL demo setup with:
 * - Automatic Xverse connector integration
 * - Connection state persistence
 * - Bitcoin Regtest network
 */
export const midlConfig = createMidlConfig({
    networks: [regtest],
    persist: true,
});

/**
 * React Query Client for caching blockchain data
 * 
 * Provides:
 * - Automatic caching of balance and UTXO queries
 * - Auto-refetch every 30 seconds
 * - Optimistic UI updates
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            experimental_prefetchInRender: true,
            staleTime: 30000, // Consider data fresh for 30 seconds
            refetchInterval: 30000, // Auto-refetch every 30 seconds
            retry: 2, // Retry failed requests twice
        },
    },
});
