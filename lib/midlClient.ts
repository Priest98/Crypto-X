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

        console.log(`[Midl] Executing payment via ${this.connectedWallet} on ${network}. Sender: ${senderAddress || 'auto'}`);

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
                getAddress({
                    payload: {
                        purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
                        message: `Connect to ${network} via Midl SDK`,
                        network: { type: netType }
                    },
                    onFinish: (res) => {
                        const payment = res.addresses.find(a => a.purpose === AddressPurpose.Payment);
                        const ordinals = res.addresses.find(a => a.purpose === AddressPurpose.Ordinals);
                        if (payment && ordinals) {
                            resolve({
                                address: payment.address,
                                paymentAddress: payment.address,
                                ordinalsAddress: ordinals.address,
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
                        name: 'Crypto-X',
                        icon: window.location.origin + '/vite.svg', // Ensure this exists or use valid URL
                    }
                });
            });
        };

        const btcNetwork = this.mapToSatsConnectNetwork(network);

        if (network === 'regtest') {
            try { await this.suggestMidlNetwork(); } catch (e) { /* ignore */ }
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

    private async suggestMidlNetwork() {
        const { request } = await import('sats-connect');
        try {
            await request('wallet_addNetwork', {
                chain: 'bitcoin',
                name: 'MIDL Regtest',
                type: 'Regtest' as any,
                rpcUrl: 'https://mempool.regtest.midl.xyz/api',
                rpcFallbackUrl: 'https://mempool.regtest.midl.xyz/api',
                // Remove indexerUrl - let Xverse use default regtest indexer
                blockExplorerUrl: 'https://mempool.regtest.midl.xyz',
                switch: true
            });
            console.log('[Midl] Successfully suggested MIDL Regtest network');
        } catch (error) {
            console.warn("Midl network suggestion ignored/failed:", error);
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
        return new Promise((resolve, reject) => {
            const btcNetwork = this.mapToSatsConnectNetwork(network);
            console.log(`[Midl] Xverse Payload - Net: ${btcNetwork}, Amt: ${amount}, Recip: ${recipient}`);

            const payload = {
                network: { type: btcNetwork },
                recipients: [{
                    address: recipient,
                    amountSats: BigInt(Math.floor(amount))
                }],
                senderAddress: senderAddress || undefined
            };

            try {
                sendBtcTransaction({
                    payload,
                    onFinish: (response: any) => {
                        console.log("[Midl] Xverse Transaction Response:", response);
                        // Extremely robust txid extraction
                        let txId = "";
                        if (typeof response === 'string') {
                            txId = response;
                        } else if (response && typeof response === 'object') {
                            txId = response.txId || response.txid || response.txHash || response.hash;
                        }

                        if (txId) {
                            console.log("[Midl] Extracted TxID:", txId);
                            resolve(txId);
                        } else {
                            console.error("[Midl] Transaction finished but no TxID found in response:", response);
                            reject(new Error("Transaction signed but no transaction ID was returned. Check your wallet history."));
                        }
                    },
                    onCancel: () => {
                        console.log("[Midl] Xverse Transaction Cancelled");
                        reject(new Error('USER_CANCELLED'));
                    }
                });
            } catch (e: any) {
                reject(e);
            }
        });
    }

    async signMessage(message: string, network?: MidlConfig['network'], walletType?: 'Xverse' | 'UniSat', address?: string): Promise<string> {
        if (walletType) this.connectedWallet = walletType;
        if (network) this.activeNetwork = network;

        if (!this.connectedWallet) throw new Error("Wallet not connected");

        if (this.connectedWallet === 'Xverse') {
            return this.signMessageXverse(message, address);
        } else if (this.connectedWallet === 'UniSat') {
            // Pass address if UniSat supports it in future, currently just message
            return this.signMessageUniSat(message);
        }
        throw new Error("Unknown wallet type");
    }

    private async signMessageXverse(message: string, address?: string): Promise<string> {
        const trySign = async (netType: BitcoinNetworkType): Promise<string> => {
            return new Promise((resolve, reject) => {
                import('sats-connect').then(({ signMessage }) => {
                    signMessage({
                        payload: {
                            network: { type: netType },
                            address: address || '',
                            message
                        },
                        onFinish: (response: any) => {
                            // sats-connect may return just the signature string or an object
                            const signature = typeof response === 'string' ? response : (response.signature || response);
                            resolve(signature);
                        },
                        onCancel: () => reject(new Error("USER_CANCELLED"))
                    });
                }).catch(reject);
            });
        };

        // Use activeNetwork instead of static config
        const btcNetwork = this.mapToSatsConnectNetwork(this.activeNetwork);

        try {
            return await trySign(btcNetwork);
        } catch (error: any) {
            if (error.message !== 'USER_CANCELLED' && btcNetwork !== BitcoinNetworkType.Testnet) {
                console.warn(`[Midl] Signing with ${btcNetwork} failed. Retrying with Testnet fallback...`);
                return await trySign(BitcoinNetworkType.Testnet);
            }
            throw error;
        }
    }

    private async signMessageUniSat(message: string): Promise<string> {
        if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');
        return await (window as any).unisat.signMessage(message);
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
