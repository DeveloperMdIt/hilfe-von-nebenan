'use client';

import { useState, useTransition } from 'react';
import { toggleHelperBadge } from '../../app/actions';
import { Crown } from 'lucide-react';

interface BadgeToggleProps {
    userId: string;
    isActive: boolean;
}

export const BadgeToggle = ({ userId, isActive: initialActive }: BadgeToggleProps) => {
    const [isActive, setIsActive] = useState(initialActive);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        // Optimistic Update
        const newState = !isActive;
        setIsActive(newState);

        try {
            startTransition(async () => {
                await toggleHelperBadge(userId);
            });
        } catch (error) {
            console.error("Failed to toggle badge:", error);
            // Revert on error
            setIsActive(!newState);
            alert("Fehler beim Speichern des Badges");
        }
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                handleToggle();
            }}
            disabled={isPending}
            className={`p-2 rounded-full transition-colors relative ${isActive
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
            title={isActive ? 'Badge entfernen' : 'Badge vergeben'}
        >
            <div className="relative">
                <Crown size={16} className={`transition-all ${isActive ? 'fill-current scale-110' : 'scale-100'}`} />
                {isPending && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
            </div>
        </button>
    );
};
