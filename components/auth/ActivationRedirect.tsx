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
            pathname === '/' ||
            pathname === '/profile' ||
            pathname === '/login' ||
            pathname === '/register' ||
            pathname === '/waiting' ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/api') ||
            pathname === '/forgot-password' ||
            pathname.startsWith('/reset-password') ||
            pathname.startsWith('/tasks') ||
            pathname.includes('/tasks') ||
            role === 'admin';

        if (isExempt) {
            return;
        }

        if (!isActive) { // If not active and not exempt, redirect to waiting
            router.replace('/waiting');
        }

        if (isActive && pathname === '/waiting') {
            router.replace('/');
        }
    }, [isActive, role, pathname, router]);

    return null;
}
