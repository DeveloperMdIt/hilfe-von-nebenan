'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { logoutUser } from '@/app/actions';
import { LogOut } from 'lucide-react';

export function Header({ user, unreadCount = 0 }: {
    user?: { fullName?: string | null; role?: string | null;[key: string]: any } | null;
    unreadCount?: number;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Hide header on admin pages (optional, depending on design)
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-zinc-800">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <div className="h-8 w-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                            <HeartHandshake size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Hilfe von Nebenan</span>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <span className="sr-only">Menü öffnen</span>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className="hidden lg:flex lg:gap-x-8">
                    <Link
                        href="/tasks"
                        className={`text-sm font-semibold leading-6 transition-colors ${isActive('/tasks') ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100 hover:text-amber-600'}`}
                    >
                        Aufträge finden
                    </Link>
                    <Link
                        href="/tasks/new"
                        className={`text-sm font-semibold leading-6 transition-colors ${isActive('/tasks/new') ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100 hover:text-amber-600'}`}
                    >
                        Hilfe suchen
                    </Link>
                    {user && (
                        <Link
                            href="/messages"
                            className={`text-sm font-semibold leading-6 transition-colors flex items-center gap-2 ${isActive('/messages') ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100 hover:text-amber-600'}`}
                        >
                            Nachrichten
                            {unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <Link
                        href="/about"
                        className={`text-sm font-semibold leading-6 transition-colors ${isActive('/about') ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100 hover:text-amber-600'}`}
                    >
                        So funktioniert's
                    </Link>
                    <Link
                        href="/pricing"
                        className={`text-sm font-semibold leading-6 transition-colors ${isActive('/pricing') ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100 hover:text-amber-600'}`}
                    >
                        Preise
                    </Link>
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-900 p-2 rounded-lg transition-colors">
                                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                    <span className="font-bold text-xs">{user.fullName?.[0] || 'U'}</span>
                                </div>
                                <span className="text-sm font-semibold">{user.fullName}</span>
                            </Link>
                            <form action={logoutUser}>
                                <button
                                    type="submit"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Abmelden"
                                >
                                    <LogOut size={18} />
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-amber-600">
                                Anmelden
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full bg-black dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200"
                            >
                                Registrieren
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="lg:hidden p-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 absolute w-full shadow-xl">
                    <div className="flex flex-col space-y-4">
                        <Link href="/tasks" className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:text-amber-600">
                            Aufträge finden
                        </Link>
                        <Link href="/tasks/new" className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:text-amber-600">
                            Hilfe suchen
                        </Link>
                        {user && (
                            <Link href="/messages" className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:text-amber-600 flex items-center justify-between">
                                Nachrichten
                                {unreadCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        {!user ? (
                            <>
                                <Link href="/login" className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:text-amber-600">
                                    Anmelden
                                </Link>
                                <Link href="/register" className="text-base font-semibold leading-7 text-amber-600">
                                    Registrieren
                                </Link>
                            </>
                        ) : (
                            <form action={logoutUser} className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                                <button type="submit" className="text-base font-semibold leading-7 text-red-600 flex items-center gap-2">
                                    <LogOut size={18} />
                                    Abmelden
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
