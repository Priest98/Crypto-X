
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Menu, X, ShoppingBag, LayoutDashboard, History, ChevronRight, Github } from 'lucide-react';
import WalletModal from './WalletModal';
import ToastContainer from './Toast';
import ScrollToTop from './ScrollToTop';
import VelenciaLogo from './VelenciaLogo';
import { NETWORK_CONFIG } from '../constants';
import { Network } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, wallet, disconnectWallet, toasts, dismissToast, network, setNetwork, isWalletModalOpen, setWalletModalOpen } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Collections', path: '/products', icon: <ShoppingBag size={18} /> },
    { name: 'Archive', path: '/orders', icon: <History size={18} /> },
    { name: 'Boutique', path: '/admin', icon: <LayoutDashboard size={18} /> },
  ];

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen text-white flex flex-col selection:bg-primary/30">
      <div className="fixed top-6 left-0 right-0 z-[100] px-4">
        <nav className="max-w-5xl mx-auto glass-premium rounded-[32px] px-8 py-3 flex items-center justify-between shadow-2xl border border-white/10">
          <Link to="/" className="flex items-center space-x-2 group">
            <VelenciaLogo className="text-white fill-white h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="bg-black/20 border border-white/10 rounded-full px-3 py-1 text-xs font-mono text-gray-400 focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-colors cursor-pointer appearance-none"
              style={{ textAlignLast: 'center' }}
            >
              {Object.keys(NETWORK_CONFIG).map(net => (
                <option key={net} value={net} className="bg-black text-gray-400">{net.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-premium ${location.pathname === link.path ? 'bg-white/10 text-primary glow-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-white transition-premium bg-white/5 rounded-full border border-white/5 hover:border-primary/30">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {wallet ? (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full pl-5 pr-1 py-1 space-x-4">
                <span className="text-[11px] font-mono text-primary font-bold">{shortenAddress(wallet.address)}</span>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition-premium"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm transition-premium hover:bg-primary glow-primary shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-105"
              >
                Enter
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl md:hidden pt-32 px-8 flex flex-col"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`text-3xl font-black tracking-tight flex items-center justify-between group ${location.pathname === link.path ? 'text-primary' : 'text-white/50'
                      }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={`opacity-0 group-hover:opacity-100 transition-opacity ${location.pathname === link.path ? 'opacity-100' : ''
                      }`} />
                  </Link>
                  <div className="h-px bg-white/5 mt-6" />
                </motion.div>
              ))}

              <Link
                to="/cart"
                className="flex items-center justify-between text-2xl font-bold text-white/80 pt-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <ShoppingCart size={24} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span>Your Bag</span>
                </div>
                <ChevronRight className="text-white/30" />
                <ChevronRight className="text-white/30" />
              </Link>

              <div className="pt-6 border-t border-white/5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-600 mb-2 block">Network</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(NETWORK_CONFIG).map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net as Network)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all ${network === net ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-transparent text-gray-500 hover:text-white'
                        }`}
                    >
                      {net.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto mb-12 space-y-6">
              {wallet ? (
                <button
                  onClick={disconnectWallet}
                  className="w-full py-4 rounded-[24px] border border-red-500/20 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                >
                  Disconnect Wallet
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setWalletModalOpen(true);
                  }}
                  className="w-full py-5 rounded-[24px] bg-white text-black font-black text-xl hover:bg-primary transition-colors glow-primary"
                >
                  Connect Wallet
                </button>
              )}

              <div className="flex justify-center space-x-6 text-white/30">
                <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">Discord</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ScrollToTop />

      <main className={`flex-grow ${!isHome ? 'pt-32' : ''}`}>
        {children}
      </main>

      <footer className="py-20 px-8 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-t border-white/5 pt-10">
          <div className="mb-10 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-black font-serif italic tracking-widest text-primary">VELENCIA</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Redefining digital craftsmanship. Hand-finished garments secured by the Bitcoin network.
            </p>
          </div>
          <div className="flex space-x-12">
            <div className="flex flex-col space-y-3">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Atelier</span>
              <Link to="/products" className="text-sm text-gray-400 hover:text-white">Current Season</Link>
              <Link to="/orders" className="text-sm text-gray-400 hover:text-white">The Archive</Link>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Connect</span>
              <Link to="/whitepaper" className="text-sm text-gray-400 hover:text-white">Whitepaper</Link>
              <a href="#" className="text-sm text-gray-400 hover:text-white">Verify Proof</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          <span>&copy; 2026 VELENCIA INTERIOR</span>
          <div className="flex items-center space-x-4">
            <span className="text-primary/50">Verified On-Chain</span>
            <span className="text-secondary/50">Bespoke Couture</span>
          </div>
        </div>
      </footer>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div >
  );
};

export default Layout;
