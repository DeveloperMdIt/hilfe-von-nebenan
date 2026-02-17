'use client';

import { useFormStatus } from 'react-dom';
import { updateSettings } from '@/app/actions';
import { Loader2, CheckCircle2, CreditCard, LayoutGrid, Cpu, Save } from 'lucide-react';
import { useState } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-amber-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
            {pending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Speichert...
                </>
            ) : (
                <>
                    <Save size={18} />
                    Änderungen speichern
                </>
            )}
        </button>
    );
}

interface SettingsFormProps {
    initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [lastResult, setLastResult] = useState<{ success?: boolean, timestamp?: number } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        await updateSettings(formData);
        setLastResult({ success: true, timestamp: Date.now() });
        setTimeout(() => {
            setLastResult(null);
        }, 3000);
    };

    const getSetting = (key: string) => initialSettings[key];

    return (
        <form action={handleSubmit} className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                {/* Zahlung (Stripe) */}
                <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl w-fit mb-6">
                        <CreditCard size={28} />
                    </div>

                    <h2 className="text-xl font-black mb-2 tracking-tight">Zahlung (Stripe)</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-snug">
                        Hier hinterlegst du deine Schlüssel für Test- und Live-Zahlungen.
                    </p>

                    <div className="flex flex-col gap-8">
                        {/* Live Mode Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Live Modus (Produktion)</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Live Public Key</label>
                                <input
                                    type="text"
                                    name="stripeLivePublicKey"
                                    defaultValue={getSetting('stripe_live_public_key') || ''}
                                    placeholder="pk_live_..."
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50/50 dark:bg-zinc-950/50 font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Live Secret Key</label>
                                <input
                                    type="password"
                                    name="stripeLiveSecretKey"
                                    defaultValue={getSetting('stripe_live_secret_key') || ''}
                                    placeholder="sk_live_..."
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50/50 dark:bg-zinc-950/50 font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-zinc-800" />

                        {/* Sandbox Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Sandbox (Testumgebung)</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Sandbox Public Key</label>
                                <input
                                    type="text"
                                    name="stripeSandboxPublicKey"
                                    defaultValue={getSetting('stripe_sandbox_public_key') || ''}
                                    placeholder="pk_test_..."
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50/50 dark:bg-zinc-950/50 font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Sandbox Secret Key</label>
                                <input
                                    type="password"
                                    name="stripeSandboxSecretKey"
                                    defaultValue={getSetting('stripe_sandbox_secret_key') || ''}
                                    placeholder="sk_test_..."
                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50/50 dark:bg-zinc-950/50 font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 mt-2">
                            <input
                                type="checkbox"
                                id="testmode"
                                name="stripeTestMode"
                                defaultChecked={getSetting('stripe_test_mode') !== 'false'}
                                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 transition-all cursor-pointer"
                            />
                            <div className="flex flex-col">
                                <label htmlFor="testmode" className="text-xs font-black text-amber-800 dark:text-amber-300 cursor-pointer uppercase tracking-tight">Test-Modus aktiv</label>
                                <p className="text-[10px] text-amber-700/60 dark:text-amber-400/60 leading-tight">Wenn aktiv, werden Sandbox-Schlüssel verwendet.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sonstige Einstellungen (Module) */}
                <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl w-fit mb-6">
                        <LayoutGrid size={28} />
                    </div>

                    <h2 className="text-xl font-black mb-2 tracking-tight">Einstellungs-Module</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-snug">
                        Schalte Funktionen und Module deiner Plattform an oder aus.
                    </p>

                    <div className="flex flex-col gap-4 mt-auto">
                        {[
                            { name: 'moduleChat', title: 'Chat-System', desc: 'Direktnachrichten', key: 'module_chat' },
                            { name: 'moduleReviews', title: 'Bewertungen', desc: 'Gegenseitiges Feedback', key: 'module_reviews' },
                            { name: 'moduleSubscriptions', title: 'Abo-Modelle', desc: 'Premium-Mitgliedschaften', key: 'module_subscriptions' },
                            { name: 'isBetaPhase', title: 'Beta-Phase', desc: '0% Gebühren für Beta-Tester', key: 'is_beta_phase' },
                        ].map((m) => (
                            <div key={m.name} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                <div>
                                    <h3 className="text-sm font-bold">{m.title}</h3>
                                    <p className="text-[10px] text-gray-500">{m.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name={m.name}
                                        defaultChecked={getSetting(m.key) !== 'false'}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automatisierungen */}
                <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl w-fit mb-6">
                        <Cpu size={28} />
                    </div>

                    <h2 className="text-xl font-black mb-2 tracking-tight">Automatisierungen</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-snug">
                        Intervalle für automatische System-Mails und Prozesse.
                    </p>

                    <div className="mt-auto">
                        <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-green-800/60 dark:text-green-300/60 mb-4">Erinnerungs-System</label>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-green-800 dark:text-green-300">Sende nach</span>
                                <input
                                    type="number"
                                    name="reminderDays"
                                    defaultValue={getSetting('reminder_days') || '3'}
                                    min="1"
                                    max="30"
                                    className="w-20 rounded-xl border border-green-200 dark:border-green-900/50 p-3 bg-white dark:bg-zinc-950 font-black text-sm text-center focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-inner"
                                />
                                <span className="text-xs font-bold text-green-800 dark:text-green-300">Tagen</span>
                            </div>
                            <p className="text-[10px] text-green-700/60 dark:text-green-400/60 mt-4 leading-relaxed italic">
                                Nutzer erhalten eine Mail, wenn sie nach X Tagen noch nicht verifiziert sind.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="flex items-center justify-end gap-6 mt-12 p-6 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-gray-200 dark:border-zinc-800 shadow-2xl lg:sticky lg:bottom-8 z-30 transition-all duration-500">
                {lastResult?.success && (
                    <div className="flex items-center gap-2 text-green-600 font-bold animate-in fade-in slide-in-from-right-4 transition-all">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full shadow-inner">
                            <CheckCircle2 size={20} />
                        </div>
                        <span className="text-sm tracking-tight font-black uppercase">Erfolgreich gespeichert!</span>
                    </div>
                )}
                <SubmitButton />
            </div>
        </form>
    );
}
