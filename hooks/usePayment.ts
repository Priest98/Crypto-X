import { useState, useEffect } from 'react';
import { connectXverse, connectUniSat, sendTransaction } from '../services/walletService';
import { WalletInfo } from '../types';
import { useStore } from '../context/StoreContext';

export const usePayment = () => {
    const { network } = useStore();
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [txId, setTxId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
    const [confirmations, setConfirmations] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const connect = async (type: 'Xverse' | 'UniSat') => {
        setError(null);
        let res = null;
        try {
            if (type === 'Xverse') res = await connectXverse(network);
            else if (type === 'UniSat') res = await connectUniSat(network);

            if (res) {
                setWallet(res);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === "XVERSE_NOT_INSTALLED") {
                setError("Xverse not detected. Please install it.");
            } else if (err.message === "UNISAT_NOT_INSTALLED") {
                setError("UniSat not detected. Please install it.");
            } else if (err.message === "USER_CANCELLED") {
                setError("Connection cancelled.");
            } else {
                setError("Failed to connect wallet.");
            }
        }
    };

    const pay = async (toAddress: string, amountSats: number, orderId: string) => {
        if (!wallet) return;

        setIsProcessing(true);
        setVerificationStatus('pending');
        setError(null); // Clear previous errors

        try {
            const tx = await sendTransaction(wallet.type, toAddress, amountSats, network);
            console.log('TX Response:', tx);
            if (tx) {
                setTxId(tx);
                // Start polling for verification
                verifyTransaction(tx, orderId, toAddress, amountSats);
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

    const verifyTransaction = async (tx: string, orderId: string, address: string, amount: number) => {
        const poll = setInterval(async () => {
            try {
                const response = await fetch('http://localhost:3001/api/payments/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ txid: tx, orderId, address, amount, network }),
                });

                const data = await response.json();
                if (data.status) {
                    setConfirmations(data.confirmations || 0);
                    if (data.status === 'confirmed') {
                        setVerificationStatus('confirmed');
                        setIsProcessing(false);
                        clearInterval(poll);
                    }
                }
            } catch (error) {
                console.error('Verification polling error', error);
                // Optionally set an error here if polling consistently fails
            }
        }, 5000); // Poll every 5 seconds

        // Stop polling after 10 minutes to avoid infinite loops in demo
        setTimeout(() => {
            clearInterval(poll);
            if (verificationStatus !== 'confirmed') {
                // Optional: Handle timeout
                // setError("Transaction verification timed out.");
                // setIsProcessing(false);
            }
        }, 600000);
    };

    return { wallet, connect, pay, txId, isProcessing, verificationStatus, confirmations, error };
};
