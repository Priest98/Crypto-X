
import { WalletInfo } from '../types';

declare global {
  interface Window {
    unisat: any;
    XverseProviders?: any;
  }
}

export const isXverseInstalled = (): boolean => {
  return typeof window.XverseProviders !== 'undefined' || !!(window as any).BitcoinProvider;
};

export const connectXverse = async (): Promise<WalletInfo> => {
  console.log('Initiating Xverse handshake...');
  
  if (!isXverseInstalled()) {
    throw new Error('XVERSE_NOT_INSTALLED');
  }

  // Simulating the sats-connect getAddress flow
  // In production: import { getAddress } from 'sats-connect';
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    address: 'bc1q' + Math.random().toString(36).substring(2, 15),
    paymentAddress: 'bc1q' + Math.random().toString(36).substring(2, 15),
    ordinalsAddress: 'bc1p' + Math.random().toString(36).substring(2, 15),
    type: 'Xverse'
  };
};

export const connectUniSat = async (): Promise<WalletInfo> => {
  if (typeof window.unisat !== 'undefined') {
    try {
      const accounts = await window.unisat.requestAccounts();
      return {
        address: accounts[0],
        type: 'UniSat'
      };
    } catch (e) {
      console.error('UniSat connection failed', e);
      throw e;
    }
  } else {
    // Mock UniSat for demo if not installed
    console.log('UniSat not found, simulating connection...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      address: 'bc1p' + Math.random().toString(36).substring(2, 15),
      type: 'UniSat'
    };
  }
};
