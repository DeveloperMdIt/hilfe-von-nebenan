import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://nachbarschafts-helden.de';

    // Static routes
    const routes = [
        '',
        '/tasks',
        '/pricing',
        '/register',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes for tasks (only public ones)
    try {
        const publicTasks = await db.select({ id: tasks.id, createdAt: tasks.createdAt })
            .from(tasks)
            .where(eq(tasks.status, 'open'))
            .execute();

        const taskRoutes = publicTasks.map((task) => ({
            url: `${baseUrl}/tasks/${task.id}`,
            lastModified: task.createdAt ? new Date(task.createdAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...routes, ...taskRoutes];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return routes;
    }
}
