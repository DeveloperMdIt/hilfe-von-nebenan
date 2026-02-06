'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    priceMonthlyCents: number;
    priceYearlyCents: number | null;
    commissionRate: number;
    features: string | null;
}

export function PricingList({ plans }: { plans: Plan[] }) {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-y-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12 w-full">
            {plans.map((plan) => {
                const hasYearlyOption = plan.priceYearlyCents && plan.priceYearlyCents > 0;
                const price = isYearly && hasYearlyOption ? plan.priceYearlyCents : plan.priceMonthlyCents;
                const isPaid = plan.priceMonthlyCents > 0;
                const hasSavings = isYearly && plan.priceYearlyCents && (plan.priceYearlyCents < plan.priceMonthlyCents * 12);

                return (
                    <div
                        key={plan.id}
                        className={`relative rounded-[2rem] p-6 lg:p-8 ring-1 ring-gray-200 dark:ring-zinc-800 transition-all duration-300 transform hover:scale-[1.01] flex flex-col ${isPaid
                            ? 'bg-gray-900 ring-gray-900 dark:bg-zinc-900 dark:ring-zinc-800 shadow-xl'
                            : 'bg-white dark:bg-zinc-950/50 hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 shadow-sm'
                            }`}
                    >
                        {/* Plan Header */}
                        <div className="flex flex-col gap-y-1 mb-4 lg:mb-6">
                            <div className="flex items-center justify-between">
                                <h3
                                    id={plan.id}
                                    className={`text-5xl lg:text-6xl font-black tracking-tightest leading-none ${isPaid ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
                                >
                                    {plan.name}
                                </h3>
                                {isPaid && (
                                    <div className="absolute -top-3 right-8 flex flex-col items-end gap-2">
                                        <div className="bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-zinc-800 uppercase tracking-widest leading-none">
                                            Beliebt
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className={`text-sm lg:text-base leading-relaxed font-medium mb-6 lg:mb-8 line-clamp-2 ${isPaid ? 'text-zinc-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isPaid
                                ? 'Für aktive Helfer, die mehr verdienen möchten.'
                                : 'Perfekt für den Einstieg in die Hilfe.'}
                        </p>

                        {/* Toggle inside Pro Card */}
                        {isPaid && hasYearlyOption && (
                            <div className="flex items-center gap-3 mb-6 lg:mb-8 bg-zinc-800/60 p-2 rounded-xl border border-zinc-700/50 self-start shadow-inner">
                                <span className={`text-[11px] font-bold ${!isYearly ? 'text-white' : 'text-zinc-500'}`}>Monat</span>
                                <button
                                    onClick={() => setIsYearly(!isYearly)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isYearly ? 'bg-amber-600' : 'bg-zinc-600'}`}
                                >
                                    <span
                                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition transition-transform ${isYearly ? 'translate-x-[1.375rem]' : 'translate-x-1'}`}
                                    />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] font-bold ${isYearly ? 'text-white' : 'text-zinc-500'}`}>Jahr</span>
                                </div>
                            </div>
                        )}

                        {/* Pricing Header Area */}
                        <div className="mt-auto mb-6 lg:mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl lg:text-5xl font-black tracking-tighter ${isPaid ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {(price! / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </span>
                                <span className={`text-xs font-bold ${isPaid ? 'text-zinc-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                    / {isYearly && hasYearlyOption ? 'Jahr' : 'Monat'}
                                </span>
                            </div>
                            {hasSavings && (
                                <p className="text-[10px] font-bold text-green-500 mt-1 uppercase tracking-tight">
                                    Du sparst 2 Monate!
                                </p>
                            )}
                        </div>

                        {/* CTA */}
                        <Link
                            href="/register"
                            className={`block w-full rounded-2xl py-3 px-4 text-center text-sm font-black transition-all ${isPaid
                                ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/30'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 ring-2 ring-amber-600/10 dark:bg-amber-900/10 dark:text-amber-500 dark:hover:bg-amber-900/20'
                                }`}
                        >
                            {plan.name} wählen
                        </Link>

                        {/* Feature List (Tighter) */}
                        <ul className={`mt-6 lg:mt-8 space-y-2 text-xs font-medium ${isPaid ? 'text-zinc-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {plan.features && plan.features.split(',').map((feature, idx) => (
                                <li key={idx} className="flex gap-x-2.5 items-center">
                                    <Check className={`h-4 w-4 flex-none ${isPaid ? 'text-amber-500' : 'text-amber-600'}`} />
                                    <span className={isPaid ? 'text-zinc-300' : 'text-gray-600 dark:text-gray-400'}>
                                        {feature.trim()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}
