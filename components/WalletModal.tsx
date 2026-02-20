import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { X, CheckCircle2, AlertCircle, ExternalLink, Shield, Zap, ArrowRight } from 'lucide-react';
import { ConnectionStatus } from '../types';

const WalletModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {

  const { connect, connectWallet: setStoreWallet, network, resetApp, wallet } = useStore();
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
      // Use unified Midl connectWallet function
      const address = await connect(type);
      if (address) {
        setConnectedAddress(address);
        setStatus('connected');

        setTimeout(() => {
          // Store syncs automatically via useEffect now, but we can verify
          onClose();
        }, 1500);
      }
    } catch (e: any) {
      setStatus('error');
      let msg = 'Connection failed. Please try again.';
      if (e.message.includes('not installed')) msg = `${type} wallet is not installed.`;
      else if (e.message === 'USER_CANCELLED') msg = 'Connection was cancelled.';
      else if (e.message.includes('Mismatched Network')) msg = `Network Mismatch: Please switch your wallet to ${network} or change the app network.`;
      else msg = e.message || msg;
      setErrorMessage(msg);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center">
            {/* Header Icon */}
            <div className="w-24 h-24 mx-auto mb-12 relative group cursor-pointer">
              <div className="absolute inset-0 bg-primary/20 rounded-[32px] blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative w-full h-full bg-[#09090b] border border-white/10 rounded-[32px] flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <div className="flex space-x-2 mb-2">
                  <div className="w-3 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  <div className="w-3 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse delay-75"></div>
                </div>
                <div className="absolute bottom-4 text-white/20 text-xl font-serif italic">₿</div>
              </div>
            </div>

            {status === 'connected' ? (
              <div className="py-12 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Identity Verified</h2>
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-gray-400 font-mono bg-black/50 px-6 py-3 rounded-xl border border-white/10 inline-block text-lg">
                    {connectedAddress?.slice(0, 8)}...{connectedAddress?.slice(-8)}
                  </p>
                  {/* Balance Display */}
                  {network !== 'mainnet' && (
                    <p className="text-primary font-bold text-sm">
                      Balance: {(wallet?.balance || 0).toLocaleString()} sats
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-6">WELCOME TO ATELIER</h2>
                  <p className="text-xl text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
                    Your gateway to premium Bitcoin-native craftsmanship. Choose your prover.
                  </p>
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl inline-flex items-center space-x-3"
                  >
                    <AlertCircle size={20} />
                    <span className="font-bold">{errorMessage}</span>
                  </motion.div>
                )}

                <div className="flex flex-col items-center space-y-6 max-w-md mx-auto">
                  {/* Primary Action */}
                  <button
                    onClick={() => handleConnect('Xverse')}
                    disabled={status === 'connecting'}
                    className="w-full bg-white hover:bg-white/90 text-black h-20 rounded-[24px] font-black text-2xl flex items-center justify-center space-x-4 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">Connect Xverse</span>
                    <ArrowRight className="relative z-10 transition-transform group-hover:translate-x-2" size={28} />
                    {status === 'connecting' && (
                      <div className="absolute inset-0 bg-white/50 animate-pulse z-20 flex items-center justify-center">
                        <span className="text-black font-bold text-sm">Open Wallet App...</span>
                      </div>
                    )}
                  </button>
                  {status === 'connecting' && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      If on mobile, tap here to <a href="xverse://" className="text-white underline">open Xverse</a> manually.
                    </p>
                  )}

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => handleConnect('UniSat')}
                      disabled={status === 'connecting'}
                      className="h-16 rounded-[20px] glass-ios border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all hover:border-primary/50 group"
                    >
                      <Shield size={16} className="group-hover:text-primary transition-colors" />
                      <span>Unisat</span>
                    </button>

                    <a
                      href="https://www.xverse.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-16 rounded-[20px] glass-ios border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 transition-all hover:border-white/30"
                    >
                      <ExternalLink size={16} />
                      <span>Get Xverse</span>
                    </a>
                  </div>


                </div>

                <div className="pt-8 flex flex-col items-center space-y-4">
                  <button
                    onClick={() => {
                      if (confirm("Reset wallet connection and app state?")) {
                        resetApp();
                        onClose();
                      }
                    }}
                    className="text-[10px] text-red-500/50 hover:text-red-500 uppercase tracking-widest font-black transition-colors"
                  >
                    Disconnect & Reset
                  </button>
                  <div className="flex justify-center space-x-12 text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
                    <span>Non-Custodial</span>
                    <span>Direct BTC</span>
                    <span>Peer-to-Peer</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletModal;
