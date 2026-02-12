'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TagFiltersProps {
    categories: string[];
}

export default function TagFilters({ categories }: TagFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [status, setStatus] = useState(searchParams.get('status') || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ q: search });
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`?${params.toString()}`);
    };

    const reset = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.push('/admin/tags');
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tag-Namen suchen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                    />
                </div>

                <div className="w-full md:w-48">
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            updateFilters({ category: e.target.value });
                        }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                    >
                        <option value="">Alle Kategorien</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            updateFilters({ status: e.target.value });
                        }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                    >
                        <option value="">Alle Stati</option>
                        <option value="active">Aktiv</option>
                        <option value="suggestion">Vorschläge</option>
                    </select>
                </div>

                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <X size={16} />
                    Reset
                </button>
            </div>
        </div>
    );
}
