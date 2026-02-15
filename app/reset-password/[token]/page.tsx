'use client';

import Link from 'next/link';
import { resetPassword } from '../../actions';
import { HeartHandshake, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useActionState, use } from 'react';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [state, formAction, isPending] = useActionState(resetPassword, null);

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-zinc-950">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                        <HeartHandshake size={24} />
                    </div>
                </Link>
                <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Neues Passwort vergeben
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="token" value={token} />
                    {state?.error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Neues Passwort
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-4 bg-white dark:bg-zinc-900 dark:ring-zinc-800 dark:text-white pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <Lock size={16} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="passwordConfirm" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                            Passwort bestätigen
                        </label>
                        <div className="mt-2 relative">
                            <input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type="password"
                                required
                                minLength={8}
                                className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-4 bg-white dark:bg-zinc-900 dark:ring-zinc-800 dark:text-white pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <Lock size={16} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex w-full justify-center rounded-xl bg-amber-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:shadow-amber-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Passwort speichern'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    <Link href="/login" className="font-semibold leading-6 text-amber-600 hover:text-amber-500 flex items-center justify-center gap-1">
                        <ArrowLeft size={16} /> Abbrechen und zum Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
