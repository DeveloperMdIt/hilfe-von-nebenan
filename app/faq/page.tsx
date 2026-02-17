
import { HelpCircle, ChevronDown, MessageCircle, Shield, CreditCard, UserPlus } from 'lucide-react';

const faqs = [
    {
        category: "Allgemein",
        icon: <HelpCircle className="text-amber-600" size={20} />,
        questions: [
            {
                q: "Was ist Nachbarschafts Helden?",
                a: "Wir sind eine lokale Plattform, die Menschen, die Hilfe benötigen, mit hilfsbereiten Nachbarn verbindet. Ob Einkaufen, Hund ausführen oder kleine Reparaturen – hier finden Sie Unterstützung in Ihrer direkten Umgebung."
            },
            {
                q: "Ist der Dienst kostenlos?",
                a: "Die Registrierung und das Stöbern in Aufträgen sind kostenlos. Für die erfolgreiche Vermittlung fällt eine geringe Servicegebühr an, um den Betrieb der Plattform zu ermöglichen."
            }
        ]
    },
    {
        category: "Für Helfer",
        icon: <UserPlus className="text-blue-600" size={20} />,
        questions: [
            {
                q: "Wie werde ich Helfer?",
                a: "Registrieren Sie sich einfach als Nutzer und ergänzen Sie in Ihrem Profil Ihre Interessen und Fähigkeiten. Sie können dann direkt auf offene Aufträge in Ihrer Nähe reagieren."
            },
            {
                q: "Was muss ich steuerlich beachten (PStTG)?",
                a: "Ab einer gewissen Anzahl an Transaktionen (30 pro Jahr) oder Gesamteinnahmen (2.000 €) sind wir gesetzlich verpflichtet, diese Daten an das Finanzamt zu melden. Wir informieren Sie rechtzeitig, bevor diese Grenzen erreicht werden."
            }
        ]
    },
    {
        category: "Sicherheit & Zahlung",
        icon: <Shield className="text-green-600" size={20} />,
        questions: [
            {
                q: "Wie sicher ist die Bezahlung?",
                a: "Wir nutzen Stripe, einen der weltweit führenden Zahlungsdienstleister. Die Bezahlung erfolgt sicher über die Plattform und wird erst ausgezahlt, wenn die Hilfe erfolgreich abgeschlossen wurde."
            },
            {
                q: "Was passiert bei Problemen?",
                a: "Sollte es Unstimmigkeiten geben, können Sie uns jederzeit über das Kontaktformular oder per E-Mail erreichen. Wir vermitteln gerne zwischen den Parteien."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-amber-600">Häufig gestellte Fragen</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        Wir sind für Sie da
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-zinc-400">
                        Hier finden Sie Antworten auf die am häufigsten gestellten Fragen zu unserer Plattform.
                        Sollten Sie weitere Fragen haben, kontaktieren Sie uns gerne direkt.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-3xl divide-y divide-gray-100 dark:divide-zinc-800">
                    {faqs.map((group, idx) => (
                        <div key={idx} className="py-10">
                            <div className="flex items-center gap-3 mb-8">
                                {group.icon}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.category}</h3>
                            </div>
                            <dl className="space-y-8">
                                {group.questions.map((faq, fIdx) => (
                                    <div key={fIdx} className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                        <dt className="text-base font-bold leading-7 text-gray-900 dark:text-white">
                                            {faq.q}
                                        </dt>
                                        <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-zinc-400">
                                            {faq.a}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-500 dark:text-zinc-500">
                        Nichts Passendes gefunden? <a href="mailto:support@nachbarschafts-helden.de" className="font-semibold text-amber-600 hover:text-amber-500">Schreiben Sie uns eine E-Mail</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
