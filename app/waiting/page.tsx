import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getZipCodeStats } from '../actions';
import ZipCodeWaitingView from '@/components/dashboard/ZipCodeWaitingView';

export default async function WaitingPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login');
    }

    const [user] = await db.select({
        fullName: users.fullName,
        zipCode: users.zipCode,
        role: users.role,
    }).from(users).where(eq(users.id, userId));

    if (!user) {
        redirect('/login');
    }

    if (!user.zipCode) {
        redirect('/profile');
    }

    const stats = await getZipCodeStats(user.zipCode);

    // If active, go to home
    if (stats.isActive || user.role === 'admin') {
        redirect('/');
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-amber-50/50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <ZipCodeWaitingView
                zipCode={stats.zipCode}
                count={stats.count}
                threshold={stats.threshold}
                needed={stats.needed}
                userName={user.fullName || "Nachbar"}
            />
        </div>
    );
}
