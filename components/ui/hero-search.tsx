'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function HeroSearch() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/tasks?search=${encodeURIComponent(query)}`);
        } else {
            router.push('/tasks');
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center mt-8">
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 rounded-full border-0 text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-500 sm:text-lg sm:leading-6"
                    placeholder="Wonach suchst du? (z.B. Hund, Einkaufen)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-full px-6 transition-colors"
                >
                    Suchen
                </button>
            </div>
        </form>
    );
}
