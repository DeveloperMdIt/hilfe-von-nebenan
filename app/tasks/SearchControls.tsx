'use client';

import { Map as MapIcon, List } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchControlsProps {
    search?: string;
    category?: string;
    radius?: string;
    view?: 'list' | 'map';
}

export default function SearchControls({ search, category, radius, view }: SearchControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateParams = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === 'all') params.delete(key);
            else params.set(key, value);
        });
        router.push(`/tasks?${params.toString()}`);
    };

    return (
        <div className="w-full flex flex-col sm:flex-row gap-3">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    updateParams({ search: formData.get('search') as string });
                }}
                className="relative flex-1"
            >
                <input
                    name="search"
                    type="text"
                    defaultValue={search}
                    placeholder="Suche (Stichwort oder PLZ)..."
                    className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                />
            </form>
            <div className="flex gap-2">
                <select
                    name="radius"
                    value={radius || 'all'}
                    onChange={(e) => updateParams({ radius: e.target.value })}
                    className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 border-transparent text-sm font-medium focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
                >
                    <option value="all">Umkreis: Alle</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                </select>
                <button
                    onClick={() => updateParams({ view: view === 'list' ? 'map' : 'list' })}
                    className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    title={view === 'list' ? 'Kartenansicht' : 'Listenansicht'}
                >
                    {view === 'list' ? <MapIcon size={20} /> : <List size={20} />}
                </button>
            </div>
        </div>
    );
}
