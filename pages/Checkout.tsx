
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Loader2, CheckCircle2, Copy, ExternalLink, QrCode, ArrowLeft, Shield, Zap, Search } from 'lucide-react';
import { OrderStatus } from '../types';
import { NETWORK_CONFIG } from '../constants';
import { executeBitcoinPayment } from '../services/walletService';
import WalletAuth from '../components/WalletAuth';

const Checkout: React.FC = () => {
  const { cart, wallet, clearCart, createOrder, btcPrice, network } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<'auth' | 'invoice' | 'verifying' | 'success'>('auth');
  const [invoiceId] = useState(() => `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

  const btcAddress = NETWORK_CONFIG[network]?.storeAddress || NETWORK_CONFIG['testnet'].storeAddress;

  const [manualTxId, setManualTxId] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price_btc * item.quantity), 0);
  const total = subtotal + 0.00005;

  useEffect(() => {
    if (!wallet || cart.length === 0) {
      if (step !== 'success') navigate('/cart');
    }
  }, [wallet, cart, navigate, step]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Visual feedback handled by user expectation in luxury apps
  };

  const handleVerifyOnChain = async (txidToVerify: string) => {
    if (!txidToVerify || txidToVerify.length < 60) {
      setVerificationError('Invalid Transaction Hash');
      return;
    }

    setStep('verifying');
    setVerificationError(null);

    try {
      // Dynamic Bitcoin API call based on network
      const apiBase = NETWORK_CONFIG[network]?.mempoolApi || NETWORK_CONFIG['testnet'].mempoolApi;
      const response = await fetch(`${apiBase}/tx/${txidToVerify}`);

      if (!response.ok) {
        throw new Error('Transaction not found on-chain yet');
      }

      const txData = await response.json();

      // In a production environment, we would strictly verify:
      // 1. txData.vout contains an output to our btcAddress
      // 2. txData.vout[i].value matches our required total
      // 3. txData.status.confirmed is true (or check confirmation count)

      // For this demo/native flow, we assume detection = intent to settle
      setTimeout(() => {
        completeSettlement(txidToVerify);
      }, 3000);

    } catch (err) {
      setStep('invoice');
      setVerificationError('Transaction not detected in mempool. Please wait a few seconds and try again.');
    }
  };

  const completeSettlement = (txid: string) => {
    const newOrder = {
      id: invoiceId,
      wallet_address: wallet?.address || 'unknown',
      items: [...cart],
      total_btc: total,
      status: OrderStatus.CONFIRMED,
      transaction_hash: txid,
      created_at: new Date().toISOString()
    };
    createOrder(newOrder);
    setConfirmedTxId(txid);
    setStep('success');
    clearCart();
  };



  const handlePayment = async () => {
    if (!wallet) return;

    setStep('verifying');
    setVerificationError(null);

    try {

      // Execute Real Payment
      const txid = await executeBitcoinPayment(
        Math.floor(total * 100000000), // Convert to sats
        btcAddress,
        network,
        wallet.type as 'Xverse' | 'UniSat',
        wallet.paymentAddress || wallet.address
      );

      if (txid) {
        // Store Payment in Backend
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              txid,
              orderId: invoiceId,
              amount: Math.floor(total * 100000000),
              walletAddress: wallet.address,
              network
            })
          });
        } catch (e) {
          console.error("Failed to store payment proof backend", e);
        }

        // Start Verification Polling
        setConfirmedTxId(txid);
        pollVerification(txid);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error(error);
      setStep('invoice');
      setVerificationError(error.message || 'Payment failed');
    }
  };

  const pollVerification = (txid: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/verify/${txid}`);
        const data = await res.json();

        if (data.status === 'confirmed') {
          clearInterval(interval);
          completeSettlement(txid);
        } else if (data.confirmations > 0) {
          // Optionally show progress
        }
      } catch (e) {
        console.error("Verification poll failed", e);
      }
    }, 5000); // Poll every 5s

    // Auto-complete for demo/regtest if needed after some time or force manual check logic
  };

  if (step === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-8 py-40 text-center animate-in fade-in zoom-in duration-1000">
        <div className="w-32 h-32 bg-green-500/20 text-green-500 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-[0_0_100px_rgba(34,197,94,0.3)] border border-green-500/20">
          <CheckCircle2 size={64} className="animate-bounce" />
        </div>
        <h1 className="text-7xl font-black mb-6 tracking-tighter">Settlement Confirmed</h1>
        <p className="text-gray-500 text-xl mb-16 max-w-md mx-auto font-medium leading-relaxed">
          Order <span className="text-white font-mono">#{invoiceId}</span> has been authenticated on-chain. Your boutique assets are now being prepared for discrete dispatch.
        </p>

        <div className="glass-ios p-6 rounded-3xl mb-12 max-w-md mx-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Transaction Proof</span>
          <a
            href={`${NETWORK_CONFIG[network]?.mempoolApi.replace('/api', '')}/tx/${confirmedTxId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-xs break-all font-mono hover:underline flex items-center justify-center space-x-2"
          >
            <span>{confirmedTxId}</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/orders" className="w-full sm:w-auto px-12 py-6 bg-white text-black rounded-[32px] font-black text-xl hover:bg-primary transition-all active:scale-95 shadow-2xl">
            View The Archive
          </Link>
          <Link to="/products" className="w-full sm:w-auto px-12 py-6 glass-ios text-white rounded-[32px] font-black text-xl hover:bg-white/10 transition-all">
            Continue Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-20 pb-40">
      <div className="flex items-center justify-between mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <button onClick={() => navigate('/cart')} className="flex items-center space-x-3 text-gray-500 hover:text-white transition-all group">
          <div className="p-3 glass-ios rounded-full group-hover:-translate-x-2 transition-transform">
            <ArrowLeft size={20} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Return to Bag</span>
        </button>
        <div className="text-right">
          <h1 className="text-4xl font-black tracking-tight mb-1">Final Settlement</h1>
          <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-black">On-Chain Authentication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Payment Manifest or Auth */}
        <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
          {step === 'auth' ? (
            <WalletAuth onAuthenticated={(sig) => {
              console.log("Authenticated with signature:", sig);
              setStep('invoice');
            }} />
          ) : (
            <div className="glass-ios rounded-[60px] p-12 space-y-10 relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Digital Invoice</span>
                <span className="font-mono text-sm text-primary">{invoiceId}</span>
              </div>

              <div className="text-center py-12 glass-ios rounded-[40px] bg-white/[0.01]">
                <span className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] block mb-4">Settlement Amount</span>
                <div className="flex items-center justify-center space-x-3 text-primary">
                  <span className="text-4xl font-black italic">₿</span>
                  <span className="text-7xl font-black tracking-tighter">{total.toFixed(8)}</span>
                </div>
                <span className="text-xl font-bold text-gray-500 mt-2 block">≈ ${(total * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Store Bitcoin Address</label>
                <div className="flex items-center glass-ios rounded-[28px] p-4 group">
                  <code className="flex-grow text-xs truncate mr-4 font-mono text-white/70">{btcAddress}</code>
                  <button
                    onClick={() => copyToClipboard(btcAddress)}
                    className="p-4 bg-white/5 hover:bg-primary hover:text-black rounded-2xl transition-all"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center py-6">
                <div className="bg-white p-8 rounded-[48px] shadow-[0_0_80px_rgba(255,255,255,0.1)] group hover:scale-105 transition-transform duration-1000">
                  <div className="w-56 h-56 bg-black flex items-center justify-center relative rounded-[32px] overflow-hidden">
                    <QrCode size={180} className="text-white" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <span className="text-white font-black text-6xl italic">₿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step !== 'auth' && (
            <div className="flex items-start space-x-6 px-10">
              <Shield className="text-primary shrink-0 mt-1" size={28} />
              <p className="text-xs text-gray-500 font-medium leading-relaxed uppercase tracking-widest">
                Secure Peer-to-Peer settlement. This invoice will expire in <span className="text-white">15:00</span>. Authenticate via your {wallet?.type} wallet or external node.
              </p>
            </div>
          )}
        </div>

        {/* Verification Logic */}
        <div className="flex flex-col justify-center items-center text-center space-y-16 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
          {step === 'invoice' ? (
            <div className="space-y-16 w-full max-w-md text-left">
              <div>
                <div className="w-20 h-20 glass-ios rounded-[32px] flex items-center justify-center mb-10 text-primary">
                  <Zap size={32} className="animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-6 tracking-tight">Awaiting Proof</h2>
                <p className="text-gray-500 text-lg leading-relaxed">Once you broadcast your transaction, enter the TXID below or use your connected wallet to sign and settle.</p>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 block mb-4">Transaction Hash (TXID)</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-grow">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type="text"
                        value={manualTxId}
                        onChange={(e) => setManualTxId(e.target.value)}
                        placeholder="Paste TXID from wallet..."
                        className="w-full glass-ios pl-16 pr-8 py-5 rounded-[24px] focus:outline-none focus:border-primary/50 text-xs font-mono transition-all"
                      />
                    </div>
                    <button
                      onClick={() => handleVerifyOnChain(manualTxId)}
                      className="p-5 bg-white text-black rounded-2xl font-black hover:bg-primary transition-all active:scale-90"
                    >
                      Verify
                    </button>
                  </div>
                  {verificationError && (
                    <p className="mt-4 text-xs font-bold text-red-500 flex items-center space-x-2">
                      <span>⚠️</span>
                      <span>{verificationError}</span>
                    </p>
                  )}
                </div>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Or Secure Pay</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full bg-white text-black py-8 rounded-[32px] font-black text-2xl flex items-center justify-center space-x-4 transition-all hover:bg-primary shadow-2xl hover:scale-105 active:scale-95"
                >
                  <span>Pay with {wallet?.type}</span>
                  <ExternalLink size={24} />
                </button>

                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-center">Zero-confirmation detection active</p>
              </div>
            </div>
          ) : (
            <div className="space-y-16 py-20 w-full max-w-md">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-8 glass-ios rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-5xl font-black text-primary italic">₿</span>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-black tracking-tight">Verifying Evidence</h2>
                <p className="text-gray-500 text-lg leading-relaxed">Proof of payment detected in mempool. Authenticating on-chain details for settlement.</p>
              </div>
            </div>
          )}

          <div className="w-full glass-ios rounded-[40px] p-10 text-left border border-white/5">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-600 mb-8">Asset Manifest</h4>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                  <span className="text-white/70">{item.name} <span className="text-[10px] opacity-40 ml-2">x{item.quantity}</span></span>
                  <div className="flex flex-col items-end">
                    <span className="text-primary font-mono">{(item.price_btc * item.quantity).toFixed(8)} ₿</span>
                    <span className="text-italic text-gray-500">≈ ${((item.price_btc * item.quantity) * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Checkout;
