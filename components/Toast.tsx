
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const icons = {
        success: <CheckCircle2 size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const styles = {
        success: 'bg-green-500/10 border-green-500/30 text-green-500',
        error: 'bg-red-500/10 border-red-500/30 text-red-500',
        info: 'bg-primary/10 border-primary/30 text-primary'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`glass-premium ${styles[toast.type]} border px-6 py-4 rounded-[24px] shadow-2xl flex items-center space-x-4 min-w-[300px] max-w-md backdrop-blur-xl`}
        >
            <div className="shrink-0">
                {icons[toast.type]}
            </div>
            <p className="text-sm font-bold text-white flex-grow">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-white/40 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-24 right-6 z-[150] flex flex-col space-y-3">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
