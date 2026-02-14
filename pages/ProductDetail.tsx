
import React, { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, ShoppingBag, Shield, Truck, RotateCcw, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, btcPrice } = useStore();
  const navigate = useNavigate();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-primary hover:underline">Return to catalog</Link>
      </div>
    );
  }

  // Simulated Gallery Images
  const gallery = [
    product.image,
    `https://picsum.photos/seed/luxury${product.id}1/800/800`,
    `https://picsum.photos/seed/luxury${product.id}2/800/800`,
    `https://picsum.photos/seed/luxury${product.id}3/800/800`,
    `https://picsum.photos/seed/luxury${product.id}4/800/800`
  ];

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <Link to="/products" className="inline-flex items-center space-x-3 text-gray-500 hover:text-white mb-20 transition-all group">
        <div className="p-3 glass-ios rounded-full group-hover:-translate-x-2 transition-transform">
          <ArrowLeft size={18} />
        </div>
        <span className="font-black uppercase tracking-widest text-[10px]">Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        {/* Carousel Product Image */}
        <div className="space-y-10 sticky top-40">
          <div className="relative aspect-[4/5] md:aspect-square bg-white/[0.02] border border-white/5 rounded-[60px] overflow-hidden group">
            {/* Main Images Slider */}
            <div className="w-full h-full flex transition-transform duration-[800ms] cubic-bezier(0.2, 0.8, 0.2, 1)" style={{ transform: `translateX(-${activeImgIndex * 100}%)` }}>
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={product.name}
                  className="w-full h-full object-cover shrink-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                />
              ))}
            </div>

            {/* Navigation Overlay */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <button onClick={prevImg} className="w-16 h-16 glass-ios rounded-full flex items-center justify-center hover:bg-white text-gray-400 hover:text-black transition-all active:scale-90 shadow-2xl">
                <ChevronLeft size={32} />
              </button>
              <button onClick={nextImg} className="w-16 h-16 glass-ios rounded-full flex items-center justify-center hover:bg-white text-gray-400 hover:text-black transition-all active:scale-90 shadow-2xl">
                <ChevronRight size={32} />
              </button>
            </div>

            <button className="absolute top-8 right-8 p-5 glass-ios rounded-full text-white/50 hover:text-red-500 transition-all duration-500 active:scale-75">
              <Heart size={28} />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-10 inset-x-0 flex justify-center space-x-3">
              {gallery.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-all duration-500 rounded-full ${activeImgIndex === i ? 'w-10 bg-primary shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex space-x-6 overflow-x-auto pb-4 no-scrollbar">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImgIndex(i)}
                className={`w-24 h-24 rounded-[24px] overflow-hidden shrink-0 border-2 transition-all duration-500 ${activeImgIndex === i ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-10">
          <div className="mb-12">
            <div className="inline-flex items-center space-x-3 mb-6">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs">{product.category}</span>
              <div className="w-1 h-1 bg-white/20 rounded-full"></div>
              <span className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">Limited MMXXV</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-10 leading-[1.1] tracking-tighter text-gradient">{product.name}</h1>

            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4 text-primary">
                <span className="text-4xl font-black italic">₿</span>
                <span className="text-6xl font-black tracking-tighter">{product.price_btc}</span>
              </div>
              <span className="text-xl text-gray-400 font-bold mt-2 self-end sm:self-auto">≈ ${(product.price_btc * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className="h-12 w-px bg-white/10"></div>
              <div className="px-5 py-2 glass-ios rounded-2xl text-[10px] font-black uppercase tracking-widest text-green-500">
                In Stock ({product.stock})
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-16 text-gray-400 text-lg leading-relaxed font-medium border-l-2 border-white/5 pl-10">
            <p>{product.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
            <button
              onClick={() => addToCart(product)}
              className="w-full sm:flex-1 glass-ios border border-white/10 hover:border-primary hover:bg-white/5 text-white py-8 rounded-[32px] font-black text-xl flex items-center justify-center space-x-4 transition-all duration-500 active:scale-95"
            >
              <ShoppingBag size={24} />
              <span>Append to Bag</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full sm:flex-1 bg-white hover:bg-primary text-black py-8 rounded-[32px] font-black text-xl flex items-center justify-center space-x-4 transition-all duration-500 active:scale-95 shadow-2xl"
            >
              <span>Settlement Now</span>
            </button>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-16 border-t border-white/5">
            {[
              { icon: <Shield size={24} />, title: 'On-Chain Verified', desc: 'Sovereign ledger entry recorded forever.' },
              { icon: <Truck size={24} />, title: 'Discrete Dispatch', desc: 'Insured global transit via premium couriers.' },
              { icon: <RotateCcw size={24} />, title: 'Sovereign Refund', desc: 'Full settlement return within 30 days.' },
              { icon: <Share2 size={24} />, title: 'Referral Rewards', desc: 'Earn 5% in direct Bitcoin commissions.' }
            ].map((benefit, i) => (
              <div key={i} className="flex items-start space-x-6 group">
                <div className="p-4 glass-ios rounded-2xl text-primary shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest mb-2 text-white/90">{benefit.title}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
