
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, WalletInfo, OrderStatus, Network } from '../types';
import { INITIAL_PRODUCTS, NETWORK_CONFIG } from '../constants';
import { Toast, ToastType } from '../components/Toast';
import { useWalletBalance } from '../hooks/useWalletBalance';
import { useTransferBTC, useConnect, useDisconnect, useDefaultAccount } from '@midl/react';
import { AddressPurpose } from '@midl/core';
import { midlClient, suggestMidlNetwork } from '../lib/midlClient';
import { executeEVMAction } from '../lib/evmClient';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wallet: WalletInfo | null;
  orders: Order[];
  toasts: Toast[];
  btcPrice: number;
  network: Network;
  // Blockchain balance from MIDL SDK
  balance: number; // Balance in sats
  balanceBTC: number; // Balance in BTC
  balanceLoading: boolean;
  balanceError: any;
  refreshBalance: () => void;
  setNetwork: (network: Network) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  connectWallet: (wallet: WalletInfo) => void;
  // SDK Connection
  connect: (type: 'Xverse' | 'UniSat') => Promise<string | undefined>;
  disconnectWallet: () => void;
  resetApp: () => void;
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, hash?: string, evmHash?: string) => void;
  setProducts: (products: Product[]) => void;
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  isWalletModalOpen: boolean;
  setWalletModalOpen: (isOpen: boolean) => void;
  authenticateWallet: () => Promise<void>;
  processPayment: (amountSats: number, orderId: string) => Promise<{ txid: string; evmTxHash?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SDK Hooks
  const { connectAsync, connectors } = useConnect({
    purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals]
  });
  const { disconnect } = useDisconnect();
  const account = useDefaultAccount();
  // Note: useDefaultAccount returns Account or null. 

  // Use MIDL SDK balance hook (with safe error handling)
  const {
    balance,
    balanceBTC,
    isLoading: balanceLoading,
    error: balanceError,
    refresh: refreshBalance,
  } = useWalletBalance();

  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('velencia_products_v3');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('velencia_cart_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallet, setWallet] = useState<WalletInfo | null>(() => {
    const saved = localStorage.getItem('velencia_wallet');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('velencia_orders_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [network, setNetwork] = useState<Network>(() => {
    const saved = localStorage.getItem('velencia_network');
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
    localStorage.setItem('velencia_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('velencia_cart_v3', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('velencia_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('velencia_orders_v3', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('velencia_network', network);
    if (wallet) {
      fetchBalance();
    }
  }, [network, wallet?.address]); // Re-fetch on network or address change

  const fetchBalance = async () => {
    if (!wallet) return;
    try {
      // Use MIDL SDK for regtest network
      if (network === 'regtest') {
        console.log('[StoreContext] Fetching balance via MIDL SDK...');
        const { midl } = await import('../services/midlClient');
        const balance = await midl.getBalance(wallet.address);
        setWallet(prev => prev ? { ...prev, balance } : null);
        console.log('[StoreContext] Balance updated via SDK:', balance, 'sats');
        return;
      }

      // Fallback to mempool API for other networks
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

  const connect = useCallback(async (type: 'Xverse' | 'UniSat') => {
    // Find connector
    // ID for Xverse is usually 'xverse' or 'XverseWallet'
    console.log('Available connectors:', connectors);

    // ConnectorWithMetadata has .metadata.name
    const connector = connectors.find(c => c.metadata.name.toLowerCase().includes(type.toLowerCase()));

    if (!connector) {
      throw new Error(`Connector for ${type} not found`);
    }

    // Force Xverse to use our Regtest network
    if (type === 'Xverse') {
      try {
        await suggestMidlNetwork();
        // Wait a bit for Xverse to switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Network suggestion failed', e);
      }
    }

    try {
      const accounts = await connectAsync({ id: connector.id });
      return accounts[0]?.address;
    } catch (err) {
      console.error('Connection failed:', err);
      throw err;
    }
  }, [connectors, connectAsync]);

  // Sync SDK Account to Store Wallet State
  useEffect(() => {
    if (account && account.address) {
      setWallet({
        address: account.address,
        type: 'Xverse', // Defaulting to Xverse as SDK mostly supports it for now? Or derive from account?
        network: network, // Keep current network
        // account object might have more info
      });
    }
    // If account is null, we might want to disconnect? 
    // But let's leave valid wallet if SDK is just initializing?
    // No, if explicit disconnect happens, account becomes null.
  }, [account, network]);


  const disconnectWallet = useCallback(() => {
    setWallet(null);
    localStorage.removeItem('velencia_wallet');

    // Disconnect SDK
    disconnect();

    // Also disconnect Midl client state (legacy)
    import('../lib/midlClient').then(({ midlClient }) => midlClient.disconnect());
  }, [disconnect]);

  const resetApp = useCallback(() => {
    setWallet(null);
    setCart([]);
    setOrders([]);
    // Clear all storage
    localStorage.removeItem('velencia_wallet');
    localStorage.removeItem('velencia_cart');
    localStorage.removeItem('velencia_orders');
    localStorage.removeItem('velencia_products');

    import('../lib/midlClient').then(({ midlClient }) => midlClient.disconnect());
    showToast('App state has been reset', 'info');
  }, [showToast]);

  const createOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, hash?: string, evmHash?: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? {
        ...order,
        status,
        transaction_hash: hash || order.transaction_hash,
        evm_tx_hash: evmHash || order.evm_tx_hash
      } : order
    ));
  }, []);

  const authenticateWallet = useCallback(async () => {
    if (!wallet) {
      showToast('Please connect wallet first', 'error');
      return;
    }

    try {
      const { midlClient } = await import('../lib/midlClient');
      const message = `Login to Velencia: ${new Date().toISOString().split('T')[0]}`;
      const signature = await midlClient.signMessage(message, network, wallet.type, wallet.address);

      setWallet(prev => prev ? { ...prev, signature } : null);
      showToast('Authentication successful', 'success');
    } catch (error: any) {
      console.error('Auth error:', error);
      showToast(error.message || 'Authentication failed', 'error');
    }
  }, [wallet, network, showToast]);

  // MIDL SDK Transaction Hook
  const { transferBTCAsync } = useTransferBTC();

  const processPayment = useCallback(async (amountSats: number, orderId: string): Promise<{ txid: string; evmTxHash: string | null }> => {
    if (!wallet) throw new Error('Wallet not connected');

    // Use store address from config
    const recipient = NETWORK_CONFIG[network].storeAddress;

    showToast('Please sign transaction in wallet...', 'info');

    // Use SDK Hook
    console.log('[StoreContext] Sending transaction via SDK transferBTC...');
    let txid = '';

    try {
      console.log('[StoreContext] Starting transferBTCAsync with:', { recipient, amountSats });
      const txData = await transferBTCAsync({
        transfers: [
          {
            receiver: recipient,
            amount: amountSats
          }
        ],
        publish: false // We will broadcast manually to trace any hangs
      });

      console.log('[StoreContext] transferBTCAsync (Signed PSBT):', txData);

      const signedPsbtBase64 = (txData as any)?.psbt || (txData as any)?.psbtBase64 || txData;
      if (!signedPsbtBase64) throw new Error('No signed PSBT returned from wallet');

      // Finalize and Extract Hex
      console.log('[StoreContext] Finalizing and extracting hex...');
      const bitcoin = await import('bitcoinjs-lib');
      const psbt = bitcoin.Psbt.fromBase64(signedPsbtBase64);

      try {
        psbt.finalizeAllInputs();
        console.log('[StoreContext] PSBT finalized successfully');
      } catch (e) {
        console.warn('[StoreContext] Finalization warning (extension might have finalized):', e);
      }

      const signedTxHex = psbt.extractTransaction().toHex();
      console.log('[StoreContext] Extracted Hex:', signedTxHex.substring(0, 20) + '...');

      // Manual broadcast via our client shim
      console.log('[StoreContext] Broadcasting manually...');
      const { midl } = await import('../services/midlClient');
      txid = await midl.broadcastTransaction(signedTxHex);

      console.log('[StoreContext] Extracted TXID:', txid);

      // Force an immediate balance refresh
      setTimeout(() => {
        console.log('[StoreContext] Triggering balance refresh...');
        refreshBalance();
      }, 2000);

    } catch (sdkError: any) {
      console.error('[StoreContext] SDK Payment Failed:', sdkError);
      // If user cancelled or other error
      const errorMessage = sdkError?.message || String(sdkError);
      if (typeof errorMessage === 'string' && errorMessage.includes('User rejected')) {
        throw new Error('User cancelled transaction');
      }
      throw sdkError;
    }

    if (!txid) {
      throw new Error('Transaction failed: No TXID returned');
    }

    console.log('[StoreContext] SDK Transaction sent:', txid);

    // --- Start EVM Execution Layer ---
    let evmTxHash: string | null = null;
    try {
      console.log('[StoreContext] Triggering EVM Execution Layer...');
      // Static import used instead of dynamic to avoid "Failed to fetch" on Vercel
      evmTxHash = await executeEVMAction(txid, wallet.address, {
        orderId,
        items: cart.map(i => ({ id: i.id, q: i.quantity })),
        total: amountSats
      });
      console.log('[StoreContext] EVM Action triggered successfully. Hash:', evmTxHash);
    } catch (evmError) {
      console.error('[StoreContext] EVM Execution Layer CRASHED:', evmError);
      // Non-blocking: BTC flow continues
    }
    // --- End EVM Execution Layer ---
    // Continue with verification logic...

    showToast('Transaction broadcasted! Verifying...', 'success');

    // 2. Store Payment Proof
    try {
      await fetch('http://localhost:3001/api/payments/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txid,
          orderId,
          amount: amountSats,
          walletAddress: wallet.address,
          network,
          evmTxHash: evmTxHash || undefined
        })
      });
    } catch (e) {
      console.error('Failed to store payment proof:', e);
      // Continue anyway to verification
    }

    // 3. Poll for Verification
    const pollVerification = async () => {
      const maxRetries = 20;
      let attempts = 0;

      const check = async () => {
        if (attempts >= maxRetries) return;
        attempts++;

        try {
          const res = await fetch(`http://localhost:3001/api/payments/verify/${txid}`);
          const data = await res.json();

          if (data.status === 'confirmed' || data.confirmations > 0) {
            updateOrderStatus(orderId, 'confirmed' as any, txid);
            showToast('Payment Confirmed on Blockchain!', 'success');
          } else {
            setTimeout(check, 3000); // Check every 3s
          }
        } catch (e) {
          setTimeout(check, 3000);
        }
      };
      check();
    };

    pollVerification();

    return { txid, evmTxHash };
  }, [wallet, network, showToast, updateOrderStatus, cart, refreshBalance]);

  const setProducts = useCallback((newProducts: Product[]) => {
    setProductsState(newProducts);
  }, []);

  return (
    <StoreContext.Provider value={{
      products, cart, wallet, orders, toasts, btcPrice, network, setNetwork,
      // Blockchain balance from MIDL SDK
      balance: balance || 0,
      balanceBTC: balanceBTC || 0,
      balanceLoading,
      balanceError,
      refreshBalance,
      // Cart and wallet actions
      addToCart, removeFromCart, updateQuantity, clearCart,
      connectWallet, connect, disconnectWallet, resetApp, createOrder, updateOrderStatus,
      setProducts, showToast, dismissToast,
      isWalletModalOpen, setWalletModalOpen,
      authenticateWallet, processPayment
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

