import { db } from '@/lib/db';
import { subscriptionPlans } from '@/lib/schema';
// import { updateSubscriptionPlan } from '@/app/actions'; // Not needed here anymore
import { PlanEditForm } from '@/components/admin/plan-edit-form';

export default async function AdminPlansPage() {
    let plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.priceMonthlyCents);

    // Seed logic (running only if no plans exist)
    if (plans.length === 0) {
        await db.insert(subscriptionPlans).values([
            {
                name: 'Basis',
                priceMonthlyCents: 0,
                priceYearlyCents: 0,
                commissionRate: 15,
                features: 'Kostenlos starten,15% Servicegebühr,Basis-Support',
                isActive: true
            },
            {
                name: 'Pro',
                priceMonthlyCents: 299, // 2.99 EUR
                priceYearlyCents: 2999, // 29.99 EUR
                commissionRate: 10,
                features: 'Nur 10% Servicegebühr,Bevorzugter Support,Pro-Abzeichen im Profil',
                isActive: true
            }
        ]);
        // re-fetch
        plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.priceMonthlyCents);
    }

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Abo-Modelle verwalten</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-gray-500">{plan.isActive ? 'Aktiv' : 'Inaktiv'}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold block">
                                    {(plan.priceMonthlyCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </span>
                                <span className="text-xs text-gray-500">/ Monat</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg mb-6 border border-amber-100 dark:border-amber-900/30">
                            <p className="font-semibold text-amber-800 dark:text-amber-500">
                                Provision: {plan.commissionRate}%
                            </p>
                        </div>

                        <PlanEditForm plan={plan} />
                    </div>
                ))}
            </div>
        </div>
    );
}
