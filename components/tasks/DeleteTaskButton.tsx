'use client';

import { Trash2 } from 'lucide-react';
import { deleteTask } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function DeleteTaskButton({ taskId }: { taskId: string }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm('Möchtest du diesen Auftrag wirklich löschen?')) {
            return;
        }

        const formData = new FormData();
        formData.append('id', taskId);

        const result = await deleteTask(formData);

        if (result && 'error' in result) {
            alert(result.error);
        } else {
            router.push('/tasks');
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm"
        >
            <Trash2 size={16} /> Löschen
        </button>
    );
}
