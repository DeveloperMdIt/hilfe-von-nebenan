'use client';

import { useState } from 'react';
import { toggleUserTag, suggestTag } from '@/app/actions';
import { Plus, X, Check } from 'lucide-react';

interface Tag {
    id: string;
    name: string;
    category: string;
    isApproved: boolean;
}

interface TagSelectorProps {
    allTags: Tag[];
    userTagIds: string[];
    categories: string[];
}

export default function TagSelector({ allTags, userTagIds, categories }: TagSelectorProps) {
    const [newTagName, setNewTagName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Interesse');
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleToggle = async (tagId: string) => {
        await toggleUserTag(tagId);
    };

    const handleSuggest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        setIsSuggesting(true);
        const result = await suggestTag(newTagName.trim(), selectedCategory);
        if (result.success) {
            setNewTagName('');
        } else {
            alert(result.error);
        }
        setIsSuggesting(false);
    };

    return (
        <div className="space-y-8">
            {categories.map((category) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-zinc-800 pb-1">
                        {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {allTags
                            .filter((t) => t.category === category && (t.isApproved || userTagIds.includes(t.id)))
                            .map((tag) => {
                                const isSelected = userTagIds.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleToggle(tag.id)}
                                        className={`
                                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all
                                            ${isSelected
                                                ? 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}
                                        `}
                                    >
                                        {tag.name}
                                        {isSelected ? (
                                            <Check className="ml-1.5 h-3 w-3" />
                                        ) : (
                                            <Plus className="ml-1.5 h-3 w-3" />
                                        )}
                                        {!tag.isApproved && isSelected && (
                                            <span className="ml-1.5 text-[10px] opacity-70 italic">(wartet auf Prüfung)</span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            ))}

            <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Eigener Begriff hinzufügen</h4>
                <form onSubmit={handleSuggest} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Z.B. Imkern, Gassi gehen..."
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        type="submit"
                        disabled={isSuggesting}
                        className="inline-flex justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50"
                    >
                        {isSuggesting ? 'Lädt...' : 'Vorschlagen'}
                    </button>
                </form>
            </div>
        </div>
    );
}
