'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Bestätigen',
    cancelLabel = 'Abbrechen',
    variant = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || !isOpen) return null;

    const variantStyles = {
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20',
        warning: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
        info: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-900/20'
    };

    const iconStyles = {
        danger: 'text-red-600 bg-red-50 dark:bg-red-900/20',
        warning: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
        info: 'text-gray-600 bg-gray-50 dark:bg-gray-800'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 flex flex-col items-center text-center p-8">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 ${iconStyles[variant]}`}>
                    <AlertTriangle size={32} />
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                    {title}
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 px-4">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-800"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-4 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${variantStyles[variant]} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
