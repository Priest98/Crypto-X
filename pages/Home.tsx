
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, Zap, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Home: React.FC = () => {
  const { products } = useStore();
  const featured = products.slice(0, 6);
  const arrivalsRef = useRef<HTMLDivElement>(null);
  const conceptRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const concepts = [
    { title: "Bespoke Payments", desc: "No intermediaries. No wrap-tokens. Only raw Bitcoin transactions handled peer-to-peer.", val: "Native", icon: <Zap size={24} /> },
    { title: "Digital Provenance", desc: "Every garment comes with a unique Ordinal-linked certificate of authenticity stored forever.", val: "Verified", icon: <Zap size={24} /> },
    { title: "Global Couture", desc: "Discrete, insured global shipping powered by borderless settlement to any corner of the globe.", val: "Worldwide", icon: <Zap size={24} /> },
    { title: "Sovereign Supply", desc: "Limited production runs governed by cryptographic scarcity. Only 21 units per master design.", val: "Scarcity", icon: <Zap size={24} /> }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Full Screen Impact */}
      <section className="relative min-h-screen flex items-center px-4 md:px-20 overflow-hidden">
        {/* Immersive Background Elements */}
        <div className="absolute right-[10%] top-0 bottom-0 w-64 bg-gradient-to-b from-primary/30 via-secondary/20 to-transparent blur-[140px] -z-10 animate-pulse-glow"></div>
        <div className="absolute left-0 top-[20%] w-[500px] h-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full"></div>
        <div className="absolute right-0 bottom-[10%] w-[600px] h-[600px] bg-secondary/5 blur-[150px] -z-10 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative z-20 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 glass-ios rounded-full mb-12">
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">CryptoX Atelier</span>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <span className="text-[10px] font-medium text-white/50">MMXXV Collection</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-[2.2] tracking-[0.4em] text-gradient mb-20 uppercase">
              Native. <br /> 
              <span className="text-primary italic">Bitcoin.</span> <br /> 
              Luxury.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-sm mb-16 font-medium leading-relaxed border-l-2 border-primary/20 pl-8">
              Bespoke craftsmanship for the hyper-bitcoinized era. Every garment verified on-chain via the sovereign ledger.
            </p>
            
            <div className="flex flex-wrap items-center gap-8">
              <Link 
                to="/products" 
                className="px-12 py-6 bg-white text-black font-bold rounded-[24px] flex items-center space-x-3 transition-all duration-500 hover:scale-105 hover:bg-primary shadow-[0_20px_80px_rgba(0,242,255,0.3)]"
              >
                <span>The Collection</span>
                <ChevronRight size={20} />
              </Link>
              <Link 
                to="/orders" 
                className="px-12 py-6 glass-ios text-white/70 font-bold rounded-[24px] flex items-center space-x-3 hover:text-white hover:bg-white/5 transition-all duration-500"
              >
                <span>Archive</span>
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 animate-bounce opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Explore</span>
           <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Swipeable Product Highlight Section */}
      <section className="py-24 max-w-full overflow-hidden relative group/section">
        <div className="max-w-7xl mx-auto px-8 flex items-end justify-between mb-16">
          <div>
            <h2 className="text-5xl font-black tracking-tighter">New <span className="text-primary italic">Arrivals</span></h2>
            <p className="text-gray-500 mt-2 font-medium text-base">Curated masterpieces for the sovereign individual.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button onClick={() => scroll(arrivalsRef, 'left')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronLeft size={24} /></button>
             <button onClick={() => scroll(arrivalsRef, 'right')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div 
          ref={arrivalsRef}
          className="flex overflow-x-auto gap-6 px-8 md:px-[calc(50vw-632px)] pb-12 snap-x snap-mandatory scrollbar-hide no-scrollbar"
        >
          {featured.map((product, idx) => (
            <div 
              key={product.id} 
              className="min-w-[75vw] md:min-w-[340px] snap-center"
            >
              <div className="glass-ios rounded-[40px] overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                <div className="h-[400px] overflow-hidden relative group">
                   <img src={product.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="" />
                   <div className="absolute top-6 left-6 px-4 py-1 glass-ios rounded-full text-[9px] font-black uppercase tracking-widest">{product.category}</div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="p-8 bg-gradient-to-b from-transparent to-white/[0.01]">
                  <h3 className="text-xl font-black mb-6 text-white/90 tracking-tight leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <span className="text-primary font-black text-lg">₿</span>
                        <span className="text-2xl font-black">{product.price_btc}</span>
                     </div>
                     <Link 
                      to={`/products/${product.id}`} 
                      className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary transition-all duration-500 active:scale-90 shadow-xl"
                     >
                        <ShoppingBag size={20} />
                     </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Atelier Concept Carousel Section */}
      <section className="max-w-full overflow-hidden relative bg-white/[0.01] py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between mb-20">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
              Atelier <span className="text-secondary italic">Concept</span>
            </h2>
            <p className="text-gray-500 mt-4 font-medium text-lg max-w-xs">Defining the standards of cryptographic provenance.</p>
          </div>
          <div className="flex items-center space-x-3 mt-8 md:mt-0">
             <button onClick={() => scroll(conceptRef, 'left')} className="w-14 h-14 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 border-white/10"><ChevronLeft size={24} /></button>
             <button onClick={() => scroll(conceptRef, 'right')} className="w-14 h-14 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 border-white/10"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div 
          ref={conceptRef}
          className="flex overflow-x-auto gap-8 px-8 md:px-[calc(50vw-632px)] pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar"
        >
          {concepts.map((concept, i) => (
            <div 
              key={i} 
              className="min-w-[75vw] md:min-w-[380px] snap-center"
            >
              <div className="glass-ios p-10 md:p-12 rounded-[50px] h-full group hover:bg-white/[0.03] transition-all duration-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-all duration-700"></div>
                
                <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-xl">
                  {concept.icon}
                </div>
                
                <h3 className="text-2xl font-black mb-4 tracking-tight text-white/90">{concept.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed mb-10">{concept.desc}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-primary/50 transition-colors">{concept.val}</div>
                  <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3 group-hover:w-full transition-all duration-1000"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
