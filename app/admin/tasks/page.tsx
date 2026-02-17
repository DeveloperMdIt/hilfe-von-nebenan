import { db } from '../../../lib/db';
import { tasks } from '../../../lib/schema';
import { desc, eq, and } from 'drizzle-orm';
import { deleteTask, approveTask, rejectTask, toggleTaskActive } from '../../actions';
import { Trash2, ListTodo, Check, X, ShieldAlert, EyeOff, Eye } from 'lucide-react';

export default async function AdminTasksPage() {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));

    const onlineCount = allTasks.filter(t => t.moderationStatus === 'approved' && t.isActive).length;
    const flaggedCount = allTasks.filter(t => t.moderationStatus === 'flagged').length;
    const autoRejectedCount = allTasks.filter(t => t.moderationStatus === 'rejected').length;

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ListTodo className="text-purple-600" />
                    Auftragsverwaltung
                </h1>
                <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-400">
                    Gesamt: {allTasks.length}
                </span>
            </div>

            {/* Moderation Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 p-4 rounded-2xl">
                    <div className="text-2xl font-black text-green-700 dark:text-green-400">{onlineCount}</div>
                    <div className="text-xs font-bold text-green-600/70 uppercase tracking-wider">Beiträge online</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl">
                    <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{flaggedCount}</div>
                    <div className="text-xs font-bold text-amber-600/70 uppercase tracking-wider">Gemeldet / Zur Prüfung</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl">
                    <div className="text-2xl font-black text-red-700 dark:text-red-400">{autoRejectedCount}</div>
                    <div className="text-xs font-bold text-red-600/70 uppercase tracking-wider">Autotest fehlgeschlagen</div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800 table-fixed">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Titel & Beschreibung</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Sichtbarkeit</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {allTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate" title={task.title}>{task.title}</div>
                                    <div className="text-xs text-gray-500 truncate mt-1" title={task.description}>{task.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${task.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                            task.moderationStatus === 'flagged' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {task.moderationStatus}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{task.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {task.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                                            <Eye size={14} /> Aktiv
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 font-bold text-xs uppercase">
                                            <EyeOff size={14} /> Inaktiv
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        {task.moderationStatus !== 'approved' && (
                                            <form action={async () => { await approveTask(task.id); }}>
                                                <button type="submit" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Freigeben">
                                                    <Check size={18} />
                                                </button>
                                            </form>
                                        )}
                                        {task.moderationStatus !== 'rejected' && (
                                            <form action={async () => { await rejectTask(task.id); }}>
                                                <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Ablehnen">
                                                    <X size={18} />
                                                </button>
                                            </form>
                                        )}
                                        <form action={async () => { await toggleTaskActive(task.id); }}>
                                            <button type="submit" className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors" title={task.isActive ? "Deaktivieren" : "Aktivieren"}>
                                                {task.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </form>
                                        <form action={async (formData) => {
                                            'use server';
                                            await deleteTask(formData);
                                        }}>
                                            <input type="hidden" name="id" value={task.id} />
                                            <button type="submit" className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Löschen">
                                                <Trash2 size={18} />
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {allTasks.map((task) => (
                    <div key={task.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate" title={task.title}>{task.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{task.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${task.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                    task.moderationStatus === 'flagged' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {task.moderationStatus}
                                </span>
                                {!task.isActive && (
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Inaktiv</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm border-t border-b border-gray-50 dark:border-zinc-800 py-3 mt-auto">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Preis</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
                            <div className="flex justify-end gap-2 flex-1">
                                {task.moderationStatus !== 'approved' && (
                                    <form action={async () => { await approveTask(task.id); }}>
                                        <button type="submit" className="p-2 bg-green-50 text-green-600 rounded-lg" title="Freigeben">
                                            <Check size={18} />
                                        </button>
                                    </form>
                                )}
                                <form action={async () => { await toggleTaskActive(task.id); }}>
                                    <button type="submit" className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                                        {task.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </form>
                                <form action={async (formData) => {
                                    'use server';
                                    await deleteTask(formData);
                                }}>
                                    <input type="hidden" name="id" value={task.id} />
                                    <button type="submit" className="p-2 bg-red-50 text-red-600 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

