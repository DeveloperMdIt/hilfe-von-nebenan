'use client';

import { useEffect, useRef, useCallback } from 'react';
import { autoLogoutUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function AutoLogout() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            // Trigger server action for logout
            autoLogoutUser();
        }, TIMEOUT_MS);
    }, []);

    useEffect(() => {
        // Set initial timer
        resetTimer();

        // Activity listeners
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        const handleActivity = () => {
            resetTimer();
        };

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null;
}
