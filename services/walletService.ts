import { getAddress, sendBtcTransaction, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { WalletInfo, Network } from '../types';

declare global {
  interface Window {
    unisat: any;
  }
}

export const isXverseInstalled = (): boolean => {
  return typeof (window as any).XverseProviders !== 'undefined' || !!(window as any).BitcoinProvider;
};

export const connectXverse = async (network: Network): Promise<WalletInfo> => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Initiating Xverse connection (${network})...`);

      // Map Network to BitcoinNetworkType
      let btcNetwork = BitcoinNetworkType.Testnet;
      if (network === 'mainnet') {
        btcNetwork = BitcoinNetworkType.Mainnet;
      } else if (network === 'signet') {
        btcNetwork = 'Signet' as any;
      } else if (network === 'testnet4') {
        btcNetwork = BitcoinNetworkType.Testnet;
      } else if (network === 'regtest') {
        btcNetwork = 'Regtest' as any;
      }

      // If the user wants specific Testnet4/Signet/Regtest, Xverse might strictly separate them.
      // But commonly Testnet covers Testnet3/4. 

      getAddress({
        payload: {
          purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
          message: `Connect to VELENCIA (${network === 'mainnet' ? 'Mainnet' : 'Testnet'})`,
          network: {
            type: btcNetwork
          },
        },
        onFinish: (res) => {
          console.log('Xverse connection success:', res);
          const paymentAddr = res.addresses.find((addr) => addr.purpose === 'payment');
          const ordinalsAddr = res.addresses.find((addr) => addr.purpose === 'ordinals');

          if (paymentAddr && ordinalsAddr) {
            resolve({
              address: paymentAddr.address,
              paymentAddress: paymentAddr.address,
              ordinalsAddress: ordinalsAddr.address,
              type: 'Xverse'
            });
          } else {
            console.error('Missing required addresses in Xverse response');
            reject(new Error("Missing required addresses"));
          }
        },
        onCancel: () => {
          console.log('Xverse connection cancelled by user');
          reject(new Error("USER_CANCELLED"));
        },
      });
    } catch (error: any) {
      console.error('Xverse connection error:', error);
      if (error.message.includes('No Bitcoin wallet installed') || !isXverseInstalled()) {
        reject(new Error("XVERSE_NOT_INSTALLED"));
      } else {
        reject(error);
      }
    }
  });
};

export const connectUniSat = async (network: Network): Promise<WalletInfo> => {
  // Retry mechanism for UniSat injection
  let attempts = 0;
  while (typeof window.unisat === 'undefined' && attempts < 10) {
    await new Promise(r => setTimeout(r, 100)); // Wait 100ms
    attempts++;
  }

  if (typeof window.unisat !== 'undefined') {
    try {
      const accounts = await window.unisat.requestAccounts();
      if (accounts.length > 0) {
        // Switch Network
        try {
          const currentNetwork = await window.unisat.getNetwork();
          if (currentNetwork !== network) {
            await window.unisat.switchNetwork(network);
          }
        } catch (err) {
          console.warn(`UniSat network switch to ${network} failed:`, err);
        }

        return {
          address: accounts[0],
          paymentAddress: accounts[0],
          type: 'UniSat'
        };
      }
    } catch (e: any) {
      console.error('UniSat connection error:', e);
      if (e.message.includes('User rejected')) {
        throw new Error("USER_CANCELLED");
      }
      throw e;
    }
  } else {
    throw new Error("UNISAT_NOT_INSTALLED");
  }
  throw new Error("Connection failed");
};

export const sendTransaction = async (
  walletType: 'Xverse' | 'UniSat',
  toAddress: string,
  amountSats: number,
  network: Network
): Promise<string | null> => {
  if (walletType === 'Xverse') {
    try {
      let txId: string | null = null;
      await sendBtcTransaction({
        payload: {
          network: {
            type: network === 'mainnet' ? BitcoinNetworkType.Mainnet : BitcoinNetworkType.Testnet,
          },
          recipients: [
            {
              address: toAddress,
              amountSats: BigInt(amountSats),
            },
          ],
          senderAddress: '', // Optional
        },
        onFinish: (response) => {
          txId = response;
        },
        onCancel: () => console.log('Transaction cancelled'),
      });
      return txId;
    } catch (error) {
      console.error("Xverse Send Error", error);
      return null;
    }
  } else if (walletType === 'UniSat') {
    try {
      const txid = await window.unisat.sendBitcoin(toAddress, amountSats);
      return txid;
    } catch (error) {
      console.error('UniSat Send Error:', error);
      return null;
    }
  }
  return null;
};
