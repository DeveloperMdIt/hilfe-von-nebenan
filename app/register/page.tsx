import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '../actions';
import { HeartHandshake } from 'lucide-react';

export default function RegisterPage() {
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Werde Teil der Community!</h3>
                    <p className="text-gray-600">
                        "Endlich eine Plattform, die wirklich lokal verbindet. Ich habe tolle Nachbarn kennengelernt!"
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
                            Konto erstellen
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Starte jetzt direkt durch.
                        </p>
                    </div>

                    <form className="space-y-6" action={registerUser}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                                Vollständiger Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-4 bg-white dark:bg-zinc-900 dark:ring-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

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


                        <div className="flex items-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="consent"
                                    name="consent"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600 dark:border-zinc-700 dark:bg-zinc-800 dark:ring-offset-zinc-900"
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="consent" className="font-medium text-gray-900 dark:text-gray-200">
                                    Ich habe die <Link href="/agb" className="text-amber-600 hover:text-amber-500 underline" target="_blank">AGB</Link> und die <Link href="/datenschutz" className="text-amber-600 hover:text-amber-500 underline" target="_blank">Datenschutzerklärung</Link> gelesen und stimme diesen zu.
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-xl bg-amber-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 hover:shadow-amber-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Registrieren
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Bereits registriert?{' '}
                        <Link href="/login" className="font-semibold leading-6 text-amber-600 hover:text-amber-500">
                            Hier anmelden
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
