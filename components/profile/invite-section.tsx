'use client';
import { Copy, Gift, Coins } from 'lucide-react';
import { useState } from 'react';

interface InviteSectionProps {
    referralCode: string;
    creditsCents: number;
}

export function InviteSection({ referralCode, creditsCents }: InviteSectionProps) {
    const [copied, setCopied] = useState(false);
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Freunde werben</h3>
                        <p className="text-indigo-100 text-sm">Verdiene Credits für jede Empfehlung!</p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/10">
                    <h4 className="text-sm font-semibold text-indigo-100 mb-2 flex items-center gap-2">
                        <Coins size={16} /> Dein Guthaben
                    </h4>
                    <p className="text-3xl font-black">
                        {(creditsCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-indigo-100 uppercase tracking-wider ml-1">Dein Einladungs-Link</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-mono truncate">
                            {referralLink}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="bg-white text-indigo-600 px-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                        >
                            <Copy size={16} />
                            {copied ? 'Kopiert!' : 'Kopieren'}
                        </button>
                    </div>
                    <p className="text-[10px] text-indigo-200 ml-1 mt-2">
                        Teile diesen Link mit deinen Nachbarn. Sobald sich jemand registriert, erhältst du 1,00 € Gutschrift.
                    </p>
                </div>
            </div>
        </div>
    );
}
