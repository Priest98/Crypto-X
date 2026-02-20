import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import BalanceCard from '../components/BalanceCard';
import NetworkStatus from '../components/NetworkStatus';
import TransactionList from '../components/TransactionList';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Wallet: React.FC = () => {
    const { wallet, authenticateWallet } = useStore();
    const navigate = useNavigate();

    if (!wallet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-12 text-center">
                        <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Wallet Connected</h2>
                        <p className="text-gray-400 mb-6">Connect your wallet to view your balance and transactions</p>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 px-4 pb-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">My Wallet</h1>
                    <p className="text-gray-400">Manage your Bitcoin wallet on MIDL</p>
                </div>

                {/* Network Status & Actions */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <NetworkStatus />
                        <button
                            onClick={() => (window as any).refreshWallet && (window as any).refreshWallet()}
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg font-bold text-xs transition-all border border-blue-500/20 flex items-center space-x-2"
                        >
                            <span>Refresh Balance</span>
                        </button>
                    </div>
                    {!wallet.signature ? (
                        <button
                            onClick={authenticateWallet}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20"
                        >
                            Sign to Authenticate
                        </button>
                    ) : (
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg font-medium flex items-center">
                            <span className="mr-2">✓</span> Authenticated
                        </div>
                    )}
                </div>

                {/* Balance and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <BalanceCard />
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/receive')}
                            className="w-full bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-xl border border-green-700/50 rounded-xl p-4 hover:from-green-900/60 hover:to-green-800/60 transition-all group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                                    <ArrowDownLeft className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-semibold">Receive BTC</p>
                                    <p className="text-sm text-gray-400">Get your address</p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-gradient-to-br from-orange-900/40 to-orange-800/40 backdrop-blur-xl border border-orange-700/50 rounded-xl p-4 hover:from-orange-900/60 hover:to-orange-800/60 transition-all group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                                    <ArrowUpRight className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-semibold">Send BTC</p>
                                    <p className="text-sm text-gray-400">Make a payment</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <TransactionList />
                </div>
            </div>
        </div>
    );
};

export default Wallet;
