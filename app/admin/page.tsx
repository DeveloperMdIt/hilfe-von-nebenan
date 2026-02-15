import { db } from '../../lib/db';
import { users, tasks } from '../../lib/schema';
import { sql } from 'drizzle-orm';
import { Users, ListTodo, DollarSign, Activity } from 'lucide-react';

export default async function AdminDashboard() {
    // Fetch stats (using raw SQL for count to keep it concise, or helper functions)
    // Note: count() in Drizzle can be verbose, using sql implies cleaner raw queries for stats.
    const [userCount] = await db.execute(sql`SELECT count(*) as count FROM ${users}`);
    const [taskCount] = await db.execute(sql`SELECT count(*) as count FROM ${tasks}`);
    const [openTaskCount] = await db.execute(sql`SELECT count(*) as count FROM ${tasks} WHERE status = 'open'`);

    const stats = [
        { name: 'Nutzer Gesamt', value: Number(userCount?.count || 0), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Aufträge Gesamt', value: taskCount.count, icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Offene Aufträge', value: openTaskCount.count, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
        // Placeholder for revenue or other metrics
        { name: 'Umsatz (Simuliert)', value: '0,00 €', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                            <p className="text-2xl font-bold mt-1">{String(stat.value)}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Schnellzugriff</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="/admin/users" className="p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-amber-500 hover:text-amber-600 cursor-pointer transition-colors bg-white dark:bg-zinc-900 group">
                        <span className="font-medium group-hover:scale-105 transition-transform">+ Nutzer verwalten</span>
                    </a>
                    {/* Add more widgets here later */}
                </div>
            </div>
        </div>
    );
}
