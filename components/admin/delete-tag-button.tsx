'use client';

import { deleteTag } from '@/app/actions';
import { Trash2 } from 'lucide-react';

export default function DeleteTagButton({ tagId }: { tagId: string }) {
    const handleDelete = async () => {
        if (confirm('Bist du sicher, dass du diesen Tag löschen möchtest? Alle Verknüpfungen zu Usern gehen verloren.')) {
            await deleteTag(tagId);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Löschen"
        >
            <Trash2 size={18} />
        </button>
    );
}
