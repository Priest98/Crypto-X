
import { Product } from './types';

export const NETWORK_CONFIG = {
  mainnet: {
    mempoolApi: 'https://mempool.space/api',
    storeAddress: 'bc1ql2accezc3pfz0v0ysx0qnlwplvxwgyqurjzsln'
  },
  testnet: {
    mempoolApi: 'https://mempool.space/testnet/api',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4',
    faucetUrl: 'https://faucet.midl.xyz/'
  },
  testnet4: {
    // Primary: https://btc-testnet4.xverse.app | Fallback: https://mempool.space/testnet4/api
    mempoolApi: 'https://btc-testnet4.xverse.app',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4',
    faucetUrl: 'https://faucet.midl.xyz/'
  },
  signet: {
    // Primary: https://btc-signet.xverse.app | Fallback: https://mempool.space/signet/api
    mempoolApi: 'https://btc-signet.xverse.app',
    storeAddress: 'tb1q3yjskkv6cmhfmafya33xapau689gzf3ykag7t4',
    faucetUrl: 'https://faucet.midl.xyz/'
  },
  regtest: {
    // Midl Regtest Environment
    mempoolApi: 'https://mempool.regtest.midl.xyz/api',
    storeAddress: 'bcrt1q9renzw7uh4zk8wfp5hx5zk8w7p4kv4qffhq8kx', // Valid regtest address
    faucetUrl: 'https://faucet.midl.xyz/'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Burgundy Field Jacket',
    description: 'Tech-infused burgundy field jacket with silk scarf accent. Water-resistant treated cotton canvas with hidden key storage.',
    price_btc: 0.0055,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=75&w=800&auto=format&fit=crop', // Burgundy/Reddish jacket (reverting to a known good coat image)
    stock: 8,
    category: 'Outerwear'
  },
  {
    id: '2',
    name: 'Crimson Wrap Coat',
    description: 'Minimalist deep red wool wrap coat. Features a geometric embroidered sigil on the back collar. Japanese denim lining.',
    price_btc: 0.018,
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=800&auto=format&fit=crop', // Reliable fashion image
    stock: 4,
    category: 'Outerwear'
  },
  {
    id: '3',
    name: 'Chronos Titanium',
    description: 'Black DLC titanium chronograph. Swiss automatic movement. Sapphire crystal caseback revealing the escapement.',
    price_btc: 0.125,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=75&w=800&auto=format&fit=crop', // Luxury watch
    stock: 10,
    category: 'Timepieces'
  },
  {
    id: '4',
    name: 'Olive Drab Tunic',
    description: 'Oversized olive tunic in organic hemp structure. Breathable, durable, and antimicrobial. Future-primitive aesthetic.',
    price_btc: 0.0028,
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=75&w=800&auto=format&fit=crop', // Olive/Green clothing
    stock: 25,
    category: 'Essentials'
  },
  {
    id: '5',
    name: 'Slate Minimalist Set',
    description: 'Coordinated shirt and trouser set in slate gray. Bamboo-viscose blend for draping silhouette.',
    price_btc: 0.0075,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=75&w=800&auto=format&fit=crop', // Minimalist grey outfit
    stock: 12,
    category: 'Atelier'
  },
  {
    id: '6',
    name: 'Ghost Low-Top Sneakers',
    description: 'Italian leather low-tops in phantom white. Hand-stitched sole. The silent step.',
    price_btc: 0.0042,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=75&w=800&auto=format&fit=crop', // White sneakers
    stock: 18,
    category: 'Footwear'
  }
];
