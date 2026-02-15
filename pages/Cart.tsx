
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Wallet, Shield, X, Check } from 'lucide-react';
import ImageLoader from '../components/ImageLoader';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, wallet, setWalletModalOpen } = useStore();
  const navigate = useNavigate();
  const [itemToRemove, setItemToRemove] = React.useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price_btc * item.quantity), 0);
  const fee = 0.00005; // Network estimation
  const total = subtotal + fee;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-40 text-center animate-in fade-in zoom-in duration-1000">
        <div className="glass-ios w-40 h-40 rounded-[60px] flex items-center justify-center mx-auto mb-12 group">
          <ShoppingBag size={80} className="text-white/10 group-hover:text-primary group-hover:scale-110 transition-all duration-700" />
        </div>
        <h1 className="text-6xl font-black mb-6 tracking-tighter">Your Bag is Empty</h1>
        <p className="text-gray-500 text-xl mb-16 max-w-md mx-auto font-medium">The collection awaits. Begin curating your sovereign digital wardrobe today.</p>
        <Link to="/products" className="inline-block bg-white text-black px-12 py-6 rounded-[32px] font-black text-xl hover:bg-primary transition-all active:scale-95 shadow-2xl">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <h1 className="text-8xl font-black tracking-tighter mb-24">The <span className="text-primary italic">Selection</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item, idx) => (
            <div
              key={item.id}
              className="glass-ios rounded-[50px] p-10 flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-full md:w-48 h-64 glass-ios rounded-[40px] overflow-hidden shrink-0 group">
                <ImageLoader src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
              </div>

              <div className="flex-grow text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">{item.category}</span>
                <h3 className="text-4xl font-black tracking-tight mb-4 text-white/90">{item.name}</h3>
                <div className="flex items-center justify-center md:justify-start space-x-2 text-white">
                  <span className="font-black text-xl text-primary">₿</span>
                  <span className="font-black text-2xl">{item.price_btc}</span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="flex items-center glass-ios rounded-[24px] p-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-[18px] text-gray-400 hover:text-white transition-all active:scale-90"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-black text-xl">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-[18px] text-gray-400 hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {itemToRemove === item.id ? (
                  <div className="flex items-center space-x-3 bg-red-500/10 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-bold text-red-500 uppercase">Confirm?</span>
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        setItemToRemove(null);
                      }}
                      className="p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setItemToRemove(null)}
                      className="p-1 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setItemToRemove(item.id)}
                    className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors duration-500"
                  >
                    <Trash2 size={16} />
                    <span>Remove Item</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-ios rounded-[60px] p-12 sticky top-40 border border-white/5 shadow-2xl">
            <h2 className="text-4xl font-black tracking-tight mb-12">Summary</h2>

            <div className="space-y-8 mb-12">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="text-white font-black text-lg">{subtotal.toFixed(8)} ₿</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Settlement Fee</span>
                <span className="text-white font-black text-lg">{fee.toFixed(8)} ₿</span>
              </div>

              <div className="pt-10 border-t border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <span className="font-black text-sm uppercase tracking-[0.2em] text-gray-500">Total</span>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 text-primary">
                      <span className="text-2xl font-black italic">₿</span>
                      <span className="text-5xl font-black tracking-tighter">{total.toFixed(8)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Pure Bitcoin</span>
                </div>
              </div>
            </div>

            {wallet ? (
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-white text-black py-8 rounded-[32px] font-black text-2xl flex items-center justify-center space-x-4 transition-all hover:bg-primary active:scale-[0.98] shadow-2xl"
              >
                <span>Proceed</span>
                <ArrowRight size={24} />
              </button>
            ) : (
              <div className="space-y-6">
                <div className="glass-ios p-6 rounded-[28px] border border-primary/20 bg-primary/5">
                  <p className="text-primary text-xs font-black uppercase tracking-widest text-center">Connect wallet to checkout</p>
                </div>
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="w-full bg-white text-black py-8 rounded-[32px] font-black text-2xl flex items-center justify-center space-x-4 border border-white/5 hover:bg-primary transition-colors shadow-2xl"
                >
                  <Wallet size={24} />
                  <span>Connect Wallet</span>
                </button>
              </div>
            )}

            <div className="mt-12 pt-10 border-t border-white/5">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-[14px] flex items-center justify-center text-green-500 shrink-0">
                  <Shield size={20} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-widest">
                  Assets secured by the Bitcoin network. Peer-to-peer settlement only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
