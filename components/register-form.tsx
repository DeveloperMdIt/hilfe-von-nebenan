'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { registerUser } from '../app/actions';

export function RegisterForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const requirements = [
        { label: 'Mindestens 8 Zeichen', test: (val: string) => val.length >= 8 },
        { label: 'Ein Großbuchstabe', test: (val: string) => /[A-Z]/.test(val) },
        { label: 'Eine Zahl', test: (val: string) => /[0-9]/.test(val) },
        { label: 'Ein Sonderzeichen', test: (val: string) => /[^A-Za-z0-9]/.test(val) },
    ];

    const isAllMet = requirements.every(req => req.test(password));
    const isMatching = password === confirmPassword && confirmPassword !== '';

    async function handleSubmit(formData: FormData) {
        setError(null);
        if (!isAllMet) {
            setError('Passwort erfüllt nicht die Sicherheitsanforderungen.');
            return;
        }
        if (!isMatching) {
            setError('Passwörter stimmen nicht überein.');
            return;
        }

        startTransition(async () => {
            const res = await registerUser(formData);
            if (res?.error) {
                setError(res.error);
            }
        });
    }

    return (
        <form className="space-y-6" action={handleSubmit}>
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    <p className="font-bold">{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Vollständiger Name
                </label>
                <div className="mt-2">
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Max Mustermann"
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    E-Mail Adresse
                </label>
                <div className="mt-2">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="beispiel@mail.de"
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="zipCode" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Postleitzahl (PLZ)
                </label>
                <div className="mt-2">
                    <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        pattern="[0-9]{5}"
                        maxLength={5}
                        required
                        placeholder="10115"
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                        Passwort
                    </label>
                    <div className="mt-2 relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                        Passwort bestätigen
                    </label>
                    <div className="mt-2 relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`block w-full rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all ${isMatching ? 'border-green-500 bg-green-50/10' : 'border-gray-200 dark:border-zinc-800 dark:bg-zinc-900'}`}
                        />
                        {isMatching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                <CheckCircle2 size={18} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl space-y-2 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Sicherheits-Check</p>
                    {requirements.map((req, i) => {
                        const met = req.test(password);
                        return (
                            <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-green-600 dark:text-green-500 font-bold' : 'text-gray-400'}`}>
                                {met ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                {req.label}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-start">
                <div className="flex h-6 items-center">
                    <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        required
                        className="h-5 w-5 rounded-lg border-gray-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor="consent" className="font-medium text-gray-600 dark:text-gray-400">
                        Ich akzeptiere die <Link href="/agb" className="text-amber-600 font-bold hover:underline" target="_blank">AGB</Link> und <Link href="/datenschutz" className="text-amber-600 font-bold hover:underline" target="_blank">Datenschutz</Link>.
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending || !isAllMet || !isMatching}
                className="flex w-full justify-center rounded-2xl bg-amber-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-amber-600/20 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
            >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Jetzt registrieren'}
            </button>
        </form>
    );
}
