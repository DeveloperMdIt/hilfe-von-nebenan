import { Bell, LogOut, User } from 'lucide-react';
import { cookies } from 'next/headers';
import { db } from '../../lib/db';
import { users } from '../../lib/schema';
import { eq } from 'drizzle-orm';
import { logoutUser } from '../../app/actions';

export async function AdminHeader() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    let user = null;
    if (userId) {
        const result = await db.select({
            fullName: users.fullName,
            role: users.role,
        }).from(users).where(eq(users.id, userId));
        user = result[0];
    }

    // Fallback if no user found (should redirect in middleware but for now safe access)
    const displayName = user?.fullName || 'Admin User';
    const displayRole = user?.role === 'admin' ? 'Administrator' : 'Benutzer';

    return (
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Left side - Breadcrumb/Title placeholder */}
            <div className="flex items-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Admin Bereich</h2>
            </div>

            {/* Right side - Actions & Profile */}
            <div className="flex items-center gap-6">
                <button
                    className="text-gray-400 hover:text-amber-600 transition-colors relative"
                    title="Benachrichtigungs-System (Aktuell Platzhalter für zukünftige Updates)"
                >
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                        <p className="text-xs text-gray-500">{displayRole}</p>
                    </div>
                    <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <User size={20} />
                    </div>
                </div>

                <form action={logoutUser}>
                    <button
                        type="submit"
                        className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Abmelden"
                    >
                        <LogOut size={20} />
                    </button>
                </form>
            </div>
        </header>
    );
}
