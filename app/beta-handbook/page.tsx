import { ShieldAlert, CreditCard, Info, Heart, Smartphone, MapPin, Package, Wrench, MessageSquare, Star, Layout, Laptop } from 'lucide-react';
import Link from 'next/link';

export default function BetaHandbookPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-black uppercase tracking-widest mb-6 border border-amber-200 dark:border-amber-800">
                        <Star size={16} className="fill-current" />
                        Beta-Phase
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                        🐞 LIR Beta-Tester Handbuch
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Vielen Dank, dass du uns dabei hilfst, HilfeVonNebenan (LIR) stabil und sicher zu machen!
                    </p>
                </div>

                {/* Important Alert */}
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-8 md:p-12 mb-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-900/20">
                            <ShieldAlert size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-red-900 dark:text-red-400 mb-4 uppercase tracking-tight">
                                ⚠️ WICHTIG: Keine rechtlichen Konsequenzen
                            </h2>
                            <div className="space-y-4 text-red-800/80 dark:text-red-400/80 leading-relaxed font-medium">
                                <p>
                                    Während der Beta-Testphase haben deine Aktionen in der App <strong>keine rechtlichen Folgen</strong>.
                                    Du bist völlig frei in dem, was du tust, da es sich um eine Testumgebung handelt.
                                </p>
                                <p>
                                    Die AGB und Nutzungsbedingungen treten erst nach offiziellem Ende der Beta-Phase in Kraft.
                                    Geht jedoch respektvoll mit anderen Beta-Testern um, das sind echte Menschen wie du :-)
                                    <strong>Tob dich aus!</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -m-8 opacity-5">
                        <ShieldAlert size={200} />
                    </div>
                </div>

                {/* Test Data */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-zinc-800 mb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                            <CreditCard size={28} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">💳 Test-Zahlungsdaten</h2>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Um Zahlungen (Supporter/Patron/Gegenstände) zu testen, nutze bitte folgende Daten:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Kartennummer</p>
                            <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">4242 4242 4242 4242</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gültig</p>
                            <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">02/28</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">CVV</p>
                            <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">123</p>
                        </div>
                    </div>
                </div>

                {/* Mission / Tasks */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                            <Info size={28} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">🕵️‍♂️ Dein Auftrag</h2>
                    </div>

                    <div className="grid gap-6">
                        {[
                            {
                                id: 1,
                                title: "1. Installation (PWA)",
                                icon: Smartphone,
                                tasks: [
                                    "Öffne die Seite in deinem mobilen Browser (Safari/Chrome).",
                                    "Nutze den Banner auf der Startseite zur Installation.",
                                    "Prüfe das Icon auf dem Homescreen und die Vollbild-Anzeige."
                                ]
                            },
                            {
                                id: 2,
                                title: "2. Registrierung & Profil",
                                icon: User,
                                tasks: [
                                    "Erstelle einen neuen Account (Adress-Suche prüfen).",
                                    "Prüfe die 10 Karma Gutschrift im Profil.",
                                    "Profilbild und Daten ändern.",
                                    "Passwort-Änderung & rechtliche Links testen."
                                ]
                            },
                            {
                                id: 3,
                                title: "3. Aufträge & Kategorien",
                                icon: Wrench,
                                tasks: [
                                    "Erstelle einen Auftrag mit Bildern.",
                                    "Ändere Status (Beendet, Abgebrochen).",
                                    "Suche & Filter in 'Entdecken' testen.",
                                    "Standorterkennung prüfen."
                                ]
                            },
                            {
                                id: 4,
                                title: "4. Der Prozess (Haupt-Feature!) ⭐",
                                icon: Star,
                                tasks: [
                                    "Nutze einen zweiten Account/Partner.",
                                    "Anfrage stellen, Akzeptieren/Ablehnen.",
                                    "Zahlung mit Testdaten simulieren.",
                                    "Chatnachrichten prüfen."
                                ]
                            },
                            {
                                id: 5,
                                title: "5. Kommunikation & Layout",
                                icon: MessageSquare,
                                tasks: [
                                    "Abonniere Push-Benachrichtigungen.",
                                    "Teste Landscape-Modus auf dem Handy.",
                                    "Feedback-Symbol (lila) testen.",
                                    "Responsivität auf dem Desktop prüfen."
                                ]
                            }
                        ].map((section) => (
                            <div key={section.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-all group">
                                <div className="flex gap-6">
                                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 text-gray-400 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 rounded-2xl transition-all h-fit">
                                        <section.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black mb-4">{section.title}</h3>
                                        <ul className="space-y-3">
                                            {section.tasks.map((task, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-20 text-center pb-20">
                    <div className="inline-flex p-6 bg-amber-600 text-white rounded-[2rem] shadow-2xl shadow-amber-900/40 mb-8">
                        <Heart size={32} className="fill-current" />
                    </div>
                    <h2 className="text-2xl font-black mb-4">Viel Spaß beim Testen!</h2>
                    <p className="text-gray-500 mb-8">Danke, dass du Teil der Community bist.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
                    >
                        Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Simple User icon wrapper as it's missing from import list locally usually
function User({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
