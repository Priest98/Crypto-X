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

    constructor(config: MidlConfig) {
        this.config = config;
    }

    async connectWallet(params: ConnectWalletParams): Promise<MidlWalletData> {
        const { wallet, network } = params;
        this.connectedWallet = wallet;

        if (wallet === 'Xverse') {
            return this.connectXverse(network);
        } else if (wallet === 'UniSat') {
            return this.connectUniSat(network);
        }
        throw new Error('Unsupported wallet provider');
    }

    async executeBitcoinPayment(amountSats: number, recipient: string, network: MidlConfig['network'], walletType?: 'Xverse' | 'UniSat'): Promise<string> {
        // Allow overriding or setting the connected wallet type (e.g. from persisted state)
        if (walletType) {
            this.connectedWallet = walletType;
        }

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

        console.log(`[Midl] Executing payment via ${this.connectedWallet} on ${network}`);

        if (this.connectedWallet === 'Xverse') {
            return this.sendXverseTransaction(amountSats, recipient, network);
        } else if (this.connectedWallet === 'UniSat') {
            return this.sendUniSatTransaction(amountSats, recipient, network);
        }

        throw new Error("Unknown connected wallet type");
    }

    // --- Internal Helpers ---

    private mapToSatsConnectNetwork(network: MidlConfig['network']): BitcoinNetworkType {
        switch (network) {
            case 'mainnet': return BitcoinNetworkType.Mainnet;
            case 'testnet': return BitcoinNetworkType.Testnet;
            case 'testnet4': return BitcoinNetworkType.Testnet4;
            case 'signet': return BitcoinNetworkType.Signet;
            case 'regtest': return BitcoinNetworkType.Regtest;
            default: return BitcoinNetworkType.Testnet;
        }
    }

    private async connectXverse(network: MidlConfig['network']): Promise<MidlWalletData> {
        return new Promise((resolve, reject) => {
            const btcNetwork = this.mapToSatsConnectNetwork(network);

            getAddress({
                payload: {
                    purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
                    message: `Connect to ${network} via Midl SDK`,
                    network: { type: btcNetwork }
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
            });
        });
    }

    private async connectUniSat(network: MidlConfig['network']): Promise<MidlWalletData> {
        if (typeof (window as any).unisat === 'undefined') throw new Error('UniSat not installed');

        await (window as any).unisat.requestAccounts();
        const accounts = await (window as any).unisat.getAccounts();

        try {
            // UniSat uses string IDs: 'livenet', 'testnet', 'testnet4', 'signet'
            let unisatNetwork = 'testnet';
            if (network === 'mainnet') unisatNetwork = 'livenet';
            else unisatNetwork = network; // testnet4, signet matches

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

    private async sendXverseTransaction(amount: number, recipient: string, network: MidlConfig['network']): Promise<string> {
        return new Promise((resolve, reject) => {
            const btcNetwork = this.mapToSatsConnectNetwork(network);
            sendBtcTransaction({
                payload: {
                    network: { type: btcNetwork },
                    recipients: [{ address: recipient, amountSats: BigInt(amount) }],
                    senderAddress: '' // automatic
                },
                onFinish: (txid) => resolve(txid),
                onCancel: () => reject(new Error('Transaction Cancelled')),
            });
        });
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
