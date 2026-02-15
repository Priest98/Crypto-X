
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, WalletInfo, OrderStatus, Network } from '../types';
import { INITIAL_PRODUCTS, NETWORK_CONFIG } from '../constants';
import { Toast, ToastType } from '../components/Toast';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wallet: WalletInfo | null;
  orders: Order[];
  toasts: Toast[];
  btcPrice: number;
  network: Network;
  setNetwork: (network: Network) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  connectWallet: (wallet: WalletInfo) => void;
  disconnectWallet: () => void;
  resetApp: () => void;
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, hash?: string) => void;
  setProducts: (products: Product[]) => void;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (isOpen: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cryptox_products_v3');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cryptox_cart_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallet, setWallet] = useState<WalletInfo | null>(() => {
    const saved = localStorage.getItem('cryptox_wallet');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cryptox_orders_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [network, setNetwork] = useState<Network>(() => {
    const saved = localStorage.getItem('cryptox_network');
    return (saved as Network) || 'testnet4';
  });
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        // Fallback price if API fails
        setBtcPrice(98000);
      }
    };

    fetchBtcPrice();
    // Refresh every 5 minutes
    const interval = setInterval(fetchBtcPrice, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('cryptox_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cryptox_cart_v3', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cryptox_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('cryptox_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cryptox_network', network);
    if (wallet) {
      fetchBalance();
    }
  }, [network, wallet?.address]); // Re-fetch on network or address change

  const fetchBalance = async () => {
    if (!wallet) return;
    try {
      const apiBase = NETWORK_CONFIG[network]?.mempoolApi || NETWORK_CONFIG['testnet'].mempoolApi;
      const response = await fetch(`${apiBase}/address/${wallet.address}`);
      if (!response.ok) throw new Error('Failed to fetch balance');

      const data = await response.json();
      // Mempool API returns { chain_stats: { funded_txo_sum, spent_txo_sum }, mempool_stats: { ... } }
      const confirmed = (data.chain_stats.funded_txo_sum || 0) - (data.chain_stats.spent_txo_sum || 0);
      const unconfirmed = (data.mempool_stats.funded_txo_sum || 0) - (data.mempool_stats.spent_txo_sum || 0);
      const totalBalance = confirmed + unconfirmed;

      setWallet(prev => prev ? { ...prev, balance: totalBalance } : null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Don't clear wallet, just log error
    }
  };

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart`, 'success');
  }, [showToast]);

  const removeFromCart = useCallback((productId: string) => {
    const item = cart.find(i => i.id === productId);
    setCart(prev => prev.filter(item => item.id !== productId));
    if (item) {
      showToast(`${item.name} removed from cart`, 'info');
    }
  }, [cart, showToast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const connectWallet = useCallback((info: WalletInfo) => setWallet(info), []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    localStorage.removeItem('cryptox_wallet');
    // Also disconnect Midl client state
    import('../lib/midlClient').then(({ midlClient }) => midlClient.disconnect());
  }, []);

  const resetApp = useCallback(() => {
    setWallet(null);
    setCart([]);
    setOrders([]);
    // Clear all storage
    localStorage.removeItem('cryptox_wallet');
    localStorage.removeItem('cryptox_cart');
    localStorage.removeItem('cryptox_orders');
    localStorage.removeItem('cryptox_products');

    import('../lib/midlClient').then(({ midlClient }) => midlClient.disconnect());
    showToast('App state has been reset', 'info');
  }, [showToast]);

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
      products, cart, wallet, orders, toasts, btcPrice, network, setNetwork,
      addToCart, removeFromCart, updateQuantity, clearCart,
      connectWallet, disconnectWallet, resetApp, createOrder, updateOrderStatus,
      setProducts, showToast, dismissToast,
      isWalletModalOpen, setWalletModalOpen
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
