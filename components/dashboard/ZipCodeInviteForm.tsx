'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { sendInvitationAction } from '@/app/actions';

export function ZipCodeInviteForm({ zipCode, onClose }: { zipCode: string, onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const result = await sendInvitationAction(email);

        if (result.success) {
            setStatus('success');
            setMessage(`Einladung erfolgreich an ${email} gesendet!`);
            setEmail('');
        } else {
            setStatus('error');
            setMessage(result.error || 'Fehler beim Senden.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner">
                        <Mail size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Nachbar einladen</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Wir schicken deinem Nachbarn eine hochwertige Einladung für <strong>{zipCode}</strong> in deinem Namen.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-1">
                            E-Mail Adresse des Nachbarn
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nachbar@beispiel.de"
                            className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 border-0 rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-900 dark:text-white"
                        />
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                            <CheckCircle2 size={18} />
                            {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:transform-none"
                    >
                        {status === 'loading' ? <Loader2 size={20} className="animate-spin" /> : 'Einladung jetzt senden'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                        Abbrechen
                    </button>
                </form>
            </div>
        </div>
    );
}
