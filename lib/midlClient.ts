// lib/midlClient.ts
import { getAddress, sendBtcTransaction, signMessage, AddressPurpose, BitcoinNetworkType } from 'sats-connect';

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
                const syncResult = await midlService.syncWallet(senderAddress, network);

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
                try {
                    return BitcoinNetworkType.Testnet4 || (BitcoinNetworkType as any).Testnet_4 || 'Testnet4' as any;
                } catch (e) {
                    return 'Testnet4' as any;
                }
            case 'signet': return BitcoinNetworkType.Signet;
            // CRITICAL: Spoof Regtest as Testnet to force Xverse to use our custom endpoints
            // and avoid Mainnet fallback / Ordinal checks that fail
            case 'regtest': return BitcoinNetworkType.Regtest;
            default: return BitcoinNetworkType.Testnet;
        }
    }

    private async connectXverse(network: MidlConfig['network']): Promise<MidlWalletData> {
        const tryConnect = async (netType: BitcoinNetworkType): Promise<MidlWalletData> => {
            return new Promise((resolve, reject) => {
                // We strictly request ONLY Payment address to avoid overhead and simplify
                const purposes = [AddressPurpose.Payment];

                getAddress({
                    payload: {
                        purposes: purposes,
                        message: `Connect to ${network} via Midl SDK`,
                        network: { type: netType }
                    },
                    onFinish: (res) => {
                        const payment = res.addresses.find(a => a.purpose === AddressPurpose.Payment);

                        // We no longer look for ordinals address
                        if (payment) {
                            resolve({
                                address: payment.address,
                                paymentAddress: payment.address,
                                publicKey: payment.publicKey,
                                walletType: 'Xverse'
                            });
                        } else {
                            reject(new Error('Missing payment address'));
                        }
                    },
                    onCancel: () => reject(new Error('USER_CANCELLED')),
                    app: {
                        name: 'Velencia',
                        icon: window.location.origin + '/vite.svg',
                    }
                });
            });
        };

        const btcNetwork = this.mapToSatsConnectNetwork(network);

        if (network === 'regtest') {
            try {
                await this.suggestMidlNetwork();
                console.log('[Midl] Waiting for Xverse to sync...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn('[Midl] Network suggestion failed:', e);
            }
        }

        try {
            console.log(`[Midl] Attempting connection with ${btcNetwork}...`);
            return await tryConnect(btcNetwork);
        } catch (error: any) {
            if (error.message !== 'USER_CANCELLED') {
                console.warn(`[Midl] Connection failed: ${error.message}`);
                throw error;
            }
            throw error;
        }
    }

    async signMessage(message: string, network: MidlConfig['network'], walletType: 'Xverse' | 'UniSat', address: string): Promise<string> {
        console.log(`[Midl] Signing message via ${walletType}...`);

        if (walletType === 'UniSat') {
            if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');
            return await (window as any).unisat.signMessage(message);
        }

        // Xverse
        const btcNetwork = this.mapToSatsConnectNetwork(network);

        return new Promise((resolve, reject) => {
            signMessage({
                payload: {
                    network: { type: btcNetwork },
                    address: address,
                    message: message,
                },
                onFinish: (signature) => {
                    console.log('[Midl] Message signed successfully');
                    resolve(signature);
                },
                onCancel: () => {
                    console.log('[Midl] Message signing cancelled');
                    reject(new Error('USER_CANCELLED'));
                }
            });
        });
    }

    private async suggestMidlNetwork() {
        return suggestMidlNetwork();
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
        // STEP 0
        alert(`Debug 0/5: Starting Payment\nAmount: ${amount}\nRecipient: ${recipient} `);

        try {
            // Step 1: Construct PSBT
            const { midlService } = await import('./midlService');
            // STEP 1
            alert('Debug 1/5: MidlService Imported. Constructing PSBT next...');

            let psbtBase64: string;
            try {
                psbtBase64 = await midlService.constructPSBT(senderAddress, recipient, amount, network);
                // STEP 2
                alert('Debug 2/5: PSBT Constructed Successfully!');
            } catch (psbtError: any) {
                alert(`Debug ERROR at PSBT: ${psbtError.message} `);
                throw psbtError;
            }

            // Step 2: Have Xverse sign
            const { signTransaction } = await import('sats-connect');

            // Determine signing indexes
            const bitcoin = await import('bitcoinjs-lib');
            const tempPsbt = bitcoin.Psbt.fromBase64(psbtBase64);
            const signingIndexes = tempPsbt.txInputs.map((_, i) => i);

            // STEP 3
            console.log(`[Midl] Requesting Xverse Signature.Signing Indexes: ${signingIndexes.join(',')} `);

            let signedPsbt: string;
            try {
                signedPsbt = await new Promise<string>((resolve, reject) => {
                    let hasFinished = false;

                    // Add timeout to prevent hanging forever
                    const timeoutId = setTimeout(() => {
                        if (!hasFinished) {
                            console.error('Xverse signing timed out');
                            // Keep this alert for timeout as it's a critical user-actionable error
                            alert('Signing Timed Out! Please check if Xverse popup is open.');
                            reject(new Error('SIGNING_TIMEOUT: Xverse did not respond in 30s'));
                        }
                    }, 30000);

                    signTransaction({
                        payload: {
                            network: {
                                type: btcNetwork
                            },
                            message: `Sign payment of ${amount} sats to ${recipient} `,
                            psbtBase64,
                            broadcast: false, // DON'T let Xverse broadcast
                            inputsToSign: [{
                                address: senderAddress,
                                signingIndexes: signingIndexes,
                                sigHash: 1, // SIGHASH_ALL
                            }],
                        },
                        onFinish: (response: any) => {
                            hasFinished = true;
                            clearTimeout(timeoutId);
                            console.log('[Midl] Xverse signature received', response);
                            // Handle potential response structures
                            const signed = response.psbtBase64 || response.psbt || response;
                            if (!signed) {
                                reject(new Error('No signed PSBT returned from Xverse'));
                                return;
                            }
                            resolve(signed);
                        },
                        onCancel: () => {
                            hasFinished = true;
                            clearTimeout(timeoutId);
                            console.log('[Midl] Xverse signature cancelled');
                            reject(new Error('USER_CANCELLED'));
                        },
                    });
                });
            } catch (signError: any) {
                if (signError.message === 'USER_CANCELLED') throw signError;
                console.error('[Midl] Signing Failed:', signError);
                throw new Error(`Wallet signing failed: ${signError.message} `);
            }

            // Step 3: Extract and Broadcast
            const psbt = bitcoin.Psbt.fromBase64(signedPsbt);

            try {
                psbt.finalizeAllInputs();
            } catch (finalizeError: any) {
                console.warn('Finalization failed, attempting direct extraction:', finalizeError.message);
            }

            const signedTxHex = psbt.extractTransaction().toHex();

            // Step 5: Broadcast
            console.log('[Midl] Broadcasting to Network...');

            try {
                const txid = await midlService.broadcastTransaction(signedTxHex, network);
                console.log(`[Midl] Broadcast Success! TxID: ${txid} `);
                return txid;
            } catch (broadcastError: any) {
                console.error(`[Midl] Broadcast Error: ${broadcastError.message} `);
                throw broadcastError;
            }

        } catch (error: any) {
            console.error('[Midl] Transaction Flow Error:', error);

            throw error;
        }
    }

    private async sendUniSatTransaction(amount: number, recipient: string, network: MidlConfig['network']): Promise<string> {
        if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');
        // Double check network?
        return await (window as any).unisat.sendBitcoin(recipient, amount);
    }
}

export async function suggestMidlNetwork() {
    const { request } = await import('sats-connect');
    try {
        // Spoof as 'Testnet' but provide our Regtest/Proxy URLs
        // This forces Xverse to respect the indexerUrl
        await request('wallet_addNetwork', {
            chain: 'bitcoin',
            name: 'MIDL Regtest',
            type: 'Testnet', // Changed to Testnet to ensure spoofing works
            rpcUrl: 'http://localhost:3001',
            rpcFallbackUrl: 'http://localhost:3001',
            blockExplorerUrl: 'https://mempool.staging.midl.xyz',
            // Use official Xverse API as indexer
            indexerUrl: 'https://api-3.xverse.app',
            switch: true
        });
        console.log('[Midl] Successfully suggested MIDL Regtest network (Spoofed as Testnet)');
    } catch (error) {
        console.warn("Midl network suggestion ignored/failed:", error);
        // Don't throw, just warn, as it might already be added
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
