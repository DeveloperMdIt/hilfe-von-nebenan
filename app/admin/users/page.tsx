import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { BadgeToggle } from '@/components/admin/badge-toggle';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { UserCog } from 'lucide-react';

export default async function UsersPage() {
    const userList = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isVerified: users.isVerified,
        isHelperBadge: users.isHelperBadge,
        isActive: users.isActive,
        createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <UserCog className="text-amber-600" />
                        Benutzerverwaltung
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Verwalten Sie alle registrierten Nachbarn und Admins.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-600 dark:text-gray-400">
                        Gesamt: {userList.length}
                    </span>
                    <CreateUserModal />
                </div>
            </div>

            {/* Desktop Table View (Visible on Large Screens) */}
            <div className="hidden lg:block bg-white dark:bg-zinc-900 shadow-xl rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800 table-fixed">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/4">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-1/4">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-auto">Rolle</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-center w-auto">Badge</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-auto">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest w-auto">Erstellt am</th>
                            <th className="relative px-6 py-4 w-auto">
                                <span className="sr-only">Aktionen</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                        {userList.map((user) => (
                            <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors ${user.isActive === false ? 'opacity-60 bg-red-50/10' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate" title={user.fullName || ''}>{user.fullName || 'Kurzname fehlt'}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 break-all">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center">
                                    <BadgeToggle userId={user.id} isActive={user.isHelperBadge || false} />
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-col gap-1.5">
                                        {user.isActive === false ? (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold uppercase w-fit">Deaktiviert</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase w-fit">Aktiv</span>
                                        )}
                                        {user.isVerified ? (
                                            <span className="text-green-600 text-[11px] font-medium flex items-center gap-1">✓ Verifiziert</span>
                                        ) : (
                                            <span className="text-amber-600 text-[11px] font-medium flex items-center gap-1">⏳ Ausstehend</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                    <div className="flex justify-end items-center gap-2">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-amber-600 hover:text-amber-700 font-bold bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Bearbeiten
                                        </Link>
                                        <DeleteUserButton userId={user.id} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Card View (Visible on Small/Medium Screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {userList.map((user) => (
                    <div key={user.id} className={`bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-4 ${user.isActive === false ? 'opacity-75 bg-gray-50 dark:bg-zinc-800/50' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{user.fullName || 'Unbekannt'}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 break-all">{user.email}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {user.role}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm border-t border-b border-gray-50 dark:border-zinc-800 py-3">
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Badge</span>
                                <BadgeToggle userId={user.id} isActive={user.isHelperBadge || false} />
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Status</span>
                                <div className="flex items-center gap-2">
                                    {user.isActive === false ? (
                                        <span className="text-red-600 font-bold text-xs">Deaktiviert</span>
                                    ) : (
                                        <span className="text-green-600 font-bold text-xs">Aktiv</span>
                                    )}
                                    {user.isVerified && <span className="text-green-600 text-xs">✓ Verified</span>}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Erstellt</span>
                                <span className="text-gray-600 dark:text-gray-400 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : '-'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-auto pt-2">
                            <Link
                                href={`/admin/users/${user.id}`}
                                className="text-amber-600 hover:text-amber-700 font-bold bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg transition-colors text-sm flex-1 text-center"
                            >
                                Bearbeiten
                            </Link>
                            <div className="flex-shrink-0">
                                <DeleteUserButton userId={user.id} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
