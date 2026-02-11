'use client';

import { Trash2 } from 'lucide-react';
import { deleteUserAdmin } from '@/app/actions';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useState, useTransition } from 'react';

interface DeleteUserButtonProps {
    userId: string;
    variant?: 'icon' | 'full';
}

export function DeleteUserButton({ userId, variant = 'icon' }: DeleteUserButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const formData = new FormData();
        formData.append('id', userId);

        startTransition(async () => {
            try {
                await deleteUserAdmin(formData);
                setIsConfirmOpen(false);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Fehler beim Löschen des Benutzers.');
            }
        });
    };

    const triggerLabel = variant === 'full' ? 'Jetzt Benutzer löschen' : '';

    return (
        <>
            <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className={variant === 'full'
                    ? "w-full py-4 px-4 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    : "text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors p-1.5"
                }
                title="Benutzer löschen"
            >
                <Trash2 size={variant === 'full' ? 16 : 18} />
                {triggerLabel}
            </button>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                isLoading={isPending}
                title="Nutzer löschen?"
                description="Möchten Sie diesen Benutzer wirklich unwiderruflich löschen? Alle zugehörigen Daten wie Tasks, Nachrichten und Bewertungen gehen verloren."
                confirmLabel="Ja, endgültig löschen"
                cancelLabel="Abbrechen"
                variant="danger"
            />
        </>
    );
}
