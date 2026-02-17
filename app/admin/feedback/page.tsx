import { db } from '../../../lib/db';
import { feedback, users } from '../../../lib/schema';
import { eq, desc } from 'drizzle-orm';
import { MessageSquare, Bug, Lightbulb, MessageCircle, Clock, User, CheckCircle2 } from 'lucide-react';
import { formatName } from '../../../lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminFeedbackPage() {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('userId')?.value;

    if (!currentUserId) redirect('/login');

    const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
    if (currentUser?.role !== 'admin') redirect('/');

    const allFeedback = await db
        .select({
            feedback: feedback,
            user: users,
        })
        .from(feedback)
        .leftJoin(users, eq(feedback.userId, users.id))
        .orderBy(desc(feedback.createdAt));

    return (
        <div className="p-8 max-w-7xl mx-auto font-[family-name:var(--font-geist-sans)]">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Feedback & Bugs</h1>
                    <p className="text-gray-500 font-medium">Alle Rückmeldungen von Beta-Testern im Überblick.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-xl text-purple-600 dark:text-purple-400 font-black text-sm uppercase tracking-widest outline outline-1 outline-purple-200 dark:outline-purple-800">
                    {allFeedback.length} Einträge
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFeedback.map((item) => {
                    const Icon = item.feedback.type === 'bug' ? Bug : item.feedback.type === 'idea' ? Lightbulb : MessageCircle;
                    const typeLabel = item.feedback.type === 'bug' ? 'Bug / Fehler' : item.feedback.type === 'idea' ? 'Wunsch / Idee' : 'Sonstiges';
                    const colorClass = item.feedback.type === 'bug' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : item.feedback.type === 'idea' ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';

                    return (
                        <div key={item.feedback.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${colorClass} transition-transform group-hover:scale-110`}>
                                    <Icon size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {new Date(item.feedback.createdAt!).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${colorClass.split(' ')[0]}`}>
                                    {typeLabel}
                                </span>
                                <p className="text-gray-900 dark:text-white font-medium leading-relaxed whitespace-pre-wrap">
                                    {item.feedback.content}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-500 font-black text-xs">
                                        {item.user?.fullName?.charAt(0) || '?'}
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-bold text-gray-900 dark:text-white">{formatName(item.user?.fullName) || 'Anonymer Gast'}</p>
                                        <p className="text-gray-500 line-clamp-1">{item.user?.email || 'Keine Mail'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {/* Actions could go here (e.g. mark as resolved) */}
                                    <div className="p-2 text-gray-300 hover:text-green-500 transition-colors cursor-not-allowed">
                                        <CheckCircle2 size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {allFeedback.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <MessageSquare size={40} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Kein Feedback vorhanden</h2>
                        <p className="text-gray-500">Sobald Nutzer Rückmeldungen geben, erscheinen sie hier.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
