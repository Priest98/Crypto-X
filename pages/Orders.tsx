
import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, ExternalLink, Package, CheckCircle, Wallet, History } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const { orders, wallet } = useStore();

  const userOrders = wallet ? orders.filter(o => o.wallet_address === wallet.address) : [];

  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-40 text-center animate-in fade-in duration-1000">
        <div className="glass-ios w-32 h-32 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-white/5">
          <Wallet size={60} />
        </div>
        <h1 className="text-6xl font-black mb-6 tracking-tighter">The Archive</h1>
        <p className="text-gray-500 text-xl mb-12 font-medium">Please authenticate your wallet to access your collection's history.</p>
        <button className="px-12 py-5 bg-white text-black rounded-full font-black text-xl hover:bg-primary transition-all shadow-2xl">Connect Prover</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1 glass-ios rounded-full">
            <History size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Digital Provenance</span>
          </div>
          <h1 className="text-8xl font-black tracking-tighter mb-4">Your <span className="text-primary italic">Archive</span></h1>
          <p className="text-gray-500 font-medium text-lg max-w-md">
            History of on-chain boutique asset acquisitions for wallet <span className="text-white font-mono">{wallet.address.slice(0, 12)}...</span>
          </p>
        </div>
        <div className="glass-ios rounded-[24px] px-8 py-4 flex items-center space-x-4 animate-in fade-in zoom-in duration-1000 delay-200">
           <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Assets Owned:</span>
           <span className="text-3xl font-black text-primary">{userOrders.length}</span>
        </div>
      </div>

      {userOrders.length > 0 ? (
        <div className="space-y-12">
          {userOrders.map((order, idx) => (
            <div 
              key={order.id} 
              className="glass-ios rounded-[60px] overflow-hidden group border border-white/5 animate-in fade-in slide-in-from-bottom-12 duration-1000"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="p-10 md:p-14 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Acquisition Date</span>
                    <span className="text-xl font-black text-white/90">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Digital Invoice</span>
                    <span className="font-mono text-sm text-primary">{order.id}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block">Authentication</span>
                    <div className="flex items-center space-x-2 text-green-500">
                       <CheckCircle size={14} />
                       <span className="text-xs font-black uppercase tracking-widest">Settled</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 block mb-2">Total Settled</span>
                    <div className="flex items-center justify-end space-x-2 text-primary">
                       <span className="text-xl font-black italic">₿</span>
                       <span className="text-3xl font-black tracking-tighter">{order.total_btc.toFixed(6)}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://mempool.space/tx/${order.transaction_hash}`} 
                    target="_blank" 
                    rel="noopener"
                    className="w-16 h-16 glass-ios hover:bg-primary hover:text-black rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-105"
                    title="Verify on Blockchain"
                  >
                    <ExternalLink size={24} />
                  </a>
                </div>
              </div>

              <div className="p-10 md:p-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-8 p-6 glass-ios rounded-[32px] hover:bg-white/5 transition-colors">
                      <div className="w-20 h-20 glass-ios rounded-[20px] overflow-hidden shrink-0 border border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[40%] hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-white/80">{item.name}</h4>
                        <div className="flex items-center space-x-4">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Qty: {item.quantity}</span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.price_btc} ₿</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 glass-ios rounded-[60px] animate-in fade-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white/5">
            <Package size={40} className="text-gray-600" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Empty Archive</h2>
          <p className="text-gray-500 text-lg max-w-sm mx-auto mb-12">Your collection journey is yet to begin. Sovereign assets await your acquisition.</p>
          <Link to="/products" className="inline-block bg-white text-black px-12 py-5 rounded-full font-black text-lg hover:bg-primary transition-all">Explore Collections</Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
