'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export function PwaInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkDismissed = () => localStorage.getItem('pwa_banner_dismissed') === 'true';

        // Initial check
        if (checkDismissed()) {
            setIsVisible(false);
            return;
        }

        const handler = (e: any) => {
            // Check again inside handler in case it was dismissed in another tab
            if (checkDismissed()) return;

            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-20 left-4 right-4 z-[40] animate-in slide-in-from-top-full duration-500">
            <div className="bg-white dark:bg-zinc-900 border-2 border-amber-100 dark:border-amber-900/30 rounded-[2rem] p-6 shadow-2xl flex items-center gap-4 relative overflow-hidden">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl relative z-10">
                    <Smartphone size={24} />
                </div>

                <div className="flex-1 relative z-10">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1">App installieren</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Installiere Nachbarschafts Helden auf deinem Homescreen für den schnellen Zugriff.</p>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
                    >
                        <Download size={14} />
                        Installieren
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-gray-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -m-8 opacity-[0.03] rotate-12">
                    <Smartphone size={120} />
                </div>
            </div>
        </div>
    );
}
