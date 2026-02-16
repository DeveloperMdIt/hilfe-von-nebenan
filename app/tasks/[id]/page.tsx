import { db } from '../../../lib/db';
import { tasks, users, reviews } from '../../../lib/schema';
import { eq, and } from 'drizzle-orm';
import { MapPin, Clock, Crown, Star, ArrowLeft, CheckCircle2, MessageSquare, CreditCard, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { confirmTaskCompletion, submitReview } from '../../actions';
import { DeleteTaskButton } from "@/components/tasks/DeleteTaskButton";
import { formatName } from '../../../lib/utils';

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const taskId = params.id;

    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('userId')?.value;

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

    // Access Control: Only owner or admin can see flagged/rejected tasks
    const [currentUser] = currentUserId ? await db.select().from(users).where(eq(users.id, currentUserId)) : [null];
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = currentUserId === task.customerId;

    if (task.moderationStatus !== 'approved' && !isAdmin && !isOwner) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Inhalt wird geprüft</h1>
                <p className="text-gray-500">Dieser Auftrag befindet sich aktuell in der Moderations-Prüfung und ist nicht öffentlich zugänglich.</p>
                <Link href="/tasks" className="text-amber-600 hover:underline mt-4 inline-block">Zurück zur Übersicht</Link>
            </div>
        );
    }

    if (!task.isActive && !isAdmin && !isOwner) {
        return <div className="p-20 text-center">Dieser Auftrag ist nicht mehr aktiv.</div>;
    }

    // Fetch helper if assigned
    let helper = null;
    if (task.helperId) {
        const helperResult = await db.select().from(users).where(eq(users.id, task.helperId)).limit(1);
        helper = helperResult[0];
    }

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
                                    <span className="capitalize">
                                        {task.status === 'open' ? 'Offen' :
                                            task.status === 'paid' ? 'Bezahlt' :
                                                task.status}
                                    </span>
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
                                {formatName(requester?.fullName)}
                                {requester?.isHelperBadge && (
                                    <Crown size={18} className="text-amber-500 fill-amber-500" />
                                )}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">Mitglied seit {requester?.createdAt ? new Date(requester.createdAt).getFullYear() : '2026'}</p>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href={`/messages/${requester?.id}?taskId=${task.id}`}
                                    className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-all transition-colors shadow-sm"
                                >
                                    <MessageSquare size={18} />
                                    Nachricht senden
                                </Link>

                                {/* Payment Button for Seeker */}
                                {task.customerId === currentUserId && task.status === 'assigned' && (
                                    <form action={`/api/stripe/checkout/${task.id}`} method="POST">
                                        <button
                                            type="submit"
                                            className="w-full py-4 px-4 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20"
                                        >
                                            <CreditCard size={18} />
                                            Jetzt sicher bezahlen
                                        </button>
                                    </form>
                                )}

                                {/* Completion Workflow Buttons */}
                                {task.status !== 'closed' && task.status !== 'open' && (
                                    <>
                                        {/* If I am the customer and it's not closed yet */}
                                        {task.customerId === currentUserId && task.status !== 'completed_by_seeker' && (
                                            <form action={async () => {
                                                'use server';
                                                await confirmTaskCompletion(task.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    Als erledigt markieren
                                                </button>
                                            </form>
                                        )}

                                        {/* If I am the helper and I haven't confirmed yet */}
                                        {task.helperId === currentUserId && task.status !== 'completed_by_helper' && (
                                            <form action={async () => {
                                                'use server';
                                                await confirmTaskCompletion(task.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-sm"
                                                >
                                                    <CheckCircle2 size={18} />
                                                    Arbeit abgeschlossen
                                                </button>
                                            </form>
                                        )}
                                    </>
                                )}

                                {task.status === 'completed_by_helper' && task.customerId === currentUserId && (
                                    <p className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                        Helfer hat Auftrag als erledigt markiert. Bitte bestätigen.
                                    </p>
                                )}
                                {task.status === 'completed_by_seeker' && task.helperId === currentUserId && (
                                    <p className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                                        Auftraggeber hat Bestätigung angefordert.
                                    </p>
                                )}
                                {task.status === 'paid' && (
                                    <div className="py-3 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-100 dark:border-green-800">
                                        <CheckCircle2 size={18} />
                                        Bezahlt
                                    </div>
                                )}
                                {task.status === 'closed' && (
                                    <div className="py-3 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2">
                                        <CheckCircle2 size={18} className="text-green-500" />
                                        Abgeschlossen
                                    </div>
                                )}

                                {/* Management Actions for Owner/Admin */}
                                {(isOwner || isAdmin) && (
                                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                            <span>Verwaltung</span>
                                            {isOwner ? <span className="text-amber-600">Eigentümer</span> : <span className="text-red-600">Administrator</span>}
                                        </div>

                                        {task.moderationStatus === 'flagged' && (
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl mb-4">
                                                <p className="text-xs text-amber-800 dark:text-amber-400 font-bold flex items-center gap-2">
                                                    <ShieldAlert size={14} /> In Prüfung
                                                </p>
                                                <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-1">
                                                    Dein Inhalt wird aktuell auf Angemessenheit geprüft. Solange ist er nur für dich sichtbar.
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href={`/tasks/${task.id}/edit`}
                                                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-sm"
                                            >
                                                <Pencil size={16} /> Bearbeiten
                                            </Link>
                                            <DeleteTaskButton taskId={task.id} />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                        <span>Profil-Status</span>
                                        <Link href="/profile" className="text-amber-600 hover:underline">Zum Profil</Link>
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
