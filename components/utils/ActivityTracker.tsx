'use client';

import { useEffect } from 'react';
import { updateActivity } from '@/app/actions';

export function ActivityTracker() {
    useEffect(() => {
        // Update activity on mount
        updateActivity();

        // Periodically update every 4 minutes (threshold is 5 min)
        const interval = setInterval(() => {
            updateActivity();
        }, 4 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
