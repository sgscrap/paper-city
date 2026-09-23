'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface CoalitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'info' | 'error';
}

const emptySubscribe = () => () => { };
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const CoalitionModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'CONFIRM',
    cancelText = 'CANCEL',
    type = 'info'
}: CoalitionModalProps) => {
    const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Header Glow */}
                <div className={`h-1 w-full ${type === 'warning' ? 'bg-amber-500' :
                    type === 'error' ? 'bg-red-500' : 'bg-neon-blue'
                    }`} />

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        {type === 'warning' && (
                            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                                ⚠️
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase italic">
                            {title}
                        </h2>
                    </div>

                    <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-6 rounded border border-zinc-800 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all font-mono text-xs uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-6 rounded font-bold text-black font-mono text-xs uppercase tracking-widest transition-all shadow-lg ${type === 'warning' ? 'bg-amber-500 hover:bg-amber-400' :
                                type === 'error' ? 'bg-red-500 hover:bg-red-400' :
                                    'bg-neon-blue hover:bg-cyan-400'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                {/* Footer UI Pattern */}
                <div className="h-4 bg-zinc-900/50 flex items-center px-4 gap-1">
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                </div>
            </div>
        </div>,
        document.body
    );
};
