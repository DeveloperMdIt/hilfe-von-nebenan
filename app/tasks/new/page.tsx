import Link from 'next/link';
import { createTask } from '../../actions';
import { ShoppingBag, PawPrint, Hammer, Leaf, Truck, Heart } from 'lucide-react';

export default function NewTaskPage() {
    const categories = [
        { name: 'Einkaufen', icon: ShoppingBag, slug: 'shopping' },
        { name: 'Tierbetreuung', icon: PawPrint, slug: 'pets' },
        { name: 'Handwerk', icon: Hammer, slug: 'diy' },
        { name: 'Garten', icon: Leaf, slug: 'garden' },
        { name: 'Transport', icon: Truck, slug: 'transport' },
        { name: 'Pflege', icon: Heart, slug: 'care' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto">
                <Link href="/tasks" className="text-sm text-gray-500 mb-6 block">← Zurück zur Übersicht</Link>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
                    <h1 className="text-2xl font-bold mb-6">Neuen Auftrag erstellen</h1>

                    <form action={createTask} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Was brauchst du? (Titel)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-3"
                                    placeholder="z.B. Hilfe beim Umzug"
                                    required
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Kategorie
                            </label>
                            <div className="mt-2">
                                <select
                                    id="category"
                                    name="category"
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-3"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                    ))}
                                    <option value="other">Sonstiges</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Beschreibung
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 pl-3"
                                    placeholder="Beschreibe genau, wobei du Hilfe brauchst..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Preisvorstellung (Euro)
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">€</span>
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    step="0.50"
                                    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                                    placeholder="20.00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-amber-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-colors"
                            >
                                Auftrag veröffentlichen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
