
import { Product } from './types';

export const NETWORK_CONFIG = {
  mainnet: {
    mempoolApi: 'https://mempool.space/api',
    storeAddress: 'bc1ql2accezc3pfz0v0ysx0qnlwplvxwgyqurjzsln'
  },
  testnet: {
    mempoolApi: 'https://mempool.space/testnet/api',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4'
  },
  testnet4: {
    // Primary: https://btc-testnet4.xverse.app | Fallback: https://mempool.space/testnet4/api
    mempoolApi: 'https://btc-testnet4.xverse.app',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4'
  },
  signet: {
    // Primary: https://btc-signet.xverse.app | Fallback: https://mempool.space/signet/api
    mempoolApi: 'https://btc-signet.xverse.app',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4'
  },
  regtest: {
    // SBTC Mempool Proxy
    mempoolApi: 'https://beta.sbtc-mempool.tech/api/proxy',
    storeAddress: 'bcrt1q8c8v4v6y28p8v28v28v28v28v28v28v28v28'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Monogrammed Silk Atelier Shirt',
    description: '100% heavy-weight mulberry silk featuring a subtle jacquard Bitcoin pattern. Hand-finished in Italy for the digital sovereign.',
    price_btc: 0.0045,
    image: 'https://images.unsplash.com/photo-1620012253295-c15cc3ef6548?q=80&w=1965&auto=format&fit=crop',
    stock: 12,
    category: 'Atelier'
  },
  {
    id: '2',
    name: 'Genesis Block Wool Overcoat',
    description: 'Double-breasted tailored coat crafted from ultra-fine virgin wool. Features an internal QR code linking to the Genesis Block hash.',
    price_btc: 0.015,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop',
    stock: 5,
    category: 'Outerwear'
  },
  {
    id: '3',
    name: 'Sovereign Diver Chronograph',
    description: 'Swiss-made automatic movement housed in a black DLC titanium case. Water-resistant to 300m. The ultimate tool watch for the high-time-preference age.',
    price_btc: 0.085,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop',
    stock: 20,
    category: 'Timepieces'
  },
  {
    id: '4',
    name: 'Halving Edition Cashmere Hoodie',
    description: 'Unrivaled softness. Loro Piana cashmere blend with "21,000,000" embroidered in high-density orange silk thread.',
    price_btc: 0.0032,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop',
    stock: 40,
    category: 'Essentials'
  },
  {
    id: '5',
    name: 'Block 0 Leather Chelsea Boots',
    description: 'Hand-burnished calfskin leather with a discrete orange sole-plate. The foundation of a sovereign wardrobe.',
    price_btc: 0.0068,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=2000&auto=format&fit=crop',
    stock: 15,
    category: 'Footwear'
  },
  {
    id: '6',
    name: 'Satoshi Aviator Sunglasses',
    description: 'Polarized lenses with anti-reflective coating. Gold-plated titanium frames. See the world clearly.',
    price_btc: 0.0018,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop',
    stock: 30,
    category: 'Accessories'
  }
];
