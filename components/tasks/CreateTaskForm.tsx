'use client';

import { useState, useTransition } from 'react';
import { createTask } from '../../app/actions';
import { ShoppingBag, PawPrint, Hammer, Leaf, Truck, Heart, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TASK_CATEGORIES } from '@/lib/constants';

const ICON_MAP: Record<string, any> = {
    shopping: ShoppingBag,
    pets: PawPrint,
    diy: Hammer,
    garden: Leaf,
    transport: Truck,
    care: Heart,
};

const categories = TASK_CATEGORIES.map(cat => ({
    ...cat,
    icon: ICON_MAP[cat.slug] || ShoppingBag
}));

export function CreateTaskForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{ flagged: boolean; message: string } | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setError(null);
        startTransition(async () => {
            const res = await createTask(formData);

            if (res.success) {
                if (res.flagged) {
                    setSuccess({ flagged: true, message: res.message || '' });
                } else if (res.redirect) {
                    router.push(res.redirect);
                }
            } else {
                if (res.error === 'profile_incomplete_seeker') {
                    setError('Dein Profil ist noch nicht vollständig. Bitte ergänze deine Adresse und dein Geburtsdatum in den Einstellungen.');
                } else {
                    setError(res.error || 'Fehler beim Erstellen des Auftrags.');
                }
            }
        });
    }

    if (success) {
        return (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Vielen Dank!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                    {success.flagged
                        ? success.message
                        : 'Dein Auftrag wurde erfolgreich erstellt und ist nun für alle sichtbar.'}
                </p>
                <button
                    onClick={() => router.push('/tasks')}
                    className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all"
                >
                    Zur Übersicht
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}
            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Was brauchst du? (Titel)
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="title"
                        id="title"
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                        placeholder="z.B. Hilfe beim Umzug"
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            {/* Category */}
            <div>
                <label htmlFor="category" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Kategorie
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => (
                        <label key={cat.slug} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 cursor-pointer hover:border-amber-400 transition-all has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50 dark:has-[:checked]:bg-amber-900/10">
                            <input type="radio" name="category" value={cat.slug} className="sr-only" required />
                            <cat.icon size={20} className="text-gray-500 group-has-[:checked]:text-amber-600" />
                            <span className="text-xs font-bold">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Beschreibung
                </label>
                <p className="text-xs text-gray-500 mb-2 ml-1">
                    Bitte verzichte auf persönliche Kontaktdaten (Telefon, E-Mail) im Text.
                    Anstößige oder diskriminierende Inhalte werden gefiltert.
                </p>
                <div className="mt-2">
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 border transition-all"
                        placeholder="Beschreibe genau, wobei du Hilfe brauchst..."
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            {/* Price */}
            <div>
                <label htmlFor="price" className="block text-sm font-black text-gray-700 dark:text-gray-300 ml-1">
                    Festpreis für den gesamten Auftrag (Euro)
                </label>
                <div className="mt-2 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                        <span className="text-gray-500 font-bold">€</span>
                    </div>
                    <input
                        type="number"
                        name="price"
                        id="price"
                        step="1"
                        min="5"
                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-amber-600 sm:text-sm p-4 pl-10 border transition-all"
                        placeholder="20"
                        required
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full justify-center rounded-2xl bg-amber-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-amber-600/20 hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Auftrag veröffentlichen'}
                </button>
            </div>
        </form>
    );
}
