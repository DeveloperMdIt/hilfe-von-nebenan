import { db } from '../../../lib/db';
import { tasks } from '../../../lib/schema';
import { desc } from 'drizzle-orm';
import { deleteTask } from '../../actions';
import { Trash2, ListTodo } from 'lucide-react';

export default async function AdminTasksPage() {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));

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

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800 table-fixed">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/3">Titel & Beschreibung</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Kategorie</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Preis</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {task.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${task.status === 'open' ? 'bg-green-100 text-green-800' :
                                            task.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <form action={deleteTask}>
                                        <input type="hidden" name="id" value={task.id} />
                                        <button
                                            type="submit"
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Löschen"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
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
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1" title={task.title}>{task.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{task.description}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap ml-2">
                                {task.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm border-t border-b border-gray-50 dark:border-zinc-800 py-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Preis</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Status</span>
                                <span className={`font-bold text-xs uppercase ${task.status === 'open' ? 'text-green-600' :
                                        task.status === 'completed' ? 'text-gray-600' : 'text-amber-600'
                                    }`}>
                                    {task.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end mt-auto pt-2">
                            <form action={deleteTask} className="w-full">
                                <input type="hidden" name="id" value={task.id} />
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg transition-colors text-sm"
                                >
                                    <Trash2 size={16} />
                                    <span>Löschen</span>
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
