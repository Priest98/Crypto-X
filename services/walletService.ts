import { midlClient, isMidlReady } from '../lib/midlClient';
import { WalletInfo, Network } from '../types';

export const connectWallet = async (type: 'Xverse' | 'UniSat', network: Network): Promise<WalletInfo> => {
  if (!isMidlReady()) {
    throw new Error('MIDL SDK not initialized');
  }

  try {
    console.log(`Connecting ${type} via Midl SDK...`);
    // Hypothetical Midl SDK connect method
    const walletData = await midlClient.connectWallet({
      wallet: type,
      network: network
    });

    return {
      address: walletData.address,
      paymentAddress: walletData.paymentAddress || walletData.address,
      ordinalsAddress: walletData.ordinalsAddress || walletData.address,
      type: type,
      publicKey: walletData.publicKey
    };
  } catch (error: any) {
    console.error('Midl Wallet Connection Error:', error);
    throw error;
  }
};

export const executeBitcoinPayment = async (
  amount: number,
  recipient: string,
  network: Network,
  walletType?: 'Xverse' | 'UniSat',
  senderAddress?: string
): Promise<string> => {
  if (!isMidlReady()) {
    throw new Error('MIDL SDK not initialized');
  }

  try {
    console.log('Preparing Midl Transaction...');

    // 1. Prepare Transaction via Midl
    // passing walletType to ensure robustness across reloads
    const txid = await midlClient.executeBitcoinPayment(amount, recipient, network, walletType, senderAddress);

    return txid;

    // 2. Request Wallet Signature & Broadcast handled by unified executeBitcoinPayment
    console.log('Transaction executed via Midl:', txid);

    return txid;
  } catch (error: any) {
    console.error('Midl Payment Execution Error:', error);
    throw error;
  }
};
