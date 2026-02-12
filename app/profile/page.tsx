
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users, tags, userTags } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import ProfileForm from '@/components/profile/profile-form';
import UserTaskList from '@/components/profile/user-task-list';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login');
    }

    const userResult = await db.select().from(users).where(eq(users.id, userId));
    const user = userResult[0];

    if (!user) {
        redirect('/login');
    }

    // Fetch tags
    const allTags = await db.select().from(tags).execute();
    const userTagsResult = await db.select({ tagId: userTags.tagId })
        .from(userTags)
        .where(eq(userTags.userId, userId))
        .execute();

    const userTagIds = userTagsResult.map(ut => ut.tagId);

    // Get unique categories
    const categories = Array.from(new Set(allTags.map(t => t.category)));

    return (
        <div className="bg-white dark:bg-zinc-950 py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Mein Profil</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Verwalte deine Daten und behalte den Überblick über deine Aktivitäten.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
                    {/* Left Column: Profile Data */}
                    <div>
                        <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white mb-6">Persönliche Daten</h3>
                        <ProfileForm
                            user={user}
                            allTags={allTags}
                            userTagIds={userTagIds}
                            categories={categories}
                        />

                        <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Dein Status</h4>
                            <div className="mt-2 flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <p>Rolle: <span className="font-medium capitalize">{user.role}</span></p>
                                <p>Helfer-Badge: <span className="font-medium">{user.isHelperBadge ? 'Aktiv' : 'Inaktiv'}</span></p>
                                {user.subscriptionExpiresAt && (
                                    <p>Abo gültig bist: <span className="font-medium">{new Date(user.subscriptionExpiresAt).toLocaleDateString()}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activities */}
                    <div>
                        <UserTaskList userId={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
