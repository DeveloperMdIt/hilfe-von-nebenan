import Link from 'next/link';
import { LayoutDashboard, Users, ListTodo, Settings, Home, CreditCard, Mail, Star, FileText } from 'lucide-react';
import { AdminHeader } from '../../components/admin/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // SECURITY CHECK
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login?callbackUrl=/admin');
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user || user.role !== 'admin') {
        // Log potential unauthorized access attempt?
        console.warn(`Unauthorized admin access attempt by user ${userId} (${user?.email})`);
        redirect('/');
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Aufträge', icon: ListTodo, href: '/admin/tasks' },
        { name: 'Benutzer', href: '/admin/users', icon: Users },
        { name: 'Bewertungen', href: '/admin/reviews', icon: Star },
        { name: 'Abrechnung', href: '/admin/billing', icon: CreditCard },
        { name: 'Email Vorlagen', href: '/admin/email-templates', icon: Mail },
        { name: 'Abo-Modelle', href: '/admin/plans', icon: CreditCard },
        { name: 'Tags & Kategorien', href: '/admin/tags', icon: ListTodo },
        { name: 'Steuermeldung (PStTG)', href: '/admin/tax-reporting', icon: FileText },
        { name: 'Einstellungen', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-full bg-gray-100 dark:bg-zinc-950 font-[family-name:var(--font-geist-sans)]">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Home className="text-amber-500" />
                        <span>Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-amber-600 transition-colors"
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                    <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                        ← Zurück zur App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
