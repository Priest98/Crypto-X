
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  addToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, addToCart }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (entry.boundingClientRect.top > window.innerHeight) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // High-performance parallax logic
    const handleScroll = () => {
      if (!cardRef.current || !imgRef.current || !isVisible) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate position relative to viewport center (-0.5 to 0.5)
      const centerOffset = (rect.top + rect.height / 2) / viewportHeight - 0.5;
      
      // Apply subtle vertical movement
      const translateY = centerOffset * 40; // Reduced travel for smaller card
      imgRef.current.style.transform = `scale(1.15) translateY(${translateY}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  return (
    <div 
      ref={cardRef}
      className={`group relative will-change-transform transition-all duration-[1200ms] cubic-bezier(0.2, 0.8, 0.2, 1) ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-24 scale-[0.92] blur-[2px]'
      }`}
      style={{ 
        transitionDelay: isVisible ? '0ms' : `${(index % 3) * 100}ms`
      }}
    >
      <div className="glass-ios rounded-[32px] overflow-hidden flex flex-col h-full hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-all duration-700">
        <Link to={`/products/${product.id}`} className="block h-[420px] relative overflow-hidden">
           <img 
            ref={imgRef}
            src={product.image} 
            className={`w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-opacity duration-[1500ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
            style={{ willChange: 'transform' }}
            alt={product.name} 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <div className={`absolute top-6 left-6 px-3 py-1 glass-ios rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
             {product.category}
           </div>
        </Link>
        
        <div className="p-8 flex flex-col flex-grow relative z-10 bg-background/40 backdrop-blur-md">
           <div className="absolute top-0 right-8 w-px h-10 bg-gradient-to-b from-primary/20 to-transparent"></div>
           <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black tracking-tighter text-white/90 group-hover:text-primary transition-colors duration-500 leading-tight">
                {product.name}
              </h3>
           </div>
           
           <p className="text-gray-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">
             {product.description}
           </p>
           
           <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-1">Price</span>
                 <div className="flex items-center space-x-2">
                    <span className="text-primary font-black text-xl">₿</span>
                    <span className="text-2xl font-black text-gradient">{product.price_btc}</span>
                 </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary transition-all shadow-lg active:scale-90"
              >
                <Plus size={24} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Products: React.FC = () => {
  const { products, addToCart } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    setIsHeaderVisible(true);
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
        <div className={`transition-all duration-[1200ms] ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1 glass-ios rounded-full">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Current Selection</span>
          </div>
          <h1 className="text-7xl font-black tracking-tighter mb-4">
            The <span className="text-primary italic">Atelier</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-sm">
            Exclusive garments authenticated via on-chain provenance.
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto transition-all duration-[1200ms] delay-200 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="relative flex-grow sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search garments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-ios px-16 py-5 rounded-[24px] focus:outline-none focus:border-primary/50 text-lg transition-all"
            />
          </div>
          
          <div className="flex items-center glass-ios p-2 rounded-[24px] overflow-x-auto no-scrollbar max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-white text-black shadow-lg scale-100' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {filteredProducts.map((product, idx) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={idx} 
            addToCart={addToCart} 
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
