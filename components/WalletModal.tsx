
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { connectXverse, connectUniSat, isXverseInstalled } from '../services/walletService';
import { X, Loader2, Wallet, CheckCircle2, AlertCircle, Copy, ExternalLink, ArrowRight, Bitcoin, Sparkles } from 'lucide-react';
import { ConnectionStatus } from '../types';

// Refined Character Animation Component
const AnimatedCharacter: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  return (
    <div className="relative w-60 h-60 mx-auto mb-10 perspective-1000 flex items-center justify-center">
      {/* Background Radiance */}
      <motion.div 
        animate={{ 
          scale: status === 'connected' ? 1.3 : 1,
          opacity: status === 'connecting' ? [0.2, 0.4, 0.2] : 0.2
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-[80px] transition-colors duration-1000 ${
          status === 'connected' ? 'bg-green-500' : 
          status === 'error' ? 'bg-red-500' : 
          status === 'connecting' ? 'bg-primary' : 'bg-primary/20'
        }`}
      />

      {/* Character Base */}
      <motion.div
        animate={
          status === 'idle' ? { y: [0, -15, 0] } :
          status === 'connecting' ? { x: [-2, 2, -2], y: [-2, 2, -2] } :
          status === 'connected' ? { scale: [1, 1.15, 1], rotate: [0, 360] } :
          status === 'error' ? { x: [-8, 8, -8, 8, 0] } : {}
        }
        transition={{ 
          duration: status === 'idle' ? 4 : status === 'connecting' ? 0.1 : 1,
          repeat: status === 'connected' ? 0 : Infinity,
          type: "spring"
        }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {/* Floating "Node" Body */}
        <div className={`w-36 h-36 rounded-[48px] glass-ios border-2 flex flex-col items-center justify-center transition-all duration-700 ${
          status === 'connected' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 
          status === 'error' ? 'border-red-500/50' : 'border-white/10'
        }`}>
          {/* Facial Interface */}
          <div className="w-24 h-12 bg-black/60 rounded-xl relative flex items-center justify-center space-x-4 overflow-hidden">
            {/* Eyes */}
            <motion.div 
              animate={
                status === 'hover' ? { scaleY: 0.2 } :
                status === 'connecting' ? { y: [-4, 4, -4] } :
                status === 'error' ? { scaleY: 0.1, opacity: 0.5 } : { scaleY: 1 }
              }
              className={`w-3 h-7 rounded-full transition-colors duration-500 ${
                status === 'connected' ? 'bg-green-400' : 
                status === 'error' ? 'bg-red-500' : 'bg-primary'
              }`}
            />
            <motion.div 
              animate={
                status === 'hover' ? { scaleY: 0.2 } :
                status === 'connecting' ? { y: [-4, 4, -4] } :
                status === 'error' ? { scaleY: 0.1, opacity: 0.5 } : { scaleY: 1 }
              }
              className={`w-3 h-7 rounded-full transition-colors duration-500 ${
                status === 'connected' ? 'bg-green-400' : 
                status === 'error' ? 'bg-red-500' : 'bg-primary'
              }`}
            />

            {status === 'connected' && (
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-500/10 pointer-events-none"
               />
            )}
          </div>

          {/* Central Logo */}
          <motion.div 
            animate={status === 'connected' ? { scale: [1, 1.3, 1], rotate: 360 } : {}}
            transition={{ duration: 1 }}
            className={`mt-4 transition-colors duration-500 ${
              status === 'connected' ? 'text-green-500' : 'text-primary/40'
            }`}
          >
            <Bitcoin size={32} className={status === 'connecting' ? 'animate-spin-slow' : ''} />
          </motion.div>
        </div>

        {/* Orbiting Elements */}
        <AnimatePresence>
          {status === 'connected' && (
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              className="absolute -top-8 -right-8 w-16 h-16 glass-ios rounded-2xl flex items-center justify-center text-green-500 shadow-xl"
            >
              <Sparkles size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Shadow */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-36 h-4 bg-black/60 blur-xl rounded-full scale-x-150"></div>
    </div>
  );
};

const WalletModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { connectWallet } = useStore();
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
      const walletInfo = type === 'Xverse' ? await connectXverse() : await connectUniSat();
      setConnectedAddress(walletInfo.address);
      setStatus('connected');
      
      // Standard celebration period
      setTimeout(() => {
        connectWallet(walletInfo);
        onClose();
      }, 3000);
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message === 'XVERSE_NOT_INSTALLED' 
        ? 'Xverse extension not found in browser payload.' 
        : 'Authentication sequence interrupted.');
    }
  };

  const copyToClipboard = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-[40px] overflow-hidden"
      >
        {/* Background Decorative Elements - Reduced Size/Opacity */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full"
          />
        </div>

        {/* Exit Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-4 glass-ios rounded-full text-white/30 hover:text-white transition-all z-50 group active:scale-90"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>

        <div className="w-full max-w-2xl px-6 flex flex-col items-center">
          
          <AnimatedCharacter status={status} />

          {/* Status Text Block */}
          <motion.div 
            layout
            className="text-center mb-10 space-y-3"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gradient uppercase italic leading-tight">
              {status === 'connected' ? 'Authenticated' : 
               status === 'connecting' ? 'Handshaking' : 
               status === 'error' ? 'Connection Failed' : 'Welcome to Atelier'}
            </h2>
            <p className="text-gray-500 text-base font-medium max-w-md mx-auto">
              {status === 'connected' ? 'Sovereign identity verified. Initializing secure vault access...' : 
               status === 'connecting' ? 'Establishing peer-to-peer bridge to the Bitcoin blockchain...' : 
               status === 'error' ? errorMessage : 'Your gateway to premium Bitcoin-native craftsmanship. Choose your prover.'}
            </p>
          </motion.div>

          {/* Connection Interface */}
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              {status === 'connected' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="glass-ios p-8 rounded-[32px] border-green-500/20 bg-green-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6">
                    <CheckCircle2 size={24} className="text-green-500 animate-pulse" />
                  </div>
                  
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500/60 block mb-4 italic">Secure Identity</span>
                  
                  <div 
                    onClick={copyToClipboard}
                    className="bg-black/40 p-5 rounded-[20px] flex items-center justify-between group cursor-pointer border border-white/5 hover:border-primary/30 transition-all"
                  >
                    <code className="text-primary font-mono text-xs truncate">
                      {connectedAddress?.slice(0, 12)}...{connectedAddress?.slice(-12)}
                    </code>
                    <Copy size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                    <span>Mempool Verified</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-ping delay-100"></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Primary Xverse Button */}
                  <button 
                    onMouseEnter={() => status === 'idle' && setStatus('hover')}
                    onMouseLeave={() => status === 'hover' && setStatus('idle')}
                    onClick={() => handleConnect('Xverse')}
                    disabled={status === 'connecting'}
                    className="w-full relative group overflow-hidden bg-white text-black py-6 rounded-[24px] font-black text-xl flex items-center justify-center space-x-3 transition-all hover:bg-primary shadow-[0_20px_60px_rgba(0,242,255,0.2)] active:scale-95 disabled:opacity-50"
                  >
                    {status === 'connecting' ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <span className="relative z-10">Connect Xverse</span>
                        <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                    <motion.div 
                      animate={{ x: ['100%', '-100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-12"
                    />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleConnect('UniSat')}
                      disabled={status === 'connecting'}
                      className="glass-ios py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <Bitcoin size={14} />
                      <span>UniSat</span>
                    </button>
                    <a 
                      href="https://www.xverse.app/download" 
                      target="_blank"
                      className="glass-ios py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary transition-all active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <ExternalLink size={14} />
                      <span>Get Xverse</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 glass-ios border-red-500/20 bg-red-500/5 rounded-[20px] flex items-center space-x-3"
                >
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-[10px] font-bold text-red-500 leading-snug">{errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-16 flex items-center space-x-8 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
             <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Non-Custodial</div>
                <div className="h-px w-6 bg-primary/40 mx-auto"></div>
             </div>
             <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Direct BTC</div>
                <div className="h-px w-6 bg-primary/40 mx-auto"></div>
             </div>
             <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1">Peer-to-Peer</div>
                <div className="h-px w-6 bg-primary/40 mx-auto"></div>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletModal;
