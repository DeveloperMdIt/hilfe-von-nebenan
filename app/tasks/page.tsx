import { db } from '../../lib/db';
import { tasks, users, zipCoordinates } from '../../lib/schema';
import { desc, ilike, eq, and, sql, or, SQL } from 'drizzle-orm';
import Link from 'next/link';
import { Crown, MapPin, Clock } from 'lucide-react';
import { formatName } from '@/lib/utils';
import TaskMapClient from './TaskMapClient';
import SearchControls from './SearchControls';

export default async function TasksPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; category?: string; radius?: string; view?: 'list' | 'map' }>;
}) {
    const params = await searchParams;
    const search = params.search;
    const category = params.category;
    const radius = params.radius || 'all';
    const view = params.view || 'list';

    // 1. Get user's own ZIP (approximate center for search if none provided)
    // For now we'll assume a default or use the search term if it looks like a ZIP
    let centerZip = '10115'; // Default Berlin
    if (search && /^\d{5}$/.test(search)) {
        centerZip = search;
    }

    // Get center coordinates
    const centerRes = await db.select().from(zipCoordinates).where(eq(zipCoordinates.zipCode, centerZip)).limit(1);
    const center = centerRes[0];

    // Construct filters
    const filters: (SQL<unknown> | undefined)[] = [
        eq(tasks.isActive, true),
        eq(tasks.moderationStatus, 'approved')
    ];
    if (search && !/^\d{5}$/.test(search)) {
        filters.push(or(ilike(tasks.title, `%${search}%`), ilike(tasks.description, `%${search}%`)));
    }
    if (category) filters.push(eq(tasks.category, category));

    // Geographical sorting and filtering
    const allTasks = await db
        .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            category: tasks.category,
            priceCents: tasks.priceCents,
            createdAt: tasks.createdAt,
            requesterName: users.fullName,
            isHelperBadge: users.isHelperBadge,
            zipCode: users.zipCode,
            city: users.city,
            latitude: zipCoordinates.latitude,
            longitude: zipCoordinates.longitude,
            distance: center ? sql<number>`
COALESCE((6371 * acos(
    cos(radians(${center.latitude})) * cos(radians(${zipCoordinates.latitude})) *
    cos(radians(${zipCoordinates.longitude}) - radians(${center.longitude})) +
    sin(radians(${center.latitude})) * sin(radians(${zipCoordinates.latitude}))
)), 0)` : sql<number>`0`
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.customerId, users.id))
        .leftJoin(zipCoordinates, eq(users.zipCode, zipCoordinates.zipCode))
        .where(and(...filters.filter((f): f is SQL<unknown> => f !== undefined)))
        .orderBy(desc(tasks.createdAt));

    // Apply radius filter in memory
    const filteredTasks = radius === 'all' || !center
        ? allTasks
        : allTasks.filter(t => t.distance !== null && t.distance <= parseInt(radius));

    const mapData = filteredTasks
        .filter(t => t.latitude && t.longitude)
        .map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priceCents: t.priceCents,
            latitude: t.latitude!,
            longitude: t.longitude!,
            zipCode: t.zipCode || ''
        }));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-[family-name:var(--font-geist-sans)]">
            {/* Header with Search */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link href="/" className="text-xl font-bold whitespace-nowrap">Nachbarschafts-Helden</Link>
                    <SearchControls
                        search={search}
                        category={category}
                        radius={radius}
                        view={view}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">
                        {search ? `Ergebnisse für "${search}"` : category ? `Kategorie: ${category}` : 'Aktuelle Aufträge'}
                    </h1>
                    <Link
                        href="/tasks/new"
                        className="inline-flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-amber-700 transition-colors shadow-sm"
                    >
                        <span>+</span> Auftrag erstellen
                    </Link>
                </div>

                {view === 'map' ? (
                    <div className="space-y-6">
                        <TaskMapClient
                            tasks={mapData}
                            center={center ? [center.latitude, center.longitude] : undefined}
                            zoom={radius === 'all' ? 6 : radius === '50' ? 9 : radius === '25' ? 10 : radius === '10' ? 11 : 12}
                        />
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                            {/* Static list below map for accessibility/SEO */}
                            {filteredTasks.slice(0, 3).map(t => <TaskCard key={t.id} task={t} />)}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}

                        {filteredTasks.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-300">
                                <p className="text-lg">Keine Aufträge in diesem Bereich gefunden.</p>
                                <Link href="/tasks" className="text-amber-600 hover:underline mt-2">Filter zurücksetzen</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function TaskCard({ task }: { task: any }) {
    return (
        <div className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 capitalize">
                    {task.category || 'Allgemein'}
                </span>
                <span className="font-bold text-lg">
                    {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
            </div>

            <h2 className="text-xl font-bold mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">{task.title}</h2>

            <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs font-medium text-gray-500">von {formatName(task.requesterName)}</span>
                {task.isHelperBadge && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-800/50 scale-90 origin-left">
                        <Crown size={10} className="fill-current" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                    </div>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {task.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
                <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-amber-500" />
                    {task.distance > 0 ? `${task.distance.toFixed(1)} km entfernt` : (task.city || task.zipCode || 'Unbekannt')}
                </span>
                <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Neu'}
                </span>
            </div>

            <Link
                href={`/tasks/${task.id}`}
                className="block w-full text-center py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
            >
                Details ansehen
            </Link>
        </div>
    );
}
