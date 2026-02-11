import { db } from '../../../lib/db';
import { reviews, tasks, users } from '../../../lib/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Star, Trash2, ExternalLink, ShieldAlert } from 'lucide-react';
import { deleteReview } from '../../actions';
import Link from 'next/link';

export default async function AdminReviewsPage() {
    const allReviews = await db
        .select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            taskTitle: tasks.title,
            taskId: tasks.id,
            reviewerName: users.fullName,
            revieweeName: sql<string>`(SELECT full_name FROM users WHERE id = ${reviews.revieweeId})`,
        })
        .from(reviews)
        .leftJoin(tasks, eq(reviews.taskId, tasks.id))
        .leftJoin(users, eq(reviews.reviewerId, users.id))
        .orderBy(desc(reviews.createdAt));

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Bewertungs-Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Hier können Sie Nutzerbewertungen moderieren und verwalten.</p>
                </div>
                <div
                    className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-sm font-bold cursor-help"
                    title="In diesem Modus kannst du alle Bewertungen sehen und bei Bedarf (z.B. Beleidigungen) löschen."
                >
                    <ShieldAlert size={18} />
                    Moderations-Modus aktiv
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Datum</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Auftrag</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Von / Für</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Bewertung</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Kommentar</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {allReviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                                                {review.taskTitle || 'Gelöschter Auftrag'}
                                            </span>
                                            {review.taskId && (
                                                <Link href={`/tasks/${review.taskId}`} className="text-amber-600 hover:text-amber-500">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-900 dark:text-white">Von: {review.reviewerName || 'Unbekannt'}</p>
                                            <p className="text-gray-500">Für: {review.revieweeName || 'Unbekannt'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-0.5 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'opacity-20'} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-1 max-w-[200px]">
                                            "{review.comment || 'Kein Kommentar'}"
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <form action={deleteReview}>
                                            <input type="hidden" name="id" value={review.id} />
                                            <button className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all" title="Löschen">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {allReviews.length === 0 && (
                    <div className="p-20 text-center text-gray-500 font-medium">
                        Bisher wurden noch keine Bewertungen abgegeben.
                    </div>
                )}
            </div>
        </div>
    );
}
