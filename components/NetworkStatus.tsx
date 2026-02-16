import React from 'react';
import { Wifi, WifiOff, Circle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useBlockNumber } from '@midl/react';

const NetworkStatus: React.FC = () => {
    const { network, wallet } = useStore();
    const { blockNumber, isLoading } = useBlockNumber();

    const isConnected = !!wallet?.address;

    const getNetworkLabel = () => {
        switch (network) {
            case 'mainnet': return 'Mainnet';
            case 'testnet': return 'Testnet';
            case 'testnet4': return 'Testnet4';
            case 'signet': return 'Signet';
            case 'regtest': return 'Regtest';
            default: return network;
        }
    };

    const getStatusColor = () => {
        if (!isConnected) return 'text-gray-500';
        return 'text-green-400';
    };

    const getStatusText = () => {
        if (!isConnected) return 'Disconnected';
        if (isLoading) return 'Syncing...';
        return 'Connected';
    };

    return (
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
                {/* Left: Network Info */}
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                        {isConnected ? (
                            <Wifi className={`w-5 h-5 ${getStatusColor()}`} />
                        ) : (
                            <WifiOff className="w-5 h-5 text-gray-500" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center space-x-2">
                            <Circle className={`w-2 h-2 ${isConnected ? 'fill-green-400 text-green-400' : 'fill-gray-500 text-gray-500'} ${isConnected && !isLoading ? 'animate-pulse' : ''}`} />
                            <span className={`text-sm font-medium ${getStatusColor()}`}>
                                {getStatusText()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Network: <span className="text-gray-400 font-medium">{getNetworkLabel()}</span>
                        </p>
                    </div>
                </div>

                {/* Right: Block Height */}
                {isConnected && blockNumber !== undefined && (
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Block Height</p>
                        <p className="text-sm font-mono text-white">
                            {isLoading ? '...' : blockNumber.toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;
