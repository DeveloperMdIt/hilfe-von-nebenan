'use client';

import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TASK_CATEGORIES } from '@/lib/constants';
import { useTransition, useState, useEffect } from 'react';

export function FilterSidebar({ className, variant = 'vertical' }: { className?: string; variant?: 'vertical' | 'horizontal' }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category');
    const currentRadius = searchParams.get('radius') || '15';

    const [radiusValue, setRadiusValue] = useState<number>(currentRadius === 'all' ? 51 : parseInt(currentRadius));

    useEffect(() => {
        const timer = setTimeout(() => {
            if (radiusValue === 51 && currentRadius !== 'all') {
                updateParams({ radius: 'all' });
            } else if (radiusValue <= 50 && radiusValue.toString() !== currentRadius) {
                updateParams({ radius: radiusValue.toString() });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [radiusValue, currentRadius]);

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

    if (variant === 'horizontal') {
        return (
            <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-4 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col md:flex-row items-center gap-6 ${className}`}>
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Was suchst du?"
                        defaultValue={currentSearch}
                        onKeyDown={(e) => e.key === 'Enter' && updateParams({ search: e.currentTarget.value })}
                        onBlur={(e) => updateParams({ search: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                    />
                </div>

                {/* Radius */}
                <div className="flex items-center gap-4 min-w-[200px] w-full md:w-auto px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-transparent">
                    <div className="flex flex-col gap-1 flex-1">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Umkreis</span>
                            <span className="text-amber-600">{radiusValue > 50 ? 'Alle' : `${radiusValue}km`}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="51"
                            value={radiusValue}
                            onChange={(e) => setRadiusValue(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                    </div>
                </div>

                {/* Categories Dropdown */}
                <div className="relative group min-w-[180px]">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300 ${currentCategory
                            ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/20'
                            : 'bg-gray-50 dark:bg-zinc-800 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                            }`}
                    >
                        <div className="flex flex-col items-start">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${currentCategory ? 'text-amber-100' : 'text-gray-400'}`}>
                                Kategorien
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest truncate max-w-[120px]">
                                {currentCategory ? `${currentCategory.split(',').length} Ausgewählt` : 'Alle Anzeigen'}
                            </span>
                        </div>
                        <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                    </button>

                    {isDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute top-[calc(100%+10px)] left-0 w-64 max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200 no-scrollbar">
                                <label className="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={!currentCategory}
                                        onChange={() => {
                                            updateParams({ category: null });
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-200 dark:border-zinc-700 rounded"
                                    />
                                    <span className={`text-[10px] uppercase tracking-widest font-black transition-colors ${!currentCategory ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                                        Alle anzeigen
                                    </span>
                                </label>
                                <div className="h-px bg-gray-50 dark:bg-zinc-800 my-2 mx-3" />
                                {TASK_CATEGORIES.map((cat) => {
                                    const isSelected = currentCategory?.split(',').includes(cat.slug);
                                    return (
                                        <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
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
                                                className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-200 dark:border-zinc-700 rounded"
                                            />
                                            <span
                                                className={`text-[10px] uppercase tracking-widest font-black transition-colors ${isSelected ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'} line-clamp-1`}
                                                title={cat.name}
                                            >
                                                {cat.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {isPending && <Loader2 className="animate-spin text-amber-600 shrink-0" size={20} />}
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 space-y-8 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col max-h-[calc(100vh-120px)] lg:sticky lg:top-24 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">Filter</h3>
                {(currentSearch || currentCategory || currentRadius !== 'all') && (
                    <button
                        onClick={() => router.push('/tasks')}
                        className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                        <X size={10} /> Reset
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="space-y-3 shrink-0">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direktsuche</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Was suchst du?"
                        defaultValue={currentSearch}
                        onKeyDown={(e) => e.key === 'Enter' && updateParams({ search: e.currentTarget.value })}
                        onBlur={(e) => updateParams({ search: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
                    />
                </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <MapPin size={12} className="text-amber-600" />
                        Umkreis
                    </label>
                    <span className="text-xs font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/30">
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
                    className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
            </div>

            {/* Categories */}
            <div className="flex flex-col min-h-0 space-y-4">
                <div className="flex justify-between items-center shrink-0">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Kategorien</label>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-0 no-scrollbar">
                    <label className="flex items-center gap-3 cursor-pointer group py-1">
                        <input
                            type="checkbox"
                            checked={!currentCategory}
                            onChange={() => updateParams({ category: null })}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-200 dark:border-zinc-700 rounded"
                        />
                        <span className={`text-xs uppercase tracking-widest font-black transition-colors ${!currentCategory ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`}>
                            Alle anzeigen
                        </span>
                    </label>
                    {TASK_CATEGORIES.map((cat) => {
                        const isSelected = currentCategory?.split(',').includes(cat.slug);
                        return (
                            <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-1">
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
                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-gray-200 dark:border-zinc-700 rounded"
                                />
                                <span
                                    className={`text-xs uppercase tracking-widest font-black transition-colors ${isSelected ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'} line-clamp-1`}
                                    title={cat.name}
                                >
                                    {cat.name}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {isPending && (
                <div className="flex justify-center shrink-0">
                    <Loader2 className="animate-spin text-amber-600" size={20} />
                </div>
            )}
        </div>
    );
}

import { Loader2 } from 'lucide-react';
