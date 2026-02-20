import React, { useState } from 'react';
import { usePayment } from '../hooks/usePayment';
import { useStore } from '../context/StoreContext';
import { Network } from '../types';
import { X, CheckCircle, Clock, AlertTriangle, ArrowUpRight, Globe } from 'lucide-react';
import ImageLoader from './ImageLoader';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    totalAmount: number; // in USD
    btcPrice: number; // Current BTC price
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderId, totalAmount, btcPrice }) => {
    const { wallet, connect, pay, txId, evmTxId, evmStatus, isProcessing, verificationStatus, confirmations, error } = usePayment();
    const { network, setNetwork } = useStore();
    const [method, setMethod] = useState<'Xverse' | 'UniSat' | null>(null);

    // Convert USD to Satoshis (1 BTC = 100,000,000 Sats)
    const amountBtc = totalAmount / btcPrice;
    const storeAddress = 'bcrt1q6rhng852dd3602521100566336c11100566336'; // Regtest Address

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-background border border-white/10 rounded-[32px] w-full max-w-md p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-black mb-2">Pay with Bitcoin</h2>
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-400 text-sm">Secure, trustless, on-chain verification.</p>

                    {/* Network Selector */}
                    <div className="relative group">
                        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                            <Globe size={14} className="text-primary" />
                            <span className="text-xs font-bold capitalize text-primary">{network}</span>
                        </div>
                        <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1b1e] border border-white/10 rounded-xl overflow-hidden shadow-xl hidden group-hover:block z-10 p-1">
                            {['testnet', 'testnet4', 'signet', 'regtest'].map((net) => (
                                <button
                                    key={net}
                                    onClick={() => setNetwork(net as Network)}
                                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${network === net ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {net.charAt(0).toUpperCase() + net.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 flex flex-col items-center">
                    <div className="text-3xl font-black text-primary">{amountSats.toLocaleString()} Sats</div>
                    <div className="text-gray-400 text-sm mt-1">≈ ${totalAmount.toFixed(2)} USD</div>
                </div>

                {/* Step 1: Connect Wallet */}
                {!wallet && (
                    <div className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                                <div className="flex items-start space-x-3 mb-2">
                                    <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                                {(error.includes("Xverse") || error.includes("UniSat")) && (
                                    <a
                                        href={error.includes("Xverse") ? "https://www.xverse.app/download" : "https://unisat.io/download"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors inline-block font-bold"
                                    >
                                        Install Extension ↗
                                    </a>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => connect('Xverse')}
                            className="w-full btn-glass h-16 rounded-2xl flex items-center justify-between px-6 hover:bg-white/5 transition-all group"
                        >
                            <span className="font-bold flex items-center space-x-3">
                                <span>Xverse Wallet</span>
                            </span>
                            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                        </button>
                        <button
                            onClick={() => connect('UniSat')}
                            className="w-full btn-glass h-16 rounded-2xl flex items-center justify-between px-6 hover:bg-white/5 transition-all group"
                        >
                            <span className="font-bold flex items-center space-x-3">
                                <span>UniSat Wallet</span>
                            </span>
                            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Confirm Payment */}
                {wallet && !txId && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-gray-400 text-sm">Wallet Connected</span>
                            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">{wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}</span>
                        </div>

                        <button
                            onClick={() => pay(storeAddress, amountSats, orderId)}
                            disabled={isProcessing}
                            className="w-full btn-primary h-14 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>Confirm Payment</span>
                            )}
                        </button>
                    </div>
                )}

                {/* Step 3: Verification Status */}
                {txId && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            {verificationStatus === 'confirmed' ? (
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 animate-in zoom-in duration-300">
                                    <CheckCircle size={40} />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
                                    <Clock size={40} />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-1">
                                {verificationStatus === 'confirmed' ? 'Payment Confirmed' : 'Verifying Transaction'}
                            </h3>
                            <p className="text-gray-400 text-xs">
                                {verificationStatus === 'confirmed'
                                    ? 'Your order has been secured on-chain.'
                                    : `Waiting for confirmations... (${confirmations}/1)`}
                            </p>
                        </div>

                        <a
                            href={
                                network === 'testnet4' ? `https://mempool.space/testnet4/tx/${txId}` :
                                    network === 'signet' ? `https://mempool.space/signet/tx/${txId}` :
                                        network === 'regtest' ? '#' :
                                            `https://mempool.space/testnet/tx/${txId}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 text-xs text-primary hover:underline"
                        >
                            <span>View Bitcoin Transaction</span>
                            <ArrowUpRight size={12} />
                        </a>

                        {/* EVM Status Section */}
                        {evmTxId && (
                            <div className="pt-4 border-t border-white/10 mt-4">
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    {evmStatus === 'confirmed' ? (
                                        <CheckCircle size={16} className="text-green-500" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                    )}
                                    <span className="text-sm font-bold">EVM Execution Layer</span>
                                </div>
                                <a
                                    href={`https://blockscout.staging.midl.xyz/tx/${evmTxId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-2 text-xs text-blue-400 hover:underline"
                                >
                                    <span>{evmTxId.slice(0, 6)}...{evmTxId.slice(-4)}</span>
                                    <ArrowUpRight size={10} />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
