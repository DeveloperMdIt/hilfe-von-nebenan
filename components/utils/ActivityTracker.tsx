'use client';

import { useEffect } from 'react';
import { updateActivity } from '@/app/actions';

export function ActivityTracker() {
    useEffect(() => {
        // Update activity on mount
        updateActivity();

        // Periodically update every 2 minutes (threshold is 10 min)
        const interval = setInterval(() => {
            updateActivity();
        }, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
