
import Link from 'next/link';
import { Heart, Mail, MapPin, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 pt-16 pb-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-amber-500 p-1.5 rounded-lg">
                                <Heart className="text-white fill-white" size={20} />
                            </div>
                            <span className="text-xl font-black tracking-tight dark:text-white">Hilfe von Nebenan</span>
                        </Link>
                        <p className="text-sm leading-6 text-gray-600 dark:text-zinc-400 max-w-xs">
                            Deine lokale Plattform für Nachbarschaftshilfe.
                            Wir verbinden Menschen im Viertel – einfach, lokal und sicher.
                        </p>
                        <div className="flex gap-x-6">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                                <ShieldCheck size={16} />
                                PStTG Konform
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-bold leading-6 text-gray-900 dark:text-white uppercase tracking-wider">Plattform</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="/tasks" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            Aufträge finden
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/tasks/new" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            Hilfe suchen
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/#how-it-works" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            So funktioniert's
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/pricing" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            Preise & Modelle
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-bold leading-6 text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="/faq" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors flex items-center gap-1.5">
                                            <HelpCircle size={14} />
                                            FAQ & Hilfe
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="mailto:support@hilfe-von-nebenan.de" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors flex items-center gap-1.5">
                                            <Mail size={14} />
                                            Kontakt
                                        </a>
                                    </li>
                                    <li className="text-sm leading-6 text-gray-500 dark:text-zinc-500 flex items-start gap-1.5">
                                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                                        Deutschlandweit verfügbar
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-bold leading-6 text-gray-900 dark:text-white uppercase tracking-wider">Rechtliches</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            Impressum
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            Datenschutz
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/agb" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors">
                                            AGB
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-bold leading-6 text-gray-900 dark:text-white uppercase tracking-wider">Partner</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <a href="https://md-it-solutions.de" target="_blank" rel="noopener noreferrer" className="text-sm leading-6 text-gray-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-colors flex items-center gap-1.5">
                                            MD IT Solutions
                                            <ExternalLink size={12} />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 border-t border-gray-100 dark:border-zinc-800 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs leading-5 text-gray-400 dark:text-zinc-500">
                        &copy; {currentYear} Hilfe von Nebenan. Ein Projekt von MD IT Solutions.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-500">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase font-bold text-[10px]">Beta</span>
                        <span>Made with ❤️ for the community</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
