import { db } from '@/lib/db';
import { tasks, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EditTaskForm } from '@/components/tasks/EditTaskForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditTaskPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const taskId = params.id;

    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('userId')?.value;

    if (!currentUserId) redirect('/login');

    const result = await db
        .select({
            task: tasks,
        })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    const data = result[0];

    if (!data) {
        return <div className="p-20 text-center">Auftrag nicht gefunden.</div>;
    }

    const { task } = data;

    // Access Control
    const [currentUser] = await db.select().from(users).where(eq(users.id, currentUserId));
    const isAdmin = currentUser?.role === 'admin';
    const isOwner = currentUserId === task.customerId;

    if (!isAdmin && !isOwner) {
        redirect(`/tasks/${taskId}`);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-12">
            <div className="max-w-2xl mx-auto">
                <Link href={`/tasks/${taskId}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Zurück zum Auftrag
                </Link>

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-gray-100 dark:border-zinc-800">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                        Auftrag bearbeiten
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                        Passe die Details deines Auftrags an.
                    </p>

                    <EditTaskForm task={{
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        category: task.category || 'Sonstiges',
                        priceCents: task.priceCents
                    }} />
                </div>
            </div>
        </div>
    );
}
