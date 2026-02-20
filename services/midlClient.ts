import { midlConfig } from "../lib/midlConfig";
import { getBalance, getUTXOs } from "@midl/core";
import { mempoolService } from "./mempoolService";

/**
 * Midl Client Shim
 * 
 * This treats the app's Satoshi-Kit config as the core provider.
 * Implements the API interface requested by the user.
 */
export class Midl {
    private config: any;

    constructor(params: { network: "regtest" | "testnet" | "mainnet" }) {
        // We ignore the network param for now as midlConfig 
        // is already set up for our custom Regtest
        this.config = midlConfig;
    }

    /**
     * Fetches total balance in satoshis directly from SDK indexer
     */
    async getBalance(address: string): Promise<number> {
        return getBalance(this.config, address);
    }

    /**
     * Fetches spendable UTXOs for the address
     */
    async getUtxos(address: string) {
        return getUTXOs(this.config, address);
    }

    /**
     * Fetches transaction history
     */
    async getTransactions(address: string) {
        // Falls back to mempoolService which hits the staging regtest API
        return mempoolService.getAddressTransactions(address, "regtest");
    }

    /**
     * Creates an unsigned PSBT for a transfer
     */
    async createTransaction(params: { address: string, to: string, amount: number }) {
        const { transferBTC } = await import("@midl/core");
        const tx = await transferBTC(this.config, {
            from: params.address,
            transfers: [{ receiver: params.to, amount: params.amount }],
            publish: false
        });
        return tx.psbt;
    }

    /**
     * Broadcasts a signed transaction hex or PSBT
     */
    async broadcastTransaction(txHex: string) {
        const { broadcastTransaction } = await import("@midl/core");
        return broadcastTransaction(this.config, txHex);
    }
}

export const midl = new Midl({
    network: "regtest"
});

/**
 * Global wallet state synchronizer
 * Ensures balance, utxos, and history are fetched in parallel
 */
export async function getWalletState(address: string) {
    if (!address) {
        throw new Error("No wallet address provided");
    }

    console.log(`[Midl] Syncing blockchain state for ${address}...`);

    const [balance, utxos, transactions] = await Promise.all([
        midl.getBalance(address),
        midl.getUtxos(address),
        midl.getTransactions(address)
    ]);

    console.log("Wallet sync:", {
        address,
        balance,
        utxos,
        count: utxos.length,
        historyCount: transactions.length
    });

    return {
        balance,
        utxos,
        transactions
    };
}
