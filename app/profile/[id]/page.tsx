import { db } from '@/lib/db';
import { users, tasks } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Crown, CheckCircle2, Clock, MapPin, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReportButton } from '@/components/utils/ReportButton';

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = userResult[0];

    if (!user) {
        notFound();
    }

    // Fetch open tasks by this user
    const userTasks = await db.select().from(tasks).where(
        and(
            eq(tasks.customerId, id),
            eq(tasks.status, 'open')
        )
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/messages" className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Zurück
                </Link>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Public Profile Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full mx-auto mb-4 flex items-center justify-center text-amber-600">
                                <span className="font-black text-3xl uppercase">
                                    {user.fullName?.charAt(0) || '?'}
                                </span>
                            </div>

                            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1 flex items-center justify-center gap-2">
                                {user.fullName}
                                {user.isHelperBadge && (
                                    <Crown size={22} className="text-amber-500 fill-amber-500" />
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mb-6">
                                Mitglied seit {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
                            </p>

                            <div className="pt-6 border-t border-gray-50 dark:border-zinc-800 space-y-4 text-left">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Status</span>
                                    {user.isVerified ? (
                                        <span className="text-green-500 flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Verifiziert
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Basis Nutzer</span>
                                    )}
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                                    <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Star size={12} className="fill-amber-500 border-none" />
                                        Über mich
                                    </p>
                                    <p className="text-xs text-amber-900/70 dark:text-amber-100/60 leading-relaxed italic">
                                        {user.bio || 'Dieser Nutzer hat noch keine Beschreibung hinzugefügt.'}
                                    </p>
                                </div>

                                <div className="pt-4 flex justify-center border-t border-gray-50 dark:border-zinc-800">
                                    <ReportButton targetId={user.id} type="user" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 dark:bg-white rounded-[2rem] p-6 text-white dark:text-black shadow-xl">
                            <h4 className="font-black mb-3 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-amber-500" />
                                Sicherheit
                            </h4>
                            <p className="text-xs opacity-70 leading-relaxed font-medium">
                                Alle Zahlungen auf Nachbarschafts-Helden sind durch unseren Käuferschutz abgesichert.
                            </p>
                        </div>
                    </div>

                    {/* Main Content: Open Tasks */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 px-4">
                            Aktuelle Gesuche von {user.fullName?.split(' ')[0]}
                        </h2>

                        <div className="space-y-4">
                            {userTasks.length > 0 ? (
                                userTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        href={`/tasks/${task.id}`}
                                        className="block bg-white dark:bg-zinc-900 p-6 rounded-[1.5rem] border border-gray-100 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {task.category || 'Allgemein'}
                                            </span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors mb-2">
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                            {task.description}
                                        </p>
                                    </Link>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 p-12 rounded-[2rem] border border-dashed border-gray-200 dark:border-zinc-800 text-center">
                                    <p className="text-gray-500 font-medium italic">Momentan keine offenen Anzeigen.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
