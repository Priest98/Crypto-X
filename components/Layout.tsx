
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Menu, X, ShoppingBag, LayoutDashboard, History } from 'lucide-react';
import WalletModal from './WalletModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, wallet, disconnectWallet } = useStore();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const navLinks = [
    { name: 'Collections', path: '/products', icon: <ShoppingBag size={18} /> },
    { name: 'Archive', path: '/orders', icon: <History size={18} /> },
    { name: 'Boutique', path: '/admin', icon: <LayoutDashboard size={18} /> },
  ];

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen text-white flex flex-col selection:bg-primary/30">
      <div className="fixed top-6 left-0 right-0 z-[100] px-4">
        <nav className="max-w-5xl mx-auto glass-ios rounded-[32px] px-8 py-3 flex items-center justify-between shadow-2xl">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-xl leading-none italic">X</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white/90">CryptoX Atelier</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${location.pathname === link.path ? 'bg-white/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-white transition-all bg-white/5 rounded-full border border-white/5">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {wallet ? (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full pl-5 pr-1 py-1 space-x-4">
                <span className="text-[11px] font-mono text-primary font-bold">{shortenAddress(wallet.address)}</span>
                <button 
                  onClick={disconnectWallet}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-full transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:bg-primary shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              >
                Enter
              </button>
            )}
          </div>

          <button className="md:hidden p-2 text-white/70" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      <main className={`flex-grow ${!isHome ? 'pt-32' : ''}`}>
        {children}
      </main>

      <footer className="py-20 px-8 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-t border-white/5 pt-10">
          <div className="mb-10 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
               <div className="w-6 h-6 bg-primary rounded-lg"></div>
               <span className="text-xl font-bold italic">CryptoX Atelier</span>
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
              <a href="#" className="text-sm text-gray-400 hover:text-white">Whitepaper</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white">Verify Proof</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
           <span>&copy; 2025 Cryptox Atelier</span>
           <div className="flex items-center space-x-4">
             <span className="text-primary/50">Verified On-Chain</span>
             <span className="text-secondary/50">Bespoke Couture</span>
           </div>
        </div>
      </footer>

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
};

export default Layout;
