
export type WalletType = 'Xverse' | 'UniSat';

export type ConnectionStatus = 'idle' | 'hover' | 'connecting' | 'connected' | 'error';

export type Network = 'mainnet' | 'testnet' | 'testnet4' | 'signet' | 'regtest';

export interface WalletInfo {
  address: string;
  paymentAddress?: string;
  ordinalsAddress?: string;
  type: WalletType;
  publicKey?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price_btc: number;
  image: string;
  stock: number;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export interface Order {
  id: string;
  wallet_address: string;
  items: CartItem[];
  total_btc: number;
  status: OrderStatus;
  transaction_hash?: string;
  created_at: string;
}

export interface AppState {
  wallet: WalletInfo | null;
  cart: CartItem[];
  orders: Order[];
  products: Product[];
}
