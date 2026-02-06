'use client';

import Link from 'next/link';
import Image from 'next/image';
import { loginUser } from '../actions';
import { HeartHandshake } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="flex h-full overflow-hidden">
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
                        "Hilfe von Nebenan hat mir geholfen, schnell jemanden für meinen Garten zu finden. Super einfach!"
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
                            <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Hilfe von Nebenan</span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Anmelden
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Schön, dass du wieder da bist.
                        </p>
                    </div>

                    <form action={loginUser} className="space-y-6">
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
                                    <a href="#" className="font-semibold text-amber-600 hover:text-amber-500">
                                        Vergessen?
                                    </a>
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
                                className="flex w-full justify-center rounded-xl bg-amber-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:shadow-amber-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Anmelden
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
