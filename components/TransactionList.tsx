import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { useStore } from '../context/StoreContext';
import { NETWORK_CONFIG } from '../constants';

const TransactionList: React.FC = () => {
    const { transactions, isLoading, error, refresh } = useTransactionHistory();
    const { network } = useStore();

    const getExplorerUrl = (txid: string) => {
        const baseUrl = NETWORK_CONFIG[network].mempoolApi.replace('/api', '');
        return `${baseUrl}/tx/${txid}`;
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Pending';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading && transactions.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    <span className="ml-3 text-gray-400">Loading transactions...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="text-center py-12">
                    <p className="text-red-400 mb-4">Failed to load transactions</p>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No transactions yet</p>
                    <p className="text-gray-500 text-sm mt-2">Your transaction history will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-700/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {transactions.map((tx) => (
                    <div
                        key={tx.txid}
                        className="bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all border border-gray-700/30 hover:border-gray-600/50"
                    >
                        <div className="flex items-start justify-between">
                            {/* Left: Icon and Details */}
                            <div className="flex items-start space-x-3 flex-1">
                                {/* Icon */}
                                <div className={`p-2 rounded-lg ${tx.type === 'incoming'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {tx.type === 'incoming' ? (
                                        <ArrowDownLeft className="w-5 h-5" />
                                    ) : (
                                        <ArrowUpRight className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-white">
                                            {tx.type === 'incoming' ? 'Received' : 'Sent'}
                                        </span>
                                        {tx.confirmed ? (
                                            <div className="flex items-center text-green-400 text-xs">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {tx.confirmations} conf{tx.confirmations !== 1 ? 's' : ''}
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-yellow-400 text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 mb-1">
                                        {formatDate(tx.timestamp)}
                                    </p>

                                    <a
                                        href={getExplorerUrl(tx.txid)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center group"
                                    >
                                        <span className="truncate max-w-[200px]">{tx.txid}</span>
                                        <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>

                            {/* Right: Amount */}
                            <div className="text-right ml-4">
                                <div className={`text-lg font-bold ${tx.type === 'incoming' ? 'text-green-400' : 'text-orange-400'
                                    }`}>
                                    {tx.type === 'incoming' ? '+' : '-'}{tx.amountBTC.toFixed(8)} BTC
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {tx.amount.toLocaleString()} sats
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between text-sm">
                <span className="text-gray-400">
                    Total: {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500 text-xs">
                    Updates every 60 seconds
                </span>
            </div>
        </div>
    );
};

export default TransactionList;
