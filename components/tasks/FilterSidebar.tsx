'use client';

import { Search, MapPin, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TASK_CATEGORIES } from '@/lib/constants';
import { useTransition, useState, useEffect } from 'react';

export function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category');
    const currentRadius = searchParams.get('radius') || '15';

    // Local state for radius to allow smooth sliding before URL update
    const [radiusValue, setRadiusValue] = useState<number>(currentRadius === 'all' ? 51 : parseInt(currentRadius));

    // Debounce radius updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (radiusValue === 51 && currentRadius !== 'all') {
                updateParams({ radius: 'all' });
            } else if (radiusValue <= 50 && radiusValue.toString() !== currentRadius) {
                updateParams({ radius: radiusValue.toString() });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [radiusValue]);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });

        startTransition(() => {
            router.push(`/tasks?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 space-y-8 h-fit lg:sticky lg:top-24 shadow-sm">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Filter</h3>
                {(currentSearch || currentCategory || currentRadius !== 'all') && (
                    <button
                        onClick={() => router.push('/tasks')}
                        className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                        <X size={12} /> Zurücksetzen
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Suche</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Was suchst du?"
                        defaultValue={currentSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateParams({ search: e.currentTarget.value });
                            }
                        }}
                        onBlur={(e) => updateParams({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <MapPin size={14} className="text-amber-600" />
                        Umkreis
                    </label>
                    <span className="text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-full">
                        {radiusValue > 50 ? 'Alle' : `${radiusValue} km`}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="51"
                    step="1"
                    value={radiusValue}
                    onChange={(e) => setRadiusValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                    <span>1 km</span>
                    <span>∞</span>
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Kategorie</label>
                    <span className="text-[10px] text-gray-400 font-medium">Mehrfachauswahl möglich</span>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={!currentCategory}
                            onChange={() => updateParams({ category: null })}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <span className={`text-sm ${!currentCategory ? 'font-bold text-amber-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                            Alle Kategorien
                        </span>
                    </label>
                    {TASK_CATEGORIES.map((cat) => {
                        const isSelected = currentCategory?.split(',').includes(cat.slug);
                        return (
                            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!isSelected}
                                    onChange={(e) => {
                                        const current = currentCategory ? currentCategory.split(',') : [];
                                        let newCategories;
                                        if (e.target.checked) {
                                            newCategories = [...current, cat.slug];
                                        } else {
                                            newCategories = current.filter(c => c !== cat.slug);
                                        }
                                        updateParams({ category: newCategories.length > 0 ? newCategories.join(',') : null });
                                    }}
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <span className={`text-sm ${isSelected ? 'font-bold text-amber-600' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                                    {cat.name}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {isPending && (
                <div className="text-center text-xs text-gray-400 animate-pulse">
                    Aktualisiere...
                </div>
            )}
        </div>
    );
}
