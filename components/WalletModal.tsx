import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { connectXverse, connectUniSat } from '../services/walletService';
import { X, CheckCircle2, AlertCircle, Copy, ExternalLink, ArrowRight, Wallet, ChevronRight } from 'lucide-react';
import { ConnectionStatus } from '../types';

const WalletModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { connectWallet, network } = useStore();
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
        setConnectedAddress(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConnect = async (type: 'Xverse' | 'UniSat') => {
    setStatus('connecting');
    setErrorMessage(null);
    try {
      const walletInfo = type === 'Xverse' ? await connectXverse(network) : await connectUniSat(network);
      setConnectedAddress(walletInfo.address);
      setStatus('connected');

      setTimeout(() => {
        connectWallet(walletInfo);
        onClose();
      }, 1500);
    } catch (e: any) {
      setStatus('error');
      let msg = 'Connection failed. Please try again.';
      if (e.message === 'XVERSE_NOT_INSTALLED') msg = 'Xverse wallet is not installed.';
      else if (e.message === 'UNISAT_NOT_INSTALLED') msg = 'UniSat wallet is not installed.';
      else if (e.message === 'USER_CANCELLED') msg = 'Connection was cancelled.';
      setErrorMessage(msg);
    }
  };

  if (!isOpen) return null;

  const walletOptions = [
    {
      id: 'Xverse',
      name: 'Xverse',
      type: 'Xverse' as const,
      description: 'The premier wallet for Bitcoin & Stacks.',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <span className="font-bold text-lg">X</span>
        </div>
      )
    },
    {
      id: 'Ordinals',
      name: 'Ordinals',
      type: 'Xverse' as const, // Uses Xverse backend
      description: 'Store and managing digital artifacts.',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
          <span className="font-bold text-lg">O</span>
        </div>
      )
    },
    {
      id: 'UniSat',
      name: 'UniSat',
      type: 'UniSat' as const,
      description: 'Inscriptions and BRC-20 tokens.',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <span className="font-bold text-lg">U</span>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} // Hard shadow for depth
          className="w-full max-w-md bg-[#09090b] border border-white/10 rounded-3xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white tracking-tight">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
              >
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-500">Connection Error</h4>
                  <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {status === 'connected' ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white">Wallet Connected</h3>
                <p className="text-sm text-gray-400 font-mono bg-black/50 px-3 py-1.5 rounded-lg border border-white/5">
                  {connectedAddress?.slice(0, 8)}...{connectedAddress?.slice(-8)}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {walletOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleConnect(option.type)}
                    disabled={status === 'connecting'}
                    className="w-full group flex items-center p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left relative overflow-hidden"
                  >
                    <div className="mr-4 shrink-0 relative z-10">{option.icon}</div>
                    <div className="flex-1 relative z-10">
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{option.name}</h3>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    <div className="text-white/10 group-hover:text-white/50 group-hover:translate-x-1 transition-all relative z-10">
                      <ChevronRight size={20} />
                    </div>

                    {status === 'connecting' && (
                      <div className="absolute inset-0 bg-white/5 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              New to Bitcoin? <a href="https://www.xverse.app/" target="_blank" rel="noreferrer" className="text-white hover:text-primary underline decoration-white/20 hover:decoration-primary transition-colors">Learn more about wallets</a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletModal;
