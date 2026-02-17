import { db } from '@/lib/db';
import { reports, users, tasks } from '@/lib/schema';
import { desc, eq, isNull } from 'drizzle-orm';
import { ShieldAlert, User, ListTodo, CheckCircle2, XCircle, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { resolveReport, rejectReport } from '@/app/actions';

export default async function AdminReportsPage() {
    // Fetch pending reports
    const pendingReports = await db
        .select({
            report: reports,
            reporter: users,
        })
        .from(reports)
        .leftJoin(users, eq(reports.reporterId, users.id))
        .where(eq(reports.status, 'pending'))
        .orderBy(desc(reports.createdAt));

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ShieldAlert className="text-red-500" />
                    Moderation & Meldungen
                </h1>
                <span className="text-sm font-medium px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                    Offen: {pendingReports.length}
                </span>
            </div>

            {pendingReports.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-20 text-center border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Alles im grünen Bereich!</h2>
                    <p className="text-gray-500">Es liegen aktuell keine unbearbeiteten Meldungen vor.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingReports.map(({ report, reporter }) => (
                        <div key={report.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Section: Metadata */}
                                <div className="lg:w-1/3 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gemeldetes Objekt</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {report.targetTaskId ? 'Auftrag' : 'Nutzerprofil'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-zinc-800">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gemeldet von</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                                    {reporter?.fullName?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{reporter?.fullName || 'Unbekannter Nutzer'}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{reporter?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Datum</p>
                                            <p className="text-xs font-medium flex items-center gap-2 text-gray-600">
                                                <Calendar size={12} />
                                                {report.createdAt ? new Date(report.createdAt).toLocaleString('de-DE') : 'Unbekannt'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Reason & details */}
                                <div className="flex-1 flex flex-col">
                                    <div className="bg-gray-50 dark:bg-zinc-950/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                            <MessageSquare size={12} /> Meldegrund & Details
                                        </p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                            {report.reason}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex flex-wrap items-center gap-3">
                                        <Link
                                            href={report.targetTaskId ? `/admin/tasks?id=${report.targetTaskId}` : `/admin/users/${report.targetUserId}`}
                                            className="flex items-center gap-2 text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                            Target prüfen
                                        </Link>

                                        <div className="flex-1"></div>

                                        <form action={async () => {
                                            'use server';
                                            await resolveReport(report.id, 'Erfolgreich geprüft.');
                                        }}>
                                            <button className="flex items-center gap-2 text-xs font-bold bg-green-50 dark:bg-green-900/20 text-green-600 px-4 py-2.5 rounded-xl hover:bg-green-100 transition-colors">
                                                <CheckCircle2 size={14} />
                                                Als erledigt markieren
                                            </button>
                                        </form>

                                        <form action={async () => {
                                            'use server';
                                            await rejectReport(report.id);
                                        }}>
                                            <button className="flex items-center gap-2 text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors">
                                                <XCircle size={14} />
                                                Meldung ablehnen
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
