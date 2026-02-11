
import React from 'react';

export default function ImpressumPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">Impressum</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Angaben gemäß § 5 TMG
                    </p>
                </div>
                <div className="mx-auto mt-10 max-w-2xl gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <div className="text-base leading-7 text-gray-700 dark:text-gray-300">
                        <h3 className="border-l-2 border-amber-600 pl-4 font-semibold text-gray-900 dark:text-gray-100">Betreiber</h3>
                        <p className="mt-4 pl-4">
                            MD IT Solutions<br />
                            Michael Deja<br />
                            An der Hohl 4<br />
                            36318 Schwalmtal<br />
                            Deutschland
                        </p>
                    </div>
                    <div className="text-base leading-7 text-gray-700 dark:text-gray-300">
                        <h3 className="border-l-2 border-amber-600 pl-4 font-semibold text-gray-900 dark:text-gray-100">Kontakt</h3>
                        <p className="mt-4 pl-4">
                            Telefon: +49 6638 72 92 101<br />
                            E-Mail: <a href="mailto:info@md-it-solutions.de" className="text-amber-600 hover:text-amber-500">info@md-it-solutions.de</a>
                        </p>
                    </div>
                    <div className="text-base leading-7 text-gray-700 dark:text-gray-300">
                        <h3 className="border-l-2 border-amber-600 pl-4 font-semibold text-gray-900 dark:text-gray-100">Verantwortlich für den Inhalt</h3>
                        <p className="mt-4 pl-4">
                            Michael Deja<br />
                            (Anschrift wie oben)
                        </p>
                    </div>
                </div>

                <div className="mt-10 border-t border-gray-200 pt-10">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Haftungsausschluss (Disclaimer)</h3>
                    <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <p><strong>Haftung für Inhalte</strong><br />
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>

                        <p><strong>Haftung für Links</strong><br />
                            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>

                        <p><strong>Urheberrecht</strong><br />
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
