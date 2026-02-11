import { db } from '../../../lib/db';
import { tasks, users, reviews } from '../../../lib/schema';
import { eq, and } from 'drizzle-orm';
import { MapPin, Clock, Crown, Star, ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { submitReview } from '../../actions';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const taskId = params.id;

    const result = await db
        .select({
            task: tasks,
            requester: users,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.customerId, users.id))
        .where(eq(tasks.id, taskId))
        .limit(1);

    const data = result[0];

    if (!data) {
        return <div className="p-20 text-center">Auftrag nicht gefunden.</div>;
    }

    const { task, requester } = data;

    // Fetch existing reviews for this task
    const taskReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.taskId, taskId));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/tasks" className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Zurück zur Übersicht
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/10">
                                    {task.category || 'Allgemein'}
                                </span>
                                <div className="text-right">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter mb-1">Budget</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">
                                        {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </p>
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                {task.title}
                            </h1>

                            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                {task.description}
                            </div>

                            <div className="flex items-center gap-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock size={16} className="text-amber-500" />
                                    <span>Eingestellt am {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unbekannt'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="capitalize">{task.status === 'open' ? 'Offen' : task.status}</span>
                                </div>
                            </div>
                        </section>

                        {/* Rating Section */}
                        <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <Star className="text-amber-500 fill-amber-500" size={24} />
                                Bewertung abgeben
                            </h2>

                            {taskReviews.length > 0 ? (
                                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bereits bewertet:</p>
                                    {taskReviews.map((rev) => (
                                        <div key={rev.id} className="text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className={i < rev.rating ? 'fill-current' : ''} />
                                                ))}
                                            </div>
                                            <p className="italic">"{rev.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <form action={submitReview} className="space-y-4">
                                    <input type="hidden" name="taskId" value={taskId} />
                                    <input type="hidden" name="revieweeId" value={requester?.id || ''} />
                                    <input type="hidden" name="type" value="helper" />

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Wie zufrieden warst du?</label>
                                        <select name="rating" className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500">
                                            <option value="5">⭐⭐⭐⭐⭐ Hervorragend</option>
                                            <option value="4">⭐⭐⭐⭐ Sehr gut</option>
                                            <option value="3">⭐⭐⭐ Befriedigend</option>
                                            <option value="2">⭐⭐ Ausreichend</option>
                                            <option value="1">⭐ Mangelhaft</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Kommentar</label>
                                        <textarea
                                            name="comment"
                                            rows={3}
                                            placeholder="Beschreibe deine Erfahrung..."
                                            className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-amber-900/20"
                                    >
                                        Bewertung abschicken
                                    </button>
                                </form>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Requester Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center text-amber-600">
                                <Link href="#" className="font-black text-2xl uppercase">
                                    {requester?.fullName?.charAt(0) || '?'}
                                </Link>
                            </div>

                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
                                {requester?.fullName || 'Anonymer Nutzer'}
                                {requester?.isHelperBadge && (
                                    <Crown size={18} className="text-amber-500 fill-amber-500" />
                                )}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">Mitglied seit {requester?.createdAt ? new Date(requester.createdAt).getFullYear() : '2026'}</p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href={`/messages/${requester?.id}`}
                                    className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-all"
                                >
                                    <MessageSquare size={18} />
                                    Nachricht senden
                                </Link>
                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        <span>Status</span>
                                        <span className="text-green-500">Verifiziert</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[90%]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-600 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-900/30">
                            <h4 className="font-black mb-2 flex items-center gap-2 text-lg">
                                <Star size={20} className="fill-white" />
                                Premium-Vorteil
                            </h4>
                            <p className="text-sm text-amber-50 font-medium leading-relaxed">
                                Verifizierte Helfer erhalten 30% mehr Aufträge und genießen vollen Käuferschutz.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
