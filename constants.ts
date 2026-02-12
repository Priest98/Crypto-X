
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Monogrammed Silk Atelier Shirt',
    description: '100% heavy-weight mulberry silk featuring a subtle jacquard Bitcoin pattern. Hand-finished in Italy for the digital sovereign.',
    price_btc: 0.0045,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1000',
    stock: 12,
    category: 'Atelier'
  },
  {
    id: '2',
    name: 'Genesis Block Wool Overcoat',
    description: 'Double-breasted tailored coat crafted from ultra-fine virgin wool. Features an internal QR code linking to the Genesis Block hash.',
    price_btc: 0.015,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000',
    stock: 5,
    category: 'Outerwear'
  },
  {
    id: '3',
    name: 'Sovereign Tech-Wear Parka',
    description: 'Water-repellent technical fabric with carbon-fiber accents. Designed for the nomadic billionaire of the hyper-bitcoinized age.',
    price_btc: 0.0085,
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1000',
    stock: 20,
    category: 'Avant-Garde'
  },
  {
    id: '4',
    name: 'Halving Edition Cashmere Hoodie',
    description: 'Unrivaled softness. Loro Piana cashmere blend with "21,000,000" embroidered in high-density orange silk thread.',
    price_btc: 0.0032,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1000',
    stock: 40,
    category: 'Essentials'
  },
  {
    id: '5',
    name: 'Block 0 Leather Chelsea Boots',
    description: 'Hand-burnished calfskin leather with a discrete orange sole-plate. The foundation of a sovereign wardrobe.',
    price_btc: 0.0068,
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=1000',
    stock: 15,
    category: 'Footwear'
  },
  {
    id: '6',
    name: 'Cipher Silk Scarf',
    description: 'Intricate patterns depicting the SHA-256 algorithm. A masterwork of cryptographic art wearable in any environment.',
    price_btc: 0.0018,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000',
    stock: 30,
    category: 'Accessories'
  }
];
