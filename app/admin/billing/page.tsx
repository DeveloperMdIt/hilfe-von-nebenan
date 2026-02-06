import { DollarSign, TrendingUp, CreditCard, Download } from 'lucide-react';

export default function AdminBillingPage() {
    // Mock data
    const transactions = [
        { id: 'TX-1234', user: 'Max Mustermann', amount: '15,00 €', status: 'completed', date: '01.02.2026', method: 'Stripe' },
        { id: 'TX-1235', user: 'Maria Müller', amount: '25,50 €', status: 'completed', date: '01.02.2026', method: 'Paypal' },
        { id: 'TX-1236', user: 'Hans Dampf', amount: '10,00 €', status: 'pending', date: '31.01.2026', method: 'Stripe' },
    ];

    return (
        <div className="p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Abrechnung & Finanzen</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Gesamtumsatz (Monat)</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">1.240,50 €</h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                        <TrendingUp size={16} className="mr-1" />
                        +12% zum Vormonat
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Offene Posten</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">45,00 €</h3>
                        </div>
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">3 Transaktionen ausstehend</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Letzte Transaktionen</h3>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors">
                        <Download size={14} />
                        Exportieren
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nutzer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Methode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tx.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{tx.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.method}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {tx.status === 'completed' ? 'Bezahlt' : 'Ausstehend'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
