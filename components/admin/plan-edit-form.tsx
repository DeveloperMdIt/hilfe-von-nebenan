'use client';

import { updateSubscriptionPlan } from '@/app/actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="text-xs bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition-colors disabled:opacity-50"
        >
            {pending ? 'Speichert...' : 'Speichern'}
        </button>
    );
}

import { useActionState, useEffect, useState } from 'react';

// Wrapper to match useActionState signature
// The action in actions.ts returns { success: boolean, message: string } or undefined
// useActionState expects (prevState: State, formData: FormData) => State
const updatePlanAction = async (prevState: any, formData: FormData) => {
    return await updateSubscriptionPlan(formData);
};

export function PlanEditForm({ plan }: { plan: any }) {
    const [state, formAction] = useActionState(updatePlanAction, null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <form action={formAction} className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <input type="hidden" name="id" value={plan.id} />
            <h4 className="font-semibold text-sm flex justify-between items-center">
                Preise & Konditionen anpassen
                {showSuccess && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded animate-in fade-in slide-in-from-bottom-1">
                        {state?.message}
                    </span>
                )}
            </h4>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium mb-1">Monatlich (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="priceMonthly"
                        defaultValue={(plan.priceMonthlyCents / 100).toFixed(2)}
                        className="w-full p-2 rounded border bg-transparent text-sm"
                        onFocus={handleFocus}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1">Jährlich (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="priceYearly"
                        defaultValue={(plan.priceYearlyCents ? plan.priceYearlyCents / 100 : 0).toFixed(2)}
                        className="w-full p-2 rounded border bg-transparent text-sm"
                        onFocus={handleFocus}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium mb-1">Provision (%)</label>
                <input
                    type="number"
                    name="commissionRate"
                    defaultValue={plan.commissionRate}
                    className="w-full p-2 rounded border bg-transparent text-sm"
                    onFocus={handleFocus}
                />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
