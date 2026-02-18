// lib/midlClient.ts
import { getAddress, sendBtcTransaction, AddressPurpose, BitcoinNetworkType } from 'sats-connect';

export interface MidlConfig {
    apiKey: string;
    rpcUrl: string;
    network: 'mainnet' | 'testnet' | 'testnet4' | 'signet' | 'regtest';
}

export interface ConnectWalletParams {
    wallet: 'Xverse' | 'UniSat';
    network: MidlConfig['network'];
}

export interface MidlWalletData {
    address: string;
    paymentAddress?: string;
    ordinalsAddress?: string;
    publicKey?: string;
    walletType: 'Xverse' | 'UniSat';
}

export class MidlClient {
    private config: MidlConfig;
    private connectedWallet: 'Xverse' | 'UniSat' | null = null;
    private activeNetwork: MidlConfig['network'];

    constructor(config: MidlConfig) {
        this.config = config;
        this.activeNetwork = config.network;
    }

    async connectWallet(params: ConnectWalletParams): Promise<MidlWalletData> {
        const { wallet, network } = params;
        this.connectedWallet = wallet;
        this.activeNetwork = network; // Update active network on connection

        if (wallet === 'Xverse') {
            return this.connectXverse(network);
        } else if (wallet === 'UniSat') {
            return this.connectUniSat(network);
        }
        throw new Error('Unsupported wallet provider');
    }

    disconnect() {
        this.connectedWallet = null;
    }

    async executeBitcoinPayment(amountSats: number, recipient: string, network: MidlConfig['network'], walletType?: 'Xverse' | 'UniSat', senderAddress?: string): Promise<string> {
        // Allow overriding or setting the connected wallet type (e.g. from persisted state)
        if (walletType) {
            this.connectedWallet = walletType;
        }
        this.activeNetwork = network; // Ensure active network is current

        if (!this.connectedWallet) {
            // Try to auto-detect if already connected via window (fallback)
            if (typeof (window as any).unisat !== 'undefined') {
                try {
                    const accounts = await (window as any).unisat.getAccounts();
                    if (accounts.length > 0) {
                        this.connectedWallet = 'UniSat';
                    }
                } catch (e) { /* ignore */ }
            }
        }

        if (!this.connectedWallet) {
            throw new Error("No wallet connected. Please connect a wallet first.");
        }

        if (!senderAddress) {
            throw new Error("Sender address is required for UTXO-based transactions.");
        }

        console.log(`[Midl] Executing payment via ${this.connectedWallet} on ${network}`);
        console.log(`[Midl] Amount: ${amountSats} sats | Recipient: ${recipient} | Sender: ${senderAddress}`);

        // CRITICAL: Sync wallet with blockchain before sending
        // This ensures we have fresh UTXOs and accurate balance
        if (network === 'regtest') {
            console.log('[Midl] Syncing wallet with blockchain...');
            try {
                const { midlService } = await import('./midlService');
                const syncResult = await midlService.syncWallet(senderAddress);

                console.log('[Midl] Wallet synced successfully');
                console.log(`[Midl] Balance: ${syncResult.balance} sats`);
                console.log(`[Midl] Available UTXOs: ${syncResult.utxos.length}`);

                // Validate sufficient balance
                if (Number(syncResult.balance) < amountSats) {
                    throw new Error(`Insufficient funds. Balance: ${syncResult.balance} sats, Required: ${amountSats} sats`);
                }

                // Validate UTXOs exist
                if (syncResult.utxos.length === 0) {
                    throw new Error('No spendable UTXOs found. Please fund your wallet first.');
                }
            } catch (error: any) {
                console.error('[Midl] Wallet sync failed:', error);
                throw new Error(`Wallet sync failed: ${error.message}`);
            }
        }

        if (this.connectedWallet === 'Xverse') {
            return this.sendXverseTransaction(amountSats, recipient, network, senderAddress);
        } else if (this.connectedWallet === 'UniSat') {
            return this.sendUniSatTransaction(amountSats, recipient, network);
        }

        throw new Error("Unknown connected wallet type");
    }

    // --- Internal Helpers ---

    private mapToSatsConnectNetwork(network: MidlConfig['network']): BitcoinNetworkType {
        console.log(`[Midl] Mapping network: ${network}`);

        switch (network) {
            case 'mainnet': return BitcoinNetworkType.Mainnet;
            case 'testnet': return BitcoinNetworkType.Testnet;
            case 'testnet4':
                // sats-connect v4 explicitly supports Testnet4. Fallback to string if enum mismatch.
                try {
                    return BitcoinNetworkType.Testnet4 || (BitcoinNetworkType as any).Testnet_4 || 'Testnet4' as any;
                } catch (e) {
                    return 'Testnet4' as any;
                }
            case 'signet': return BitcoinNetworkType.Signet;
            case 'regtest': return BitcoinNetworkType.Regtest;
            default: return BitcoinNetworkType.Testnet;
        }
    }

    private async connectXverse(network: MidlConfig['network']): Promise<MidlWalletData> {
        const tryConnect = async (netType: BitcoinNetworkType): Promise<MidlWalletData> => {
            return new Promise((resolve, reject) => {
                const purposes = network === 'regtest'
                    ? [AddressPurpose.Payment]
                    : [AddressPurpose.Payment, AddressPurpose.Ordinals];

                getAddress({
                    payload: {
                        purposes: purposes,
                        message: `Connect to ${network} via Midl SDK`,
                        network: { type: netType }
                    },
                    onFinish: (res) => {
                        const payment = res.addresses.find(a => a.purpose === AddressPurpose.Payment);
                        const ordinals = res.addresses.find(a => a.purpose === AddressPurpose.Ordinals);

                        if (payment && (ordinals || network === 'regtest')) {
                            resolve({
                                address: payment.address,
                                paymentAddress: payment.address,
                                ordinalsAddress: ordinals?.address,
                                publicKey: payment.publicKey,
                                walletType: 'Xverse'
                            });
                        } else {
                            reject(new Error('Missing addresses'));
                        }
                    },
                    onCancel: () => reject(new Error('USER_CANCELLED')),
                    // App metadata for mobile deep linking / trust
                    app: {
                        name: 'Velencia',
                        icon: window.location.origin + '/vite.svg', // Ensure this exists or use valid URL
                    }
                });
            });
        };

        const btcNetwork = this.mapToSatsConnectNetwork(network);

        if (network === 'regtest') {
            try {
                await this.suggestMidlNetwork();
                // CRITICAL: Wait for Xverse to fetch balance from staging endpoint
                console.log('[Midl] Waiting for Xverse to sync balance from staging endpoint...');
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                console.log('[Midl] Network configured, Xverse should now have balance');
            } catch (e) {
                console.warn('[Midl] Network suggestion failed:', e);
            }
        }

        try {
            console.log(`[Midl] Attempting connection with ${btcNetwork}...`);
            return await tryConnect(btcNetwork);
        } catch (error: any) {
            // Adaptive Retry: If mismatch occurs, try fallback to Testnet
            if (error.message !== 'USER_CANCELLED' && btcNetwork !== BitcoinNetworkType.Testnet) {
                console.warn(`[Midl] Connection with ${btcNetwork} failed. Retrying with Testnet fallback...`);
                try {
                    return await tryConnect(BitcoinNetworkType.Testnet);
                } catch (retryError) {
                    throw retryError;
                }
            }
            throw error;
        }
    }

    async setupRegtest(): Promise<void> {
        console.log('[Midl] Setting up Regtest network...');
        await this.suggestMidlNetwork();
    }

    private async suggestMidlNetwork() {
        const { request } = await import('sats-connect');
        try {
            await request('wallet_addNetwork', {
                chain: 'bitcoin',
                name: 'MIDL Regtest',
                type: BitcoinNetworkType.Regtest,
                rpcUrl: 'https://mempool.staging.midl.xyz/api',
                rpcFallbackUrl: 'https://mempool.staging.midl.xyz/api',
                indexerUrl: 'https://mempool.staging.midl.xyz/api',
                blockExplorerUrl: 'https://mempool.staging.midl.xyz',
                switch: true
            });
            console.log('[Midl] Successfully suggested MIDL Regtest network with staging indexer');
        } catch (error) {
            console.warn("Midl network suggestion ignored/failed:", error);
            throw error; // Re-throw to let UI know
        }
    }

    private async connectUniSat(network: MidlConfig['network']): Promise<MidlWalletData> {
        if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');

        await (window as any).unisat.requestAccounts();
        const accounts = await (window as any).unisat.getAccounts();

        try {
            // UniSat uses string IDs: 'livenet', 'testnet', 'testnet4', 'signet'
            let unisatNetwork = 'testnet';
            if (network === 'mainnet') unisatNetwork = 'livenet';
            else unisatNetwork = network;

            await (window as any).unisat.switchNetwork(unisatNetwork);
        } catch (e) {
            console.warn('UniSat network switch failed/ignored', e);
        }

        return {
            address: accounts[0],
            paymentAddress: accounts[0],
            ordinalsAddress: accounts[0],
            walletType: 'UniSat'
        };
    }

    private async sendXverseTransaction(amount: number, recipient: string, network: MidlConfig['network'], senderAddress?: string): Promise<string> {
        if (!senderAddress) {
            throw new Error('Sender address is required for PSBT construction');
        }

        const btcNetwork = this.mapToSatsConnectNetwork(network);
        console.log(`[Midl] Using new sign-then-broadcast flow`);
        console.log(`[Midl] Network: ${btcNetwork}, Amount: ${amount}, Recipient: ${recipient}`);

        try {
            // Step 1: Construct PSBT using our MIDL service
            console.log('[Midl] Step 1: Constructing PSBT...');
            const { midlService } = await import('./midlService');
            const psbtBase64 = await midlService.constructPSBT(senderAddress, recipient, amount);
            console.log('[Midl] PSBT constructed successfully');

            // Step 2: Have Xverse sign the PSBT (but NOT broadcast)
            console.log('[Midl] Step 2: Requesting Xverse signature...');
            const { signTransaction } = await import('sats-connect');

            const signedPsbt = await new Promise<string>((resolve, reject) => {
                signTransaction({
                    payload: {
                        network: { type: btcNetwork },
                        message: `Sign payment of ${amount} sats to ${recipient}`,
                        psbtBase64,
                        broadcast: false, // DON'T let Xverse broadcast
                        inputsToSign: [{
                            address: senderAddress,
                            signingIndexes: [0], // Sign first input (we can have multiple inputs)
                        }],
                    },
                    onFinish: (response: any) => {
                        console.log('[Midl] Xverse signature received');
                        const signed = response.psbtBase64 || response.psbt || response;
                        resolve(signed);
                    },
                    onCancel: () => {
                        console.log('[Midl] Xverse signature cancelled');
                        reject(new Error('USER_CANCELLED'));
                    },
                });
            });

            // Step 3: Extract the signed transaction hex from PSBT
            console.log('[Midl] Step 3: Extracting signed transaction...');
            const bitcoin = await import('bitcoinjs-lib');
            const psbt = bitcoin.Psbt.fromBase64(signedPsbt);

            // For P2WPKH, we can extract directly without finalizing
            // The signature from Xverse should already be complete
            try {
                // Try to finalize (this validates signatures)
                psbt.finalizeAllInputs();
                console.log('[Midl] PSBT finalized successfully');
            } catch (finalizeError: any) {
                console.warn('[Midl] Finalization failed, attempting direct extraction:', finalizeError.message);
                // If finalization fails, try to extract anyway
                // Xverse might have already finalized it
            }

            const signedTxHex = psbt.extractTransaction().toHex();
            console.log('[Midl] Transaction hex extracted');

            // Step 4: Broadcast ourselves to staging endpoint
            console.log('[Midl] Step 4: Broadcasting to staging endpoint...');
            const txid = await midlService.broadcastTransaction(signedTxHex);
            console.log('[Midl] Transaction broadcasted successfully:', txid);

            return txid;
        } catch (error: any) {
            console.error('[Midl] Transaction failed:', error);
            throw error;
        }
    }

    private async sendUniSatTransaction(amount: number, recipient: string, network: MidlConfig['network']): Promise<string> {
        if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');
        // Double check network?
        return await (window as any).unisat.sendBitcoin(recipient, amount);
    }
}

// Instantiate and Export
const MIDL_API_KEY = import.meta.env.VITE_MIDL_API_KEY || '';
const MIDL_RPC_URL = import.meta.env.VITE_MIDL_RPC_URL || 'https://rpc.midl.xyz';

export const midlClient = new MidlClient({
    apiKey: MIDL_API_KEY,
    rpcUrl: MIDL_RPC_URL,
    network: 'testnet',
});

export const isMidlReady = () => true;
