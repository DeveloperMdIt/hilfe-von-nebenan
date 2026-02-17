'use client';

import Link from 'next/link';
import Image from 'next/image';
import { loginUser, resendVerificationEmail } from '../actions';
import { HeartHandshake, Mail, Loader2, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useActionState, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(loginUser, null);
    const searchParams = useSearchParams();
    const [showResendModal, setShowResendModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resendMessage, setResendMessage] = useState('');
    const timeoutMsg = searchParams.get('reason') === 'timeout';

    // Update modal visibility when login error is 'unverified' or after registration
    useEffect(() => {
        if (state?.error === 'unverified' || searchParams.get('registered') === 'true') {
            setModalVisible(true);
        }
    }, [state, searchParams]);

    const handleResend = async () => {
        const email = state?.email || searchParams.get('email');
        if (!email) return;
        setResendStatus('loading');
        try {
            await resendVerificationEmail(email);
            setResendStatus('success');
            setResendMessage('Der Verifizierungs-Link wurde erneut an deine E-Mail-Adresse gesendet.');
        } catch (error: any) {
            setResendStatus('error');
            setResendMessage(error.message || 'Fehler beim Senden der Mail.');
        }
    };

    return (
        <div className="flex h-full overflow-hidden">
            {/* Verification Modal */}
            {(modalVisible || showResendModal) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="h-14 w-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500">
                                <Mail size={28} />
                            </div>
                            <button
                                onClick={() => {
                                    setModalVisible(false);
                                    setShowResendModal(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">E-Mail bestätigen</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {searchParams.get('registered') === 'true'
                                    ? "Registrierung erfolgreich! Damit du Nachbarschafts-Helden nutzen kannst, musst du erst deine E-Mail-Adresse bestätigen."
                                    : "Damit du Nachbarschafts-Helden nutzen kannst, musst du erst deine E-Mail-Adresse bestätigen."
                                } Wir haben dir einen Link an <span className="font-bold text-gray-900 dark:text-white">{state?.email || searchParams.get('email')}</span> gesendet.
                            </p>
                        </div>

                        {resendStatus === 'success' ? (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex gap-3 items-center text-sm font-medium">
                                <CheckCircle2 size={18} />
                                {resendMessage}
                            </div>
                        ) : resendStatus === 'error' ? (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
                                {resendMessage}
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={handleResend}
                                disabled={resendStatus === 'loading' || resendStatus === 'success'}
                                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-600/20"
                            >
                                {resendStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : null}
                                Link erneut senden
                            </button>
                            <button
                                onClick={() => {
                                    setModalVisible(false);
                                    setShowResendModal(false);
                                }}
                                className="py-4 px-6 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-white transition-colors"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Side - Image (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-amber-100">
                <Image
                    src="/hero.png"
                    alt="Nachbarschaftshilfe"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-amber-600/10 mix-blend-multiply" />
                <div className="absolute bottom-10 left-10 p-8 bg-white/90 backdrop-blur-sm rounded-2xl max-w-md shadow-xl">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Willkommen zurück!</h3>
                    <p className="text-gray-600">
                        "Nachbarschafts-Helden hat mir geholfen, schnell jemanden für meinen Garten zu finden. Super einfach!"
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 dark:bg-zinc-950 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                                <HeartHandshake size={24} />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Nachbarschafts-Helden</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Anmelden
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Schön, dass du wieder da bist.
                        </p>
                    </div>

                    {timeoutMsg && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-sm font-bold flex items-center gap-3 border border-amber-100 dark:border-amber-800">
                            <ShieldAlert size={20} className="shrink-0" />
                            Du wurdest aus Sicherheitsgründen automatisch ausgeloggt.
                        </div>
                    )}

                    {/* Redundant, handled by Modal now */}

                    {state?.error && state.error !== 'unverified' && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium">
                            {state.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                E-Mail Adresse
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-4 bg-white dark:bg-zinc-900 dark:ring-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                    Passwort
                                </label>
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-semibold text-amber-600 hover:text-amber-500">
                                        Vergessen?
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-4 bg-white dark:bg-zinc-900 dark:ring-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex w-full justify-center rounded-xl bg-amber-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:shadow-amber-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Anmelden'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Noch kein Konto?{' '}
                        <Link href="/register" className="font-semibold leading-6 text-amber-600 hover:text-amber-500">
                            Kostenlos registrieren
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
