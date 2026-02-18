import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Info, CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: ToastMessage, onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const config = {
        info: { icon: Info, color: 'bg-blue-600 border-blue-400', text: 'text-white' },
        success: { icon: CheckCircle2, color: 'bg-green-600 border-green-400', text: 'text-white' },
        warning: { icon: AlertCircle, color: 'bg-amber-500 border-amber-300', text: 'text-gray-900' },
        error: { icon: XCircle, color: 'bg-red-600 border-red-400', text: 'text-white' },
    }[toast.type];

    const Icon = config.icon;

    return (
        <div className={`${config.color} border p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-10 fade-in duration-300`}>
            <Icon className={`w-5 h-5 shrink-0 ${config.text}`} />
            <p className={`text-sm font-bold leading-tight flex-1 ${config.text}`}>{toast.message}</p>
            <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X className={`w-4 h-4 ${config.text}`} />
            </button>
        </div>
    );
};
