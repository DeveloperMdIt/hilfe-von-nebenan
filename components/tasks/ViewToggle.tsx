'use client';

import { Map as MapIcon, List, LayoutGrid } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function ViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentView = searchParams.get('view') || 'split';

    const setView = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        startTransition(() => {
            router.push(`/tasks?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm self-start">
            <button
                onClick={() => setView('split')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'split'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
            >
                <LayoutGrid size={18} />
                <span className="hidden sm:inline">Kombi</span>
            </button>
            <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'list'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
            >
                <List size={18} />
                <span className="hidden sm:inline">Liste</span>
            </button>
            <button
                onClick={() => setView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${currentView === 'map'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
            >
                <MapIcon size={18} />
                <span className="hidden sm:inline">Karte</span>
            </button>
        </div>
    );
}
