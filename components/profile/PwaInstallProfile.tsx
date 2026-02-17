'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';

export function PwaInstallProfile() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="mt-10 pt-10 border-t border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white mb-6">App installieren</h3>
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-white dark:bg-zinc-800 text-gray-400 rounded-2xl shadow-sm">
                    <Smartphone size={32} />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 md:mb-0">
                        Nutze die Browser-Menü-Option um Nachbarschafts-Helden zum Startbildschirm hinzuzufügen für ein besseres Erlebnis.
                    </p>
                </div>

                <button
                    onClick={handleInstallClick}
                    className="w-full md:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Installieren
                </button>
            </div>
        </div>
    );
}
