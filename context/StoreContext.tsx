
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, WalletInfo, OrderStatus } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wallet: WalletInfo | null;
  orders: Order[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  connectWallet: (wallet: WalletInfo) => void;
  disconnectWallet: () => void;
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, hash?: string) => void;
  setProducts: (products: Product[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cryptox_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cryptox_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallet, setWallet] = useState<WalletInfo | null>(() => {
    const saved = localStorage.getItem('cryptox_wallet');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cryptox_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cryptox_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cryptox_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cryptox_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('cryptox_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const connectWallet = useCallback((info: WalletInfo) => setWallet(info), []);
  const disconnectWallet = useCallback(() => setWallet(null), []);

  const createOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, hash?: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status, transaction_hash: hash || order.transaction_hash } : order
    ));
  }, []);

  const setProducts = useCallback((newProducts: Product[]) => {
    setProductsState(newProducts);
  }, []);

  return (
    <StoreContext.Provider value={{
      products, cart, wallet, orders,
      addToCart, removeFromCart, updateQuantity, clearCart,
      connectWallet, disconnectWallet, createOrder, updateOrderStatus,
      setProducts
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
