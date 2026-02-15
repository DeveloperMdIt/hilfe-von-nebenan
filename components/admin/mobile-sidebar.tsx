'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ListTodo, Settings, Home, CreditCard, Mail, Star, FileText, Menu, X } from 'lucide-react';

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

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

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden">
            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className="fixed bottom-6 right-6 z-50 p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-colors"
                aria-label="Admin Menü"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={toggleOpen}
                />
            )}

            {/* Sidebar Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={toggleOpen}>
                            <Home className="text-amber-500" />
                            <span>Admin</span>
                        </Link>
                        <button onClick={toggleOpen} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={toggleOpen}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-amber-600'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                        <Link
                            href="/"
                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
                        >
                            <span>← Zurück zur App</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
