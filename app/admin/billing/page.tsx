import { db } from '@/lib/db';
import { tasks, users } from '@/lib/schema';
import { desc, eq, or, sum } from 'drizzle-orm';
import { DollarSign, TrendingUp, CreditCard, Download, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function AdminBillingPage() {
    // Fetch real transactions (only paid or closed tasks)
    const paidTasks = await db.select({
        id: tasks.id,
        title: tasks.title,
        priceCents: tasks.priceCents,
        commissionCents: tasks.commissionCents,
        payoutCents: tasks.payoutCents,
        status: tasks.status,
        createdAt: tasks.createdAt,
        customerName: users.fullName,
    })
        .from(tasks)
        .leftJoin(users, eq(tasks.customerId, users.id))
        .where(or(eq(tasks.status, 'paid'), eq(tasks.status, 'closed')))
        .orderBy(desc(tasks.createdAt));

    // Calculate total revenue (commission cents)
    const totalRevenueResult = await db.select({
        val: sum(tasks.commissionCents)
    })
        .from(tasks)
        .where(or(eq(tasks.status, 'paid'), eq(tasks.status, 'closed')));

    const totalRevenueCents = Number(totalRevenueResult[0]?.val || 0);

    // Calculate pending payouts (assigned but not yet paid)
    const pendingResult = await db.select({
        val: sum(tasks.priceCents)
    })
        .from(tasks)
        .where(eq(tasks.status, 'assigned'));

    const pendingCents = Number(pendingResult[0]?.val || 0);

    return (
        <div className="p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Abrechnung & Finanzen</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Plattform-Umsatz (Gesamt)</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {(totalRevenueCents / 100).toFixed(2)} €
                            </h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Offene Aufträge (Volumen)</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {(pendingCents / 100).toFixed(2)} €
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Volumen aus laufenden Aufträgen</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Abgeschlossene Transaktionen</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auftrag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunde</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provision</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rechnung</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {paidTasks.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {tx.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.customerName || 'Gelöschter User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                        {(tx.priceCents / 100).toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                        {(Number(tx.commissionCents || 0) / 100).toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.createdAt?.toLocaleDateString('de-DE')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <a
                                            href={`/api/invoices/${tx.id}`}
                                            className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium"
                                            target="_blank"
                                        >
                                            <FileText size={16} />
                                            PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {paidTasks.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                        Noch keine Transaktionen vorhanden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
