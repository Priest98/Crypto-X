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
  network: Network
): Promise<string> => {
  if (!isMidlReady()) {
    throw new Error('MIDL SDK not initialized');
  }

  try {
    console.log('Preparing Midl Transaction...');

    // 1. Prepare Transaction via Midl
    const txTemplate = await midlClient.prepareTransaction({
      recipient,
      amount,
      network
    });

    // 2. Request Wallet Signature
    console.log('Requesting Signature...');
    const signedTx = await midlClient.signTransaction(txTemplate);

    // 3. Broadcast via Midl
    console.log('Broadcasting via Midl...');
    const txid = await midlClient.broadcastTransaction(signedTx);

    return txid;
  } catch (error: any) {
    console.error('Midl Payment Execution Error:', error);
    throw error;
  }
};
