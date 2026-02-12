import { db } from '@/lib/db';
import { users, tasks } from '@/lib/schema';
import { eq, and, gte, lte, sum, count, desc } from 'drizzle-orm';
import { AlertTriangle, Download, FileText, User } from 'lucide-react';

export default async function TaxReportingPage() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Get stats for all helpers with at least one closed task this year
    const helperStats = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        streetAddress: users.streetAddress,
        dateOfBirth: users.dateOfBirth,
        taxId: users.taxId,
        bankDetails: users.bankDetails,
        taskCount: count(tasks.id),
        totalRevenue: sum(tasks.priceCents),
    })
        .from(users)
        .innerJoin(tasks, eq(users.id, tasks.helperId))
        .where(
            and(
                eq(tasks.status, 'closed'),
                gte(tasks.createdAt, startOfYear),
                lte(tasks.createdAt, endOfYear)
            )
        )
        .groupBy(users.id)
        .orderBy(desc(count(tasks.id)))
        .execute();

    // PStTG Thresholds
    const LIMIT_TX = 30;
    const LIMIT_REVENUE = 200000; // 2000 EUR
    const WARNING_TX = 25;
    const WARNING_REVENUE = 150000; // 1500 EUR

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Steuerlicher Bericht (PStTG)</h1>
                    <p className="text-gray-500 dark:text-zinc-400">Übersicht der Transaktionen für das Kalenderjahr {currentYear}</p>
                </div>
                <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
                    <Download size={18} />
                    Export für BZSt (CSV)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Aktive Helfer (dieses Jahr)</div>
                    <div className="text-3xl font-bold dark:text-white">{helperStats.length}</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Meldepflichtige User</div>
                    <div className="text-3xl font-bold text-red-600">
                        {helperStats.filter(h => Number(h.taskCount) >= LIMIT_TX || Number(h.totalRevenue) >= LIMIT_REVENUE).length}
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Warnbereich (ab 25 TX/1500€)</div>
                    <div className="text-3xl font-bold text-amber-600">
                        {helperStats.filter(h =>
                            (Number(h.taskCount) >= WARNING_TX && Number(h.taskCount) < LIMIT_TX) ||
                            (Number(h.totalRevenue) >= WARNING_REVENUE && Number(h.totalRevenue) < LIMIT_REVENUE)
                        ).length}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaktionen</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bruttoumsatz</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daten</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktion</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {helperStats.map((helper) => {
                            const txCount = Number(helper.taskCount);
                            const revenue = Number(helper.totalRevenue) / 100;
                            const isReportable = txCount >= LIMIT_TX || (revenue * 100) >= LIMIT_REVENUE;
                            const isWarning = txCount >= WARNING_TX || (revenue * 100) >= WARNING_REVENUE;

                            // Check data completeness
                            const [fullHelper] = helperStats.filter(h => h.id === helper.id); // Re-fetch or use helper from list if data included
                            // Since we join tasks, we might need to fetch full user or select more fields in the initial query
                            // Let's assume we select more fields in the query

                            return (
                                <tr key={helper.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                <User size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{helper.fullName}</div>
                                                <div className="text-xs text-gray-500 dark:text-zinc-400">{helper.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-zinc-300">
                                        {txCount} / 30
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold dark:text-white">
                                        {revenue.toFixed(2)} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(isWarning || isReportable) && (
                                            <div className="flex gap-1">
                                                <span title="Adresse" className={`w-2 h-2 rounded-full ${(helper as any).streetAddress ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span title="Geburtsdatum" className={`w-2 h-2 rounded-full ${(helper as any).dateOfBirth ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span title="Steuer-ID" className={`w-2 h-2 rounded-full ${(helper as any).taxId ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span title="Bankdaten" className={`w-2 h-2 rounded-full ${(helper as any).bankDetails ? 'bg-green-500' : 'bg-red-500'}`} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isReportable ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                <AlertTriangle size={14} />
                                                Meldepflichtig
                                            </span>
                                        ) : isWarning ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                <AlertTriangle size={14} />
                                                Warnbereich
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Konform
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 justify-end ml-auto">
                                            <FileText size={16} />
                                            Belege
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {helperStats.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                    Noch keine abgeschlossenen Transaktionen in diesem Jahr.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
