import React from 'react';
import { RefreshCw, TrendingUp, Wallet } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const BalanceCard: React.FC = () => {
    const { balance, balanceBTC, balanceLoading, balanceError, refreshBalance, btcPrice } = useStore();

    const balanceUSD = balanceBTC * btcPrice;

    return (
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl rounded-2xl border border-blue-700/50 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Wallet className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm text-gray-400 font-medium">Total Balance</h3>
                        <p className="text-xs text-gray-500">Available BTC</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={refreshBalance}
                        disabled={balanceLoading}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 text-xs font-bold"
                    >
                        <RefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Balance</span>
                    </button>

                    <button
                        onClick={refreshBalance}
                        disabled={balanceLoading}
                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Quick Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 text-blue-400 ${balanceLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Balance Display */}
            {balanceError ? (
                <div className="text-center py-8">
                    <p className="text-red-400 mb-2">Failed to load balance</p>
                    <button
                        onClick={refreshBalance}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        Try Again
                    </button>
                </div>
            ) : balanceLoading && balance === 0 ? (
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-700/30 rounded-lg mb-3"></div>
                    <div className="h-6 bg-gray-700/20 rounded-lg w-1/2"></div>
                </div>
            ) : (
                <div>
                    {/* BTC Balance */}
                    <div className="mb-4">
                        <div className="text-4xl font-bold text-white mb-1">
                            {balanceBTC.toFixed(8)} BTC
                        </div>
                        <div className="text-sm text-gray-400">
                            {balance.toLocaleString()} satoshis
                        </div>
                    </div>

                    {/* USD Value */}
                    <div className="flex items-center justify-between pt-4 border-t border-blue-700/30">
                        <div className="flex items-center space-x-2 text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm">USD Value</span>
                        </div>
                        <div className="text-xl font-semibold text-green-400">
                            ${balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* BTC Price */}
                    <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500">
                            1 BTC = ${btcPrice.toLocaleString('en-US')}
                        </span>
                    </div>
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="mt-4 pt-4 border-t border-blue-700/30">
                <p className="text-xs text-center text-gray-500">
                    Auto-refreshes every 30 seconds
                </p>
            </div>
        </div>
    );
};

export default BalanceCard;
