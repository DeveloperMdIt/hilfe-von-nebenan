'use client';

import { useState } from 'react';
import { updateTask } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Check } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    priceCents: number;
}

export function EditTaskForm({ task }: { task: Task }) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [flagged, setFlagged] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const result = await updateTask(formData);
        setLoading(false);

        if (result.success) {
            if (result.flagged) {
                setFlagged(true);
            } else {
                router.push(`/tasks/${task.id}`);
            }
        } else {
            setError(result.error || 'Fehler beim Aktualisieren des Auftrags.');
        }
    }

    if (flagged) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto text-amber-600">
                    <ShieldAlert size={32} />
                </div>
                <h3 className="text-xl font-bold">In Prüfung</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Deine Änderungen enthalten Begriffe, die manuell geprüft werden müssen.
                    Der Auftrag ist solange nur für dich sichtbar.
                </p>
                <button
                    onClick={() => router.push(`/tasks/${task.id}`)}
                    className="bg-amber-600 text-white px-6 py-2 rounded-xl font-bold"
                >
                    Zum Auftrag
                </button>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="id" value={task.id} />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Titel</label>
                <input
                    name="title"
                    defaultValue={task.title}
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Kategorie</label>
                <select
                    name="category"
                    defaultValue={task.category}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                >
                    <option value="Haushalt">Haushalt</option>
                    <option value="Garten">Garten</option>
                    <option value="Einkauf">Einkauf</option>
                    <option value="Technik">Technik</option>
                    <option value="Transport">Transport</option>
                    <option value="Sonstiges">Sonstiges</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Beschreibung</label>
                <textarea
                    name="description"
                    defaultValue={task.description}
                    required
                    rows={5}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Budget (EUR)</label>
                <input
                    name="price"
                    type="text"
                    defaultValue={(task.priceCents / 100).toString().replace('.', ',')}
                    required
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2 text-lg"
            >
                {loading ? 'Speichere...' : (
                    <>
                        <Check size={20} />
                        Änderungen speichern
                    </>
                )}
            </button>
        </form>
    );
}
