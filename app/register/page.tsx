import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/register-form';
import { HeartHandshake } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
            {/* Left Side - Image (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-amber-100 overflow-hidden">
                <Image
                    src="/hero.png"
                    alt="Nachbarschaftshilfe"
                    fill
                    className="object-cover scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-amber-600/10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-16 left-16 p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] max-w-md shadow-2xl text-white">
                    <div className="text-amber-400 mb-4 flex gap-1 font-black italic tracking-tighter">
                        ★★★★★
                    </div>
                    <h3 className="text-3xl font-black mb-4 leading-tight">Werde Teil der Community!</h3>
                    <p className="text-white/80 font-medium leading-relaxed">
                        "Endlich eine Plattform, die wirklich lokal verbindet. Ich habe tolle Nachbarn kennengelernt und Hilfe gefunden."
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 overflow-y-auto">
                <div className="mx-auto w-full max-w-md">
                    <div className="mb-12">
                        <Link href="/" className="flex items-center gap-3 mb-10 group">
                            <div className="h-12 w-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-amber-600/30 group-hover:scale-110 transition-transform duration-300">
                                <HeartHandshake size={28} />
                            </div>
                            <div>
                                <span className="font-black text-2xl tracking-tight text-gray-900 dark:text-white block leading-none">Nachbarschafts Helden</span>
                                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mt-1 block">Nachbarschafts-Netzwerk</span>
                            </div>
                        </Link>
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                            Konto erstellen
                        </h2>
                        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
                            Starte jetzt direkt durch und werde Teil unseres Netzwerks.
                        </p>
                    </div>

                    <RegisterForm />

                    <p className="mt-12 text-center text-sm text-gray-400 font-medium">
                        Bereits registriert?{' '}
                        <Link href="/login" className="font-black text-amber-600 hover:text-amber-500 transition-colors">
                            Hier anmelden
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
