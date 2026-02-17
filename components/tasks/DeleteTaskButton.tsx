'use client';

import { Trash2 } from 'lucide-react';
import { deleteTask } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmModal } from '../ui/confirm-modal';

export function DeleteTaskButton({ taskId }: { taskId: string }) {
    const router = useRouter();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        const formData = new FormData();
        formData.append('id', taskId);

        try {
            const result = await deleteTask(formData);
            if (result && 'error' in result) {
                alert(result.error); // Fallback error limit
            } else {
                router.push('/tasks');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Fehler beim Löschen des Auftrags.');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm"
            >
                <Trash2 size={16} /> Löschen
            </button>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Auftrag löschen?"
                description="Möchtest du diesen Auftrag wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
                confirmLabel="Ja, löschen"
                cancelLabel="Abbrechen"
                variant="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
