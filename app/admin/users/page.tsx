import { db } from '../../../lib/db';
import { users } from '../../../lib/schema';
import { CreateUserModal } from '../../../components/admin/create-user-modal';
import { BadgeToggle } from '../../../components/admin/badge-toggle';
import Link from 'next/link';
import { desc } from 'drizzle-orm';

export default async function UsersPage() {
    const userList = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        isHelperBadge: users.isHelperBadge,
        createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Benutzerverwaltung</h1>
                <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">Gesamt: {userList.length}</span>
                    <CreateUserModal />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt am</th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Bearbeiten</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {userList.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName || 'Unbekannt'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <BadgeToggle userId={user.id} isActive={user.isHelperBadge || false} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.isVerified ? (
                                        <span className="text-green-600 font-medium">Verifiziert</span>
                                    ) : (
                                        <span className="text-amber-600">Ausstehend</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href={`/admin/users/${user.id}`} className="text-amber-600 hover:text-amber-900">Bearbeiten</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}
