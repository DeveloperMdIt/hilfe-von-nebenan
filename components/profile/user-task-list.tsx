
import Link from 'next/link';
import { db } from '@/lib/db';
import { tasks, reviews } from '@/lib/schema';
import { eq, or, and, desc } from 'drizzle-orm';
import { getCategoryLabel } from '@/lib/constants';

export default async function UserTaskList({ userId }: { userId: string }) {
    // 1. Tasks created by the user (as Customer)
    const myRequests = await db.select().from(tasks)
        .where(eq(tasks.customerId, userId))
        .orderBy(desc(tasks.createdAt));

    // 2. Tasks where user is the helper (Logic: In a real app we'd have a 'helperId' on the task or an 'offers' table. 
    //    Current schema has `helperId` on tasks)
    const myJobs = await db.select().from(tasks)
        .where(eq(tasks.helperId, userId))
        .orderBy(desc(tasks.createdAt));

    return (
        <div className="space-y-12">
            {/* My Requests */}
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">Meine Anfragen</h3>
                {myRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm">Du hast noch keine Anfragen erstellt.</p>
                ) : (
                    <div className="overflow-hidden bg-white dark:bg-zinc-900 shadow sm:rounded-md ring-1 ring-gray-200 dark:ring-zinc-800">
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {myRequests.map((task) => (
                                <li key={task.id}>
                                    <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-amber-600 dark:text-amber-500">{task.title}</p>
                                                <div className="ml-2 flex flex-shrink-0 gap-2">
                                                    {task.moderationStatus === 'flagged' && (
                                                        <p className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-amber-100 text-amber-800">
                                                            In Prüfung
                                                        </p>
                                                    )}
                                                    {task.moderationStatus === 'rejected' && (
                                                        <p className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-red-100 text-red-800">
                                                            Abgelehnt
                                                        </p>
                                                    )}
                                                    <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${task.status === 'open' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {task.status === 'open' ? 'Offen' : task.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        {task.category}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                                                    <p>
                                                        Erstellt am {task.createdAt ? new Date(task.createdAt).toLocaleDateString('de-DE') : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* My Jobs */}
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">Meine Hilfsangebote</h3>
                {myJobs.length === 0 ? (
                    <p className="text-gray-500 text-sm">Du hast noch keine Aufträge übernommen.</p>
                ) : (
                    <div className="overflow-hidden bg-white dark:bg-zinc-900 shadow sm:rounded-md ring-1 ring-gray-200 dark:ring-zinc-800">
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {myJobs.map((task) => (
                                <li key={task.id}>
                                    <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="truncate text-sm font-medium text-amber-600 dark:text-amber-500">{task.title}</p>
                                                <div className="ml-2 flex flex-shrink-0">
                                                    <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${task.status === 'open' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {task.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        Preis: {(task.priceCents / 100).toFixed(2)} €
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
