import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in NCLEX Simulator:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-6 border border-red-100">
                        <div className="inline-flex p-4 bg-red-50 rounded-full">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">System Diagnostic Error</h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            We encountered an unhandled exception in the simulation engine. Your progress has been logged for forensic analysis.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                        >
                            <RefreshCcw className="w-5 h-5" /> Reload Laboratory
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
