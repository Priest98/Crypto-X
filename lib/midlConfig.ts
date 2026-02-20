import { createMidlConfig } from "@midl/satoshi-kit";
import { BitcoinNetwork, regtest } from "@midl/core";
import { QueryClient } from "@tanstack/react-query";

// Custom Regtest that accepts 'tb' addresses (Xverse Testnet Spoofing)
const customRegtest: BitcoinNetwork = {
    ...regtest,
    id: 'regtest',
    name: 'Regtest',
    network: 'regtest',
    bech32: 'tb', // CRITICAL: Accept tb1 addresses from Xverse
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bip32: {
        public: 0x043587cf,
        private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
} as any as BitcoinNetwork;

/**
 * MIDL SDK Configuration using Satoshi-Kit
 * 
 * Matches official MIDL demo setup with:
 * - Automatic Xverse connector integration
 * - Connection state persistence
 * - Bitcoin Regtest network (Spoofed to accept Testnet addresses)
 */
export const midlConfig = createMidlConfig({
    networks: [customRegtest],
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
