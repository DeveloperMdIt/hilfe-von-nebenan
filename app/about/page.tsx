import { Handshake, Search, ShieldCheck, Scale, FileText, Banknote } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-zinc-950">
            {/* Hero Section */}
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-amber-600">Unsere Mission</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                        Nachbarschaftshilfe einfach & ehrlich
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                        Wir verbinden Menschen, die Hilfe brauchen, mit denen, die helfen wollen.
                        Wichtig: Wir sind <strong>keine Handwerkervermittlung</strong>, sondern eine Plattform für private Nachbarschaftshilfe.
                    </p>
                </div>

                {/* Features / Steps */}
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                                <Search className="h-5 w-5 flex-none text-amber-600" aria-hidden="true" />
                                Auftrag erstellen oder finden
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                                <p className="flex-auto">
                                    Beschreibe kurz, wobei du Hilfe benötigst, oder durchsuche offene Aufträge in deiner Umgebung.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                                <Handshake className="h-5 w-5 flex-none text-amber-600" aria-hidden="true" />
                                Matchen & Helfen
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                                <p className="flex-auto">
                                    Einigt euch über die Details und erledigt die Aufgabe. Bezahlung und Absprache erfolgen direkt.
                                </p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                                <ShieldCheck className="h-5 w-5 flex-none text-amber-600" aria-hidden="true" />
                                Sicher & Vertrauenswürdig
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                                <p className="flex-auto">
                                    Verifizierte Nutzer und Bewertungen sorgen für Sicherheit und Qualität in der Community.
                                </p>
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Legal / Tax Warning Section */}
                <div className="mx-auto mt-24 max-w-5xl border-t border-gray-200 dark:border-zinc-800 pt-16">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-8 text-center">
                        Wichtige Hinweise & Transparenz
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <Scale className="text-amber-600" size={24} />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Meldung ans Finanzamt</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Wir sind gesetzlich dazu verpflichtet (gemäß PStTG), Einkünfte auf unserer Plattform an die Finanzbehörden zu melden, sobald bestimmte Umsatzgrenzen überschritten werden. Wir legen Wert auf volle Transparenz.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <FileText className="text-amber-600" size={24} />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Umsatzaufstellung</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Du erhältst von uns eine detaillierte Umsatzaufstellung für deine Unterlagen. Dies hilft dir, deine Einnahmen korrekt beim Finanzamt im Rahmen deiner Steuererklärung anzugeben.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3">
                                <Banknote className="text-amber-600" size={24} />
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Rechnungen (ohne MwSt)</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Da es sich in der Regel um private Nachbarschaftshilfe oder Kleingewerbe handelt, werden Rechnungen bzw. Belege meist ohne Ausweis von Umsatzsteuer bereitgestellt (Kleinunternehmerregelung).
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
