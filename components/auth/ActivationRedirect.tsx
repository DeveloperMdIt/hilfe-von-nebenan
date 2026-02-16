'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ActivationRedirectProps {
    isActive: boolean;
    role: string | null;
}

export function ActivationRedirect({ isActive, role }: ActivationRedirectProps) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Exempt paths
        const isExempt =
            pathname === '/profile' ||
            pathname === '/login' ||
            pathname === '/register' ||
            pathname === '/waiting' ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/api') ||
            pathname === '/forgot-password' ||
            pathname.startsWith('/reset-password') ||
            pathname === '/tasks/new' ||
            pathname === '/tasks';

        if (role === 'admin') return;

        if (!isActive && !isExempt) {
            console.log(`[Client] Redirecting to /waiting (pathname: ${pathname})`);
            router.replace('/waiting');
        }

        if (isActive && pathname === '/waiting') {
            console.log(`[Client] Redirecting to home (pathname: ${pathname})`);
            router.replace('/');
        }
    }, [isActive, role, pathname, router]);

    return null;
}
