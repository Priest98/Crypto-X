
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ChevronLeft, ChevronRight, Zap, ArrowUpRight, Star, Quote } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ImageLoader from '../components/ImageLoader';
import PaymentModal from '../components/PaymentModal';

const Home: React.FC = () => {
  const { products, addToCart } = useStore();
  const featured = products.slice(0, 6);
  const arrivalsRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const conceptRef = useRef<HTMLDivElement>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [btcPrice, setBtcPrice] = React.useState(98500); // Mock BTC Price
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);

  const handleBuyNow = (product: any) => {
    setSelectedProduct(product);
    setIsPaymentModalOpen(true);
  };

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

  const reviews = [
    { name: "Alex V.", handle: "@hodl_forever", text: "The payment experience is mind-blowing. Instant settlement via Lightning, zero friction. This is how commerce should be.", rating: 5 },
    { name: "Sarah J.", handle: "@satoshi_design", text: "Finally, a luxury brand that understands Bitcoiners. The quality of the silk shirt is unmatched, and paying in sats felt like magic.", rating: 5 },
    { name: "Michael R.", handle: "@block_streamer", text: "Fastest checkout I've ever experienced. No forms, no banks, just pure peer-to-peer value transfer. The packaging was a work of art too.", rating: 5 },
    { name: "Elena K.", handle: "@cypher_queen", text: "The provenance certificate is a game changer. Knowing my parka is cryptographically verified on-chain gives it a soul. Technologically brilliant.", rating: 5 },
    { name: "David L.", handle: "@mint_master", text: "I was skeptical about the 'magnetic' buttons, but everything about this brand screams quality. Payment confirmed in seconds.", rating: 4 }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Video Frame Design */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Immersive Background Elements - Maintained */}
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute right-[10%] top-0 bottom-0 w-64 bg-gradient-to-b from-primary/20 via-secondary/10 to-transparent blur-[140px] animate-pulse-glow"></div>
          <div className="absolute left-0 top-[20%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full"></div>
          <div className="absolute right-0 bottom-[10%] w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full"></div>
        </div>

        {/* Top Label */}
        <div className="absolute top-8 z-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="text-xs font-black tracking-[0.4em] uppercase text-white/40">Velencia Atelier</span>
        </div>

        {/* Main Content - Centered */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 tracking-tight leading-[1.1] animate-in zoom-in-95 duration-1000">
            Native.<br />
            <span className="italic text-primary">Bitcoin.</span><br />
            Luxury.
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl font-light tracking-wide leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
            Bespoke craftsmanship for the hyper-bitcoinized era. Every garment verified on-chain via the sovereign ledger.
          </p>
        </div>

        {/* Glassmorphic Bottom Bar */}

      </section>

      {/* Swipeable Product Highlight Section */}
      <section className="py-24 max-w-full overflow-hidden relative group/section">
        <div className="max-w-7xl mx-auto px-8 flex items-end justify-between mb-16">
          <div>
            <h2 className="text-5xl font-black tracking-tighter">New <span className="text-primary italic">Arrivals</span></h2>
            <p className="text-gray-500 mt-2 font-medium text-base">Curated masterpieces for the sovereign individual.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button aria-label="Scroll left" onClick={() => scroll(arrivalsRef, 'left')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronLeft size={24} /></button>
            <button aria-label="Scroll right" onClick={() => scroll(arrivalsRef, 'right')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronRight size={24} /></button>
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
              <div className="glass-ios border-gradient-animated rounded-[40px] overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                <div className="h-[400px] overflow-hidden relative group">
                  <ImageLoader src={product.image} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={product.name} />
                  <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-20 pointer-events-none"></div>
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
                    <button
                      onClick={() => addToCart(product)}
                      className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-primary transition-all duration-500 active:scale-90 shadow-xl"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 max-w-full overflow-hidden relative bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-7xl mx-auto px-8 flex items-end justify-between mb-16">
          <div>
            <h2 className="text-5xl font-black tracking-tighter">Client <span className="text-primary italic">Voices</span></h2>
            <p className="text-gray-500 mt-2 font-medium text-base">Experiences from the sovereign network.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button aria-label="Scroll left" onClick={() => scroll(reviewsRef, 'left')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronLeft size={24} /></button>
            <button aria-label="Scroll right" onClick={() => scroll(reviewsRef, 'right')} className="w-12 h-12 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"><ChevronRight size={24} /></button>
          </div>
        </div>

        <div
          ref={reviewsRef}
          className="flex overflow-x-auto gap-6 px-8 md:px-[calc(50vw-632px)] pb-12 snap-x snap-mandatory scrollbar-hide no-scrollbar"
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="min-w-[85vw] md:min-w-[400px] snap-center"
            >
              <div className="glass-ios p-8 rounded-[40px] h-full flex flex-col justify-between border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, starI) => (
                        <Star
                          key={starI}
                          size={16}
                          className={`${starI < review.rating ? 'text-primary fill-primary' : 'text-white/10'} transition-all duration-300 group-hover:scale-110`}
                          style={{ transitionDelay: `${starI * 50}ms` }}
                        />
                      ))}
                    </div>
                    <Quote size={24} className="text-white/10 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <p className="text-xl font-medium leading-relaxed text-white/90 mb-8 font-serif italic">"{review.text}"</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-black text-white/50 group-hover:text-primary transition-colors">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-xs font-bold text-primary/70 uppercase tracking-wider">{review.handle}</div>
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
            <button aria-label="Scroll left" onClick={() => scroll(conceptRef, 'left')} className="w-14 h-14 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 border-white/10"><ChevronLeft size={24} /></button>
            <button aria-label="Scroll right" onClick={() => scroll(conceptRef, 'right')} className="w-14 h-14 glass-ios rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 border-white/10"><ChevronRight size={24} /></button>
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
      {/* Payment Modal */}
      {selectedProduct && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          orderId={`ORDER-${Date.now()}`}
          totalAmount={2500} // Mock Mock Price for Demo
          btcPrice={btcPrice}
        />
      )}
    </div>
  );
};

export default Home;
