import { db } from '../../lib/db';
import { tasks, users, zipCoordinates } from '../../lib/schema';
import { desc, ilike, eq, and, sql, or, SQL, inArray } from 'drizzle-orm';
import Link from 'next/link';
import { Crown, MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { formatName } from '@/lib/utils';
import TaskMapClient from './TaskMapClient';
import { FilterSidebar } from '@/components/tasks/FilterSidebar';
import { ViewToggle } from '@/components/tasks/ViewToggle';
import { cookies } from 'next/headers';
import { getCategoryLabel } from '@/lib/constants';
import { ensureZipCoordinates } from '@/lib/self-healing';

export default async function TasksPage(props: {
    searchParams: Promise<{ search?: string; category?: string; radius?: string; view?: string }>
}) {
    const params = await props.searchParams;
    const search = params.search;
    const category = params.category;
    const radius = params.radius || '15';
    const view = params.view || 'split';

    // 1. Get current user for radius feature & default center
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    let userZip = undefined;

    if (userId) {
        const userRes = await db.select({ zipCode: users.zipCode }).from(users).where(eq(users.id, userId));
        if (userRes.length > 0) {
            userZip = userRes[0].zipCode || undefined;
        }
    }

    // 2. Determine Map Center
    let centerZip = userZip || '';
    if (search && /^\d{5}$/.test(search)) {
        centerZip = search;
    }

    // Attempt to get coordinates
    let center = null;
    if (centerZip) {
        const centerRes = await db.select().from(zipCoordinates).where(eq(zipCoordinates.zipCode, centerZip)).limit(1);
        center = centerRes[0];

        if (!center) {
            console.log(`Self-healing coordinates for ZIP: ${centerZip}`);
            center = await ensureZipCoordinates(centerZip);
        }
    }

    // Construct filters
    const filters: (SQL<unknown> | undefined)[] = [
        eq(tasks.isActive, true),
        eq(tasks.moderationStatus, 'approved')
    ];
    if (search && !/^\d{5}$/.test(search)) {
        filters.push(or(ilike(tasks.title, `%${search}%`), ilike(tasks.description, `%${search}%`)));
    }
    if (category) {
        const categoryList = category.split(',');
        filters.push(inArray(tasks.category, categoryList));
    }

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

    // 3. Post-fetch Fallback: Center on first task if still no center
    if (!center && allTasks.length > 0) {
        const firstWithCoords = allTasks.find(t => t.latitude && t.longitude);
        if (firstWithCoords) {
            center = { latitude: firstWithCoords.latitude, longitude: firstWithCoords.longitude } as any;
        }
    }

    if (!center) {
        center = { latitude: 52.5200, longitude: 13.4050 } as any;
    }

    const radiusNum = parseInt(radius === 'all' ? '51' : radius);

    // Apply radius filter in memory
    const nearbyTasks = radius === 'all' || !center
        ? allTasks
        : allTasks.filter(t => t.distance !== null && t.distance <= radiusNum);

    const furtherTasks = radius === 'all' || !center
        ? []
        : allTasks.filter(t => t.distance !== null && t.distance > radiusNum && t.distance <= radiusNum + 30);

    const mapData = allTasks
        .filter(t => t.latitude && t.longitude)
        .map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priceCents: t.priceCents,
            latitude: t.latitude!,
            longitude: t.longitude!,
            zipCode: t.zipCode || '',
            distance: t.distance
        }));

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-black font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* View Toolbar */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Nachbarschafts Feed</h2>
                        <p className="text-gray-500 text-sm mt-1">Finde aktuelle Hilfeangebote in deiner direkten Umgebung</p>
                    </div>
                    <ViewToggle />
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <FilterSidebar className="h-full" />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-12">

                        {/* Map View */}
                        {(view === 'map' || view === 'split') && (
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-1.5 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800 h-[500px] lg:h-[600px] relative overflow-hidden group">
                                <TaskMapClient
                                    tasks={mapData}
                                    center={center ? [center.latitude, center.longitude] : undefined}
                                    zoom={radius === 'all' ? 6 : Math.max(9, Math.min(15, Math.round(14.8 - Math.log2(radiusNum / 1.5))))}
                                    userZip={userZip}
                                    radius={parseInt(radius === 'all' ? '51' : radius)}
                                />
                                {view === 'split' && (
                                    <div className="absolute top-6 right-6 z-[400]">
                                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 dark:border-zinc-700/50 shadow-lg text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            {mapData.length} Angebote auf der Karte
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results Sections */}
                        {(view === 'list' || view === 'split') && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Nearby Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                            Angebote in der Nähe
                                            <span className="text-xs font-black bg-amber-600 text-white px-3 py-1 rounded-full shadow-lg shadow-amber-600/20">{nearbyTasks.length}</span>
                                        </h3>
                                    </div>

                                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                        {nearbyTasks.map((task) => (
                                            <TaskCard key={task.id} task={task} />
                                        ))}

                                        {nearbyTasks.length === 0 && (
                                            <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-500 bg-white dark:bg-zinc-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-zinc-800 shadow-inner">
                                                <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                                    <MapPin size={32} className="text-gray-300" />
                                                </div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white">Keine Angebote gefunden</p>
                                                <p className="text-sm mt-2 text-gray-400 max-w-xs text-center">In diesem Umkreis gibt es aktuell keine aktiven Angebote. Versuche es mit einem größeren Filter.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Further Away Section */}
                                {furtherTasks.length > 0 && (
                                    <section className="pt-12 border-t border-gray-100 dark:border-zinc-900">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                                Etwas weiter weg
                                                <span className="text-xs font-black bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">{furtherTasks.length}</span>
                                            </h3>
                                        </div>
                                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                            {furtherTasks.map((task) => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskCard({ task }: { task: any }) {
    const categoryLabel = getCategoryLabel(task.category);

    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-2 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/5 hover:-translate-y-2">
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-[2rem] p-6 h-full flex flex-col border border-transparent group-hover:border-amber-100 dark:group-hover:border-amber-900/30 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors duration-500">
                <div className="flex justify-between items-start mb-6">
                    <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm border border-amber-100 dark:border-amber-900/30">
                        {categoryLabel}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-black text-2xl text-gray-900 dark:text-white">
                            {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-black mb-2 text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
                        {task.title}
                    </h2>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">von {formatName(task.requesterName)}</span>
                        {task.isHelperBadge && (
                            <div className="px-2 py-0.5 rounded-md bg-amber-600 text-white flex items-center gap-1 shadow-lg shadow-amber-600/20">
                                <Crown size={10} className="fill-current" />
                                <span className="text-[8px] font-black uppercase tracking-widest">PRO</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                        {task.description}
                    </p>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-gray-400 mb-6 py-4 border-t border-dashed border-gray-200 dark:border-zinc-800">
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                            <MapPin size={14} />
                            {task.distance > 0 ? `${task.distance.toFixed(1)} km` : (task.city || 'Lokal')}
                        </span>
                        <span className="flex items-center gap-1.5 italic">
                            <Clock size={14} />
                            {task.createdAt ? new Date(task.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : 'Neu'}
                        </span>
                    </div>

                    <Link
                        href={`/tasks/${task.id}`}
                        className="group/btn flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gray-900 text-white dark:bg-zinc-800 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 dark:hover:bg-amber-600 transition-all duration-300 shadow-xl shadow-gray-900/10 hover:shadow-amber-600/30 group-hover:translate-x-0.5"
                    >
                        Details ansehen
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Soft Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-[2.5rem] opacity-0 group-hover:opacity-10 blur transition-opacity duration-500 -z-10" />
        </div>
    );
}
