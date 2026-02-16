import React, { useState } from 'react';
import { Copy, CheckCircle2, QrCode, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const Receive: React.FC = () => {
    const { wallet, network } = useStore();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    if (!wallet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">No Wallet Connected</h2>
                        <p className="text-gray-400 mb-6">Connect your wallet to receive Bitcoin</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(wallet.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getNetworkLabel = () => {
        switch (network) {
            case 'mainnet': return 'Bitcoin Mainnet';
            case 'testnet': return 'Bitcoin Testnet';
            case 'testnet4': return 'Bitcoin Testnet4';
            case 'signet': return 'Bitcoin Signet';
            case 'regtest': return 'Bitcoin Regtest';
            default: return network;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-blue-900 pt-20 px-4 pb-12">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
                        <QrCode className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Receive Bitcoin</h1>
                    <p className="text-gray-400">Share your address or QR code to receive BTC</p>
                </div>

                {/* Main Card */}
                <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
                    {/* Network Badge */}
                    <div className="mb-6">
                        <div className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-sm text-green-400 font-medium">{getNetworkLabel()}</span>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-2xl mb-6 flex items-center justify-center">
                        <QRCode
                            value={wallet.address}
                            size={256}
                            level="H"
                            className="max-w-full h-auto"
                        />
                    </div>

                    {/* Address Display */}
                    <div className="mb-6">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">
                            Your Bitcoin Address
                        </label>
                        <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                            <p className="text-white font-mono text-sm break-all">
                                {wallet.address}
                            </p>
                        </div>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${copied
                                ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                <span>Copy Address</span>
                            </>
                        )}
                    </button>

                    {/* Warning */}
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <p className="text-sm text-yellow-400">
                            <strong>⚠️ Important:</strong> Only send Bitcoin ({getNetworkLabel()}) to this address.
                            Sending other cryptocurrencies may result in permanent loss.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receive;
