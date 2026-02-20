import { midl } from "./midlClient";
import { request } from "sats-connect";

/**
 * Sends BTC by creating a PSBT, signing it with sats-connect, and broadcasting via MIDL.
 */
export async function sendBTC(sender: string, recipient: string, amount: number) {
    const utxos = await midl.getUtxos(sender);

    if (!utxos || utxos.length === 0) {
        throw new Error("No spendable balance found");
    }

    console.log(`[sendBTC] Creating transaction from ${sender} to ${recipient} for ${amount} sats`);

    // 1. Create unsigned PSBT
    const unsignedPsbt = await (midl as any).createTransaction({
        address: sender,
        to: recipient,
        amount
    });

    // 2. Request user to sign with sats-connect
    console.log('[sendBTC] Requesting wallet signature...');
    const signed = await (request as any)("signPsbt", {
        payload: {
            network: {
                type: "Regtest"
            },
            psbtBase64: unsignedPsbt,
            broadcast: false, // We broadcast manually via MIDL for consistency
            inputsToSign: [
                {
                    address: sender,
                    signingIndexes: [0], // Usually first input if simple send, but SDK handles mapping
                }
            ]
        }
    });

    // 3. Broadcast signed PSBT/Transaction
    console.log('[sendBTC] Finalizing and broadcasting...');
    // Note: 'signed' response structure depends on sats-connect version. 
    // It usually returns { psbtBase64, txid } if broadcasted, or just psbt if not.
    const txid = await midl.broadcastTransaction(
        (signed as any).result?.psbtBase64 || (signed as any).psbtBase64
    );

    return txid;
}
