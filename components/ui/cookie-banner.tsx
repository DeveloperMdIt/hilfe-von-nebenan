
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookieConsent', 'all');
        setShowBanner(false);
    };

    const acceptEssential = () => {
        localStorage.setItem('cookieConsent', 'essential');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-zinc-900 p-2 shadow-lg sm:p-3 ring-1 ring-white/10">
                    <div className="flex flex-wrap items-center justify-between">
                        <div className="flex w-0 flex-1 items-center">
                            <span className="flex rounded-lg bg-amber-600 p-2">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                </svg>
                            </span>
                            <p className="ml-3 truncate font-medium text-white">
                                <span className="md:hidden">Wir nutzen Cookies.</span>
                                <span className="hidden md:inline">Wir nutzen Cookies für die beste Erfahrung auf unserer Webseite.</span>
                                <Link href="/datenschutz" className="ml-1 underline">Mehr Infos</Link>
                            </p>
                        </div>
                        <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto flex gap-2">
                            <button
                                onClick={acceptEssential}
                                className="flex items-center justify-center rounded-md border border-transparent bg-zinc-700 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                            >
                                Nur Essenzielle
                            </button>
                            <button
                                onClick={acceptAll}
                                className="flex items-center justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                            >
                                Alle akzeptieren
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
