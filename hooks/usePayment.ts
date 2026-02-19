import { useState, useEffect } from 'react';
import { connectWallet, executeBitcoinPayment } from '../services/walletService';
import { WalletInfo } from '../types';
import { useStore } from '../context/StoreContext';

export const usePayment = () => {
    const { network } = useStore();
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [txId, setTxId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
    const [confirmations, setConfirmations] = useState(0);
    const [evmTxId, setEvmTxId] = useState<string | null>(null);
    const [evmStatus, setEvmStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
    const [error, setError] = useState<string | null>(null);

    const connect = async (type: 'Xverse' | 'UniSat') => {
        setError(null);
        try {
            const res = await connectWallet(type, network);
            if (res) {
                setWallet(res);
            }
        } catch (err: any) {
            console.error(err);
            // Midl SDK should throw meaningful errors
            setError(err.message || "Failed to connect wallet via Midl.");
        }
    };

    const pay = async (toAddress: string, amountSats: number, orderId: string) => {
        if (!wallet) return;

        setIsProcessing(true);
        setVerificationStatus('pending');
        setError(null);

        try {
            // 1. Execute Payment via Midl
            const walletType = wallet?.type as 'Xverse' | 'UniSat' | undefined;
            const senderAddress = wallet?.paymentAddress || wallet?.address;

            console.log(`[usePayment] Initiating payment. Network: ${network}, Wallet: ${walletType}, Sender: ${senderAddress}`);

            const tx = await executeBitcoinPayment(amountSats, toAddress, network, walletType, senderAddress);
            console.log('Midl TX ID:', tx);

            if (tx) {
                setTxId(tx);

                // 2. Trigger EVM Action (Independent Layer)
                let evmHash = null;
                try {
                    const { executeEVMAction } = await import('../lib/evmClient');
                    console.log('[usePayment] Triggering EVM action...');
                    evmHash = await executeEVMAction(tx);
                    setEvmTxId(evmHash);
                    setEvmStatus('pending');
                } catch (evmErr) {
                    console.error('[usePayment] EVM Action failed:', evmErr);
                    setEvmStatus('failed');
                }

                // 3. Store Payment Intent on Backend
                await fetch('http://localhost:3001/api/payments/store', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: wallet.address,
                        amount: amountSats,
                        txid: tx,
                        orderId,
                        network,
                        evmTxHash: evmHash
                    }),
                });

                // 3. Start Verification Loop
                verifyTransaction(tx);
            } else {
                setVerificationStatus('failed');
                setIsProcessing(false);
                setError("Transaction failed or was cancelled.");
            }
        } catch (err: any) {
            console.error(err);
            setVerificationStatus('failed');
            setIsProcessing(false);
            setError(err.message || "An error occurred during payment.");
        }
    };

    const verifyTransaction = async (tx: string) => {
        const poll = setInterval(async () => {
            try {
                // Poll the new verify endpoint
                const response = await fetch(`http://localhost:3001/api/payments/verify/${tx}`);
                const data = await response.json();

                if (data.status) {
                    setConfirmations(data.confirmations || 0);
                    if (data.status === 'confirmed') {
                        setVerificationStatus('confirmed');
                        // Don't stop polling yet if EVM is still pending, or just assume EVM is fast.
                        // For now, let's keep it simple: if BTC is confirmed, we consider payment done, 
                        // but we might want to update EVM status too.

                        if (evmTxId) {
                            try {
                                const evmRes = await fetch(`http://localhost:3001/api/payments/evm/verify/${evmTxId}`);
                                const evmData = await evmRes.json();
                                if (evmData.status === 'confirmed') {
                                    setEvmStatus('confirmed');
                                }
                            } catch (e) { console.error("EVM verify failed", e); }
                        }

                        setIsProcessing(false);
                        clearInterval(poll);
                    }
                }
            } catch (error) {
                console.error('Verification polling error', error);
            }
        }, 5000); // Poll every 5 seconds

        // Timeout after 10 minutes
        setTimeout(() => {
            clearInterval(poll);
            if (verificationStatus !== 'confirmed') {
                // setError("Transaction verification timed out.");
                // setIsProcessing(false);
            }
        }, 600000);
    };

    return { wallet, connect, pay, txId, evmTxId, evmStatus, isProcessing, verificationStatus, confirmations, error };
};
