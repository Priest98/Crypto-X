import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface InvoiceTimerProps {
    durationMinutes?: number;
    onExpire?: () => void;
}

const InvoiceTimer: React.FC<InvoiceTimerProps> = ({
    durationMinutes = 15,
    onExpire
}) => {
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // Convert to seconds
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            onExpire?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (): number => {
        return (timeLeft / (durationMinutes * 60)) * 100;
    };

    return (
        <div className={`bg-gradient-to-br ${isExpired
                ? 'from-red-900/40 to-red-800/40 border-red-700/50'
                : 'from-blue-900/40 to-purple-900/40 border-blue-700/50'
            } backdrop-blur-xl rounded-2xl border p-6 mb-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 ${isExpired ? 'bg-red-500/20' : 'bg-blue-500/20'
                        } rounded-lg`}>
                        {isExpired ? (
                            <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : (
                            <Clock className="w-5 h-5 text-blue-400" />
                        )}
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isExpired ? 'text-red-400' : 'text-white'
                            }`}>
                            {isExpired ? 'Invoice Expired' : 'Secure Peer-to-Peer Settlement'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {isExpired
                                ? 'This invoice has expired. Please create a new one.'
                                : 'Authenticate via your Xverse wallet or external node'}
                        </p>
                    </div>
                </div>

                {/* Countdown Display */}
                {!isExpired && (
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white font-mono">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Time Remaining
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {!isExpired && (
                <div className="relative w-full h-2 bg-gray-700/30 rounded-full overflow-hidden">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ${timeLeft < 60
                                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                                : timeLeft < 180
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                        style={{ width: `${getProgressPercentage()}%` }}
                    />
                </div>
            )}

            {/* Warning for less than 1 minute */}
            {!isExpired && timeLeft < 60 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                        Less than 1 minute remaining! Complete your payment quickly.
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvoiceTimer;
