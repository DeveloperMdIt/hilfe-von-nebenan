'use client';

import Link from 'next/link';
import { requestPasswordReset } from '../actions';
import { HeartHandshake, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { useActionState } from 'react';

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-zinc-950">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                        <HeartHandshake size={24} />
                    </div>
                </Link>
                <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Passwort vergessen?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Kein Problem. Gib einfach deine E-Mail-Adresse ein.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {state?.success ? (
                    <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 p-6 text-center shadow-sm border border-green-100 dark:border-green-900/50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-base font-semibold text-green-800 dark:text-green-300">E-Mail versendet!</h3>
                        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                            {state.message}
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                            >
                                <span aria-hidden="true">&larr;</span> Zurück zum Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form action={formAction} className="space-y-6">
                        {state?.error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                E-Mail Adresse
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
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
                                {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Link anfordern'}
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-10 text-center text-sm text-gray-500">
                    <Link href="/login" className="font-semibold leading-6 text-amber-600 hover:text-amber-500 flex items-center justify-center gap-1">
                        <ArrowLeft size={16} /> Zurück zum Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
