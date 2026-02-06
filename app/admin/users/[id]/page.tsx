import { db } from '../../../../lib/db';
import { users } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';
import { updateUser } from '../../../actions';
import Link from 'next/link';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const result = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
    const user = result[0];

    if (!user) {
        return <div className="p-8">Benutzer nicht gefunden.</div>;
    }

    return (
        <div className="p-8 max-w-2xl">
            <Link href="/admin/users" className="text-sm text-gray-500 mb-6 block">
                ← Zurück zur Benutzerliste
            </Link>

            <h1 className="text-2xl font-bold mb-6">Benutzer bearbeiten: {user.fullName}</h1>

            <form action={updateUser} className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
                <input type="hidden" name="id" value={user.id} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <input
                        type="text"
                        name="fullName"
                        defaultValue={user.fullName || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={user.email}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rolle</label>
                    <select
                        name="role"
                        defaultValue={user.role || 'customer'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
                    >
                        <option value="customer">Kunde (Standard)</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                    <input
                        type="checkbox"
                        id="isHelperBadge"
                        name="isHelperBadge"
                        defaultChecked={user.isHelperBadge || false}
                        className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="isHelperBadge" className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Helfer-Abzeichen (Verified Badge) anzeigen
                    </label>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Passwort ändern (Optional)
                    </label>
                    <input
                        type="text" // Using text to see it easily as admin, can be password type
                        name="password"
                        placeholder="Neues Passwort setzen..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leer lassen, um das aktuelle Passwort zu behalten.</p>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                        Speichern
                    </button>
                </div>
            </form>
        </div>
    );
}
