'use client';

import { useState, useTransition } from 'react';
import { toggleUserVerification } from '../../app/actions';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface VerificationToggleProps {
    userId: string;
    isVerified: boolean;
}

export const VerificationToggle = ({ userId, isVerified: initialVerified }: VerificationToggleProps) => {
    const [isVerified, setIsVerified] = useState(initialVerified);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        const newState = !isVerified;
        // Optimistic update
        setIsVerified(newState);

        startTransition(async () => {
            const result = await toggleUserVerification(userId, newState);
            if (!result.success) {
                // Revert on failure
                setIsVerified(!newState);
                alert('Fehler beim Aktualisieren: ' + result.error);
            }
        });
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                handleToggle();
            }}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${isVerified
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
            title={isVerified ? 'Verifizierung aufheben' : 'Benutzer verifizieren'}
        >
            {isPending ? (
                <Loader2 size={12} className="animate-spin" />
            ) : isVerified ? (
                <CheckCircle2 size={12} />
            ) : (
                <XCircle size={12} />
            )}
            <span>{isVerified ? 'Verifiziert' : 'Offen'}</span>
        </button>
    );
};
