'use client';

import { HandHeart, Users, Share2, Mail } from 'lucide-react';
import { useState } from 'react';
import { ZipCodeInviteForm } from './ZipCodeInviteForm';

export default function ZipCodeWaitingView({
    zipCode,
    count,
    threshold,
    needed,
    userName
}: {
    zipCode: string;
    count: number;
    threshold: number;
    needed: number;
    userName: string;
}) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const progress = Math.min(100, (count / threshold) * 100);

    const handleShareLink = async () => {
        const shareData = {
            title: 'Hilfe von Nebenan',
            text: `Hilf uns, Hilfe von Nebenan in ${zipCode} zu starten! Wir brauchen noch ein paar Nachbarn.`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.origin);
                alert('Link in Zwischenablage kopiert!');
            }
        } catch (err) {
            console.error('Sharing failed', err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            {showInviteModal && (
                <ZipCodeInviteForm zipCode={zipCode} onClose={() => setShowInviteModal(false)} />
            )}

            <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                <Users size={40} />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                    Hallo {userName.split(' ')[0]},<br />
                    dein Viertel braucht dich! 🏡
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    In <span className="font-bold text-amber-600">{zipCode}</span> fehlen uns aktuell noch <span className="font-bold underline">{needed} Nachbarn</span>, um die Plattform in deinem Bereich freizuschalten.
                </p>
            </div>

            <div className="w-full bg-gray-100 dark:bg-zinc-900 h-4 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
                <div
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between w-full text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>{count} registriert</span>
                <span>Ziel: {threshold}</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-xl space-y-6 w-full">
                <h3 className="font-black text-xl flex items-center justify-center gap-2 text-gray-900 dark:text-white">
                    <HandHeart className="text-amber-500" />
                    Hilf mit, den Start zu beschleunigen!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                    Lade deine Freunde und Nachbarn aus <span className="text-amber-600">{zipCode}</span> ein. Sobald wir {threshold} verifizierte Personen sind, geht es los!
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleShareLink}
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-all transform hover:-translate-y-1 shadow-lg"
                    >
                        <Share2 size={18} />
                        Link teilen
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center justify-center gap-2 py-4 px-6 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-amber-600/20"
                    >
                        <Mail size={18} />
                        Einladen per Mail
                    </button>
                </div>
            </div>

            <p className="text-xs text-gray-400 italic">
                Wir informieren dich per E-Mail, sobald dein Bereich aktiv ist.
            </p>
        </div>
    );
}
