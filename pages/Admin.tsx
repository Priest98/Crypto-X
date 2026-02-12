
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Package, ShoppingCart, Plus, 
  Edit3, Trash2, TrendingUp, BarChart3, Wallet,
  ArrowUpRight, Globe, ShieldCheck, Zap
} from 'lucide-react';
import { Product } from '../types';

const Admin: React.FC = () => {
  const { products, orders, setProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const totalRev = orders.reduce((acc, o) => acc + o.total_btc, 0);
  const totalSales = orders.length;

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price_btc: 0,
    category: 'Atelier',
    stock: 0,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=1000'
  });

  const handleAddProduct = () => {
    const productToAdd: Product = {
      ...newProduct as Product,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProducts([...products, productToAdd]);
    setIsAddingProduct(false);
    setNewProduct({ 
      name: '', 
      description: '', 
      price_btc: 0, 
      category: 'Atelier', 
      stock: 0, 
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=1000' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1 glass-ios rounded-full">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Merchant Command</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4">
            Boutique <span className="text-primary italic">Ops</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-sm">
            Control the digital atelier. Manage inventory and monitor global settlements.
          </p>
        </div>
        
        <div className="flex glass-ios p-2 rounded-[28px] animate-in fade-in zoom-in duration-1000 delay-200">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === 'products' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Package size={16} />
            <span>Inventory</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === 'orders' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <ShoppingCart size={16} />
            <span>Settlements</span>
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeTab === 'analytics' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart3 size={16} />
            <span>Insights</span>
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { label: 'Settled Volume', value: `${totalRev.toFixed(4)}`, sub: '+18.4%', icon: <TrendingUp className="text-green-500" />, btc: true },
          { label: 'Couture Sold', value: `${totalSales}`, sub: 'Units fulfilled', icon: <Globe className="text-blue-500" /> },
          { label: 'Active Wallets', value: `${new Set(orders.map(o => o.wallet_address)).size}`, sub: 'Unique shoppers', icon: <UsersIcon className="text-purple-500" /> },
          { label: 'System Health', value: '100%', sub: 'BTCPay Active', icon: <ShieldCheck className="text-primary" /> }
        ].map((stat, i) => (
          <div key={i} className="glass-ios p-10 rounded-[40px] relative overflow-hidden group hover:bg-white/[0.04] transition-all duration-700">
            <div className="absolute top-10 right-10 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700">
              {stat.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-6">{stat.label}</span>
            <div className="flex items-center space-x-2">
              {stat.btc && <span className="text-primary font-black text-2xl">₿</span>}
              <div className="text-4xl font-black text-gradient tracking-tighter">{stat.value}</div>
            </div>
            <p className="mt-6 text-xs font-bold text-gray-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="glass-ios rounded-[60px] overflow-hidden border border-white/5 shadow-inner">
        {activeTab === 'products' && (
          <div className="p-12">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black tracking-tight">Archive Inventory</h2>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-primary text-black px-10 py-5 rounded-[24px] font-black flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <Plus size={20} />
                <span>Append Asset</span>
              </button>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Master Asset</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Tier</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Value (BTC)</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Units</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-10">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-[20px] overflow-hidden border border-white/5 relative">
                            <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                          </div>
                          <span className="font-bold text-lg text-white/90">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-10">
                        <span className="px-4 py-1.5 glass-ios rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-10">
                        <div className="flex items-center space-x-2 text-primary">
                          <span className="font-black">₿</span>
                          <span className="font-black text-xl">{p.price_btc}</span>
                        </div>
                      </td>
                      <td className="px-6 py-10">
                         <span className={`text-sm font-black ${p.stock < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                           {p.stock}
                         </span>
                      </td>
                      <td className="px-6 py-10 text-right">
                        <div className="flex items-center justify-end space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 glass-ios rounded-xl text-gray-400 hover:text-white transition-all"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-3 glass-ios rounded-xl text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-12">
             <h2 className="text-4xl font-black tracking-tight mb-12">Settled Transactions</h2>
             <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Invoice Hash</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Prover Wallet</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Settle Amount</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">State</th>
                    <th className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length > 0 ? orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-10 font-mono text-xs text-primary">{o.id}</td>
                      <td className="px-6 py-10">
                        <div className="flex items-center space-x-3 font-mono text-xs text-gray-500">
                           <Wallet size={12} />
                           <span>{o.wallet_address.slice(0, 16)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-10 text-white font-black">₿ {o.total_btc.toFixed(6)}</td>
                      <td className="px-6 py-10">
                         <div className="flex items-center space-x-2 text-green-500">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                           <span className="text-[10px] font-black uppercase tracking-widest">Settled</span>
                         </div>
                      </td>
                      <td className="px-6 py-10 text-gray-500 text-sm font-medium">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-40 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Awaiting first settlement...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
           <div className="p-20 text-center">
              <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-white/5 group">
                <Zap size={60} className="text-primary animate-pulse group-hover:scale-125 transition-transform duration-700" />
              </div>
              <h2 className="text-4xl font-black mb-6 tracking-tight">On-Chain Intelligence</h2>
              <p className="text-gray-500 text-lg max-w-sm mx-auto mb-12">Advanced analytics engine is synchronizing with the Bitcoin mempool. Real-time volume heatmaps arriving shortly.</p>
              <div className="flex items-center justify-center space-x-8">
                 <div className="flex flex-col items-center">
                   <div className="text-2xl font-black text-white">4.2%</div>
                   <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Conversion</div>
                 </div>
                 <div className="w-px h-12 bg-white/10"></div>
                 <div className="flex flex-col items-center">
                   <div className="text-2xl font-black text-white">2.8m</div>
                   <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sats Avg</div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-2xl glass-ios border border-white/10 rounded-[60px] p-16 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary"></div>
            
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black tracking-tight">Append Boutique Asset</h2>
              <button 
                onClick={() => setIsAddingProduct(false)} 
                className="p-4 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Item Identity</label>
                  <input 
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="E.g. Cashmere Block Blazer"
                    className="w-full glass-ios px-8 py-5 rounded-[24px] focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Value Proposition</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-primary font-black">₿</span>
                    <input 
                      type="number" 
                      value={newProduct.price_btc}
                      onChange={(e) => setNewProduct({...newProduct, price_btc: parseFloat(e.target.value)})}
                      className="w-full glass-ios pl-14 pr-8 py-5 rounded-[24px] focus:border-primary/50 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Asset Tier</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full glass-ios px-8 py-5 rounded-[24px] focus:border-primary/50 outline-none appearance-none cursor-pointer"
                  >
                    <option value="Atelier">Atelier</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Units in Reserve</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                    className="w-full glass-ios px-8 py-5 rounded-[24px] focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 block mb-4">Narrative Detail</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={4}
                    className="w-full glass-ios px-8 py-5 rounded-[24px] focus:border-primary/50 outline-none transition-all resize-none text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddProduct}
              className="w-full mt-12 bg-white text-black py-6 rounded-[32px] font-black text-xl hover:bg-primary transition-all active:scale-[0.98] shadow-2xl"
            >
              Confirm Digital Ledger Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icons
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default Admin;
