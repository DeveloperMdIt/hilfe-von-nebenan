import { db } from '../../lib/db';
import { subscriptionPlans } from '../../lib/schema';
import { PricingList } from '../../components/pricing-list';
import Link from 'next/link';
// import { Check, X as XIcon } from 'lucide-react'; // Moved to PricingList

import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));

    return (
        <div className="bg-white dark:bg-zinc-950 h-[calc(100vh-64px)] flex flex-col justify-center overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4 lg:py-8 w-full">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Preise & Modelle</h2>
                    <p className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                        Das passende Modell für dich
                    </p>
                </div>
                <p className="mx-auto mt-2 max-w-2xl text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    Faire Tarife für Helfer und Suchende.
                </p>

                {/* Important Clarification (Compact) */}
                <div className="mt-4 flex justify-center">
                    <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-4 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20">
                        <span className="opacity-75">Gut zu wissen:</span> Aufträge einstellen ist <span className="underline decoration-amber-500 underline-offset-4 font-black">immer kostenlos</span>.
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <PricingList plans={plans as any} />
                </div>
            </div>
        </div>
    );
}
