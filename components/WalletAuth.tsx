import React, { useState } from 'react';
import { midlClient } from '../lib/midlClient';
import { useStore } from '../context/StoreContext';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

interface WalletAuthProps {
    onAuthenticated: (signature: string) => void;
}

const WalletAuth: React.FC<WalletAuthProps> = ({ onAuthenticated }) => {
    const { wallet } = useStore();
    const [isSigning, setIsSigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSign = async () => {
        if (!wallet) return;
        setIsSigning(true);
        setError(null);

        try {
            const message = `Authenticate ownership of wallet ${wallet.address} for Midl Regtest Payment at ${new Date().toISOString()}`;
            const signature = await midlClient.signMessage(message, wallet.type as 'Xverse' | 'UniSat');
            onAuthenticated(signature);
        } catch (err: any) {
            console.error("Signing failed:", err);
            setError("Failed to sign message. Please try again.");
        } finally {
            setIsSigning(false);
        }
    };

    return (
        <div className="glass-ios p-8 rounded-[40px] text-center max-w-md mx-auto animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-primary" />
            </div>

            <h3 className="text-2xl font-black mb-2">Verify Identity</h3>
            <p className="text-gray-500 mb-8 text-sm">Sign a secure message to authenticate your wallet ownership before processing payment.</p>

            {error && (
                <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold">
                    {error}
                </div>
            )}

            <button
                onClick={handleSign}
                disabled={isSigning}
                className="w-full py-4 bg-white text-black rounded-[24px] font-black text-lg hover:bg-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {isSigning ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Requesting Signature...</span>
                    </>
                ) : (
                    <>
                        <Lock size={20} />
                        <span>Sign to Authenticate</span>
                    </>
                )}
            </button>

            <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest font-black">
                Off-chain Signature • Zero Gas Fee
            </p>
        </div>
    );
};

export default WalletAuth;
