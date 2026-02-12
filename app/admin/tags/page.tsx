import { db } from '@/lib/db';
import { tags, users } from '@/lib/schema';
import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import { approveTag, deleteTag } from '@/app/actions';
import { Check, Edit2, AlertCircle } from 'lucide-react';
import DeleteTagButton from '@/components/admin/delete-tag-button';
import TagFilters from '@/components/admin/tag-filters';

export default async function AdminTagsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const q = typeof params.q === 'string' ? params.q : undefined;
    const category = typeof params.category === 'string' ? params.category : undefined;
    const status = typeof params.status === 'string' ? params.status : undefined;

    // Filter conditions
    const conditions = [];
    if (q) conditions.push(ilike(tags.name, `%${q}%`));
    if (category) conditions.push(eq(tags.category, category));
    if (status) {
        conditions.push(eq(tags.isApproved, status === 'active'));
    }

    const allTags = await db.select({
        id: tags.id,
        name: tags.name,
        category: tags.category,
        isApproved: tags.isApproved,
        createdAt: tags.createdAt,
        suggestedByEmail: users.email,
        suggestedByName: users.fullName,
    })
        .from(tags)
        .leftJoin(users, eq(tags.suggestedById, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tags.createdAt))
        .execute();

    // Fetch all categories for the filter dropdown
    const distinctCategories = await db.selectDistinct({ category: tags.category }).from(tags).execute();
    const categoriesList = distinctCategories.map(c => c.category).filter(Boolean) as string[];

    const unapprovedCount = allTags.filter(t => !t.isApproved).length;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Tags & Kategorien</h1>
                    <p className="text-gray-500 dark:text-zinc-400">Interessen und Skills der Nutzer verwalten ({allTags.length} Tags)</p>
                </div>
                {unapprovedCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        <AlertCircle size={16} />
                        {unapprovedCount} neue Vorschläge
                    </div>
                )}
            </div>

            <TagFilters categories={categoriesList} />

            <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vorgeschlagen von</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {allTags.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-zinc-400">
                                    Keine Tags gefunden, die den Filtern entsprechen.
                                </td>
                            </tr>
                        ) : (
                            allTags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {tag.isApproved ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">Aktiv</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs">Vorschlag</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                                        {tag.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                        {tag.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
                                        {tag.suggestedByEmail ? (
                                            <div>
                                                <p className="font-medium text-gray-700 dark:text-zinc-300">{tag.suggestedByName}</p>
                                                <p className="text-xs">{tag.suggestedByEmail}</p>
                                            </div>
                                        ) : (
                                            <span className="italic text-xs">System</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            {!tag.isApproved && (
                                                <form action={async () => { 'use server'; await approveTag(tag.id); }}>
                                                    <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Bestätigen">
                                                        <Check size={18} />
                                                    </button>
                                                </form>
                                            )}
                                            <DeleteTagButton tagId={tag.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
