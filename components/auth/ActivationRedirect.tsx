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
            pathname.startsWith('/tasks') ||
            role === 'admin'; // Admins are also exempt from activation redirect

        if (isExempt) {
            console.log(`[ActivationRedirect] Path ${pathname} is exempt`);
            return;
        }

        if (!isActive) { // If not active and not exempt, redirect to waiting
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
