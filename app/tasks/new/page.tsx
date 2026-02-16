import Link from 'next/link';
import { CreateTaskForm } from '../../../components/tasks/CreateTaskForm';
import { AlertTriangle } from 'lucide-react';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function NewTaskPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-4">Bitte melde dich an</h1>
                    <Link href="/login" className="text-amber-600 hover:underline">Zum Login</Link>
                </div>
            </div>
        );
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const isProfileIncomplete = !user || !user.street || !user.houseNumber || !user.zipCode || !user.city || !user.dateOfBirth;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-8 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-2xl mx-auto">
                <Link href="/tasks" className="text-sm text-gray-500 mb-6 block">← Zurück zur Übersicht</Link>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8 relative overflow-hidden">
                    {isProfileIncomplete && (
                        <div className="absolute inset-0 z-10 bg-white/60 dark:bg-zinc-900/80 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                            <div className="max-w-sm bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900/50">
                                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profil vervollständigen</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Bevor du einen Auftrag erstellen kannst, müssen wir deine Adresse und dein Geburtsdatum erfassen (PStTG Konformität).
                                </p>
                                <Link
                                    href="/profile"
                                    className="inline-flex w-full justify-center rounded-md bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-colors"
                                >
                                    Profil jetzt ergänzen
                                </Link>
                            </div>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold mb-6">Neuen Auftrag erstellen</h1>
                    <CreateTaskForm />
                </div>
            </div>
        </div>
    );
}
