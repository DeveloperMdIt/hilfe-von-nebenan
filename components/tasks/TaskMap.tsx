'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useTransition, useRef } from 'react';
import { getTasksInRadius } from '@/app/actions';
import { Loader2 } from 'lucide-react';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TaskMarker {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    latitude: number;
    longitude: number;
    zipCode: string | null;
    distance?: number;
}

interface TaskMapProps {
    initialTasks: TaskMarker[];
    center?: [number, number];
    zoom?: number;
    userZip?: string;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Helper to group tasks by location
function groupTasksByLocation(tasks: TaskMarker[]) {
    const groups: Record<string, TaskMarker[]> = {};
    tasks.forEach(task => {
        const key = `${task.latitude},${task.longitude}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(task);
    });
    return groups;
}

export default function TaskMap({ initialTasks = [], center = [51.1657, 10.4515], zoom = 6, userZip }: TaskMapProps) {
    const [tasks, setTasks] = useState<TaskMarker[]>(initialTasks || []);
    // Only enable radius search if we have a userZip (activatable area)
    const [radius, setRadius] = useState<number>(userZip ? 25 : 0);
    const [mapCenter, setMapCenter] = useState<[number, number]>(center);
    const [isPending, startTransition] = useTransition();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync initialTasks when they change (e.g. from server filtering)
    useEffect(() => {
        if (initialTasks) {
            setTasks(initialTasks);
        }
    }, [initialTasks]);

    // Handle radius change with debounce (only filters list, not map pins anymore)
    useEffect(() => {
        if (!userZip || radius === 0) return;

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout (debounce 500ms)
        timeoutRef.current = setTimeout(() => {
            startTransition(async () => {
                const res = await getTasksInRadius(userZip, radius);

                // Cast to any because the server action return type might not be fully inferred in client yet
                const data = res as any;

                if (data.success && (data.tasks || data.allTasks)) {
                    // USER REQUEST: Always show ALL tasks on map
                    const globalTasks = data.allTasks || data.tasks;
                    setTasks(globalTasks);

                    if (data.center) {
                        setMapCenter([data.center.lat, data.center.lng]);
                    }
                }
            });
        }, 500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [radius, userZip]);

    const taskGroups = groupTasksByLocation(tasks);

    // Create custom cluster icon
    const createClusterIcon = (count: number) => {
        return L.divIcon({
            html: `<div class="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-bold border-2 border-white shadow-lg">${count}</div>`,
            className: 'custom-div-icon', // Empty class to remove default styles if needed
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    return (
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner z-0 group">

            {/* Radius Slider Overlay */}
            {userZip && (
                <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 w-64">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="radius" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Umkreis: <span className="text-amber-600">{radius > 50 ? 'Alle' : `${radius} km`}</span>
                        </label>
                        {isPending && <Loader2 size={12} className="animate-spin text-amber-600" />}
                    </div>
                    <input
                        type="range"
                        id="radius"
                        min="1"
                        max="51" // 51 creates a "snap" point for "All"
                        step="1"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>1km</span>
                        <span>∞</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={mapCenter}
                zoom={userZip ? 11 : zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <ChangeView center={mapCenter} zoom={userZip ? 11 : zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Visual Radius Circle - Only show if not "All" (max 50) */}
                {userZip && mapCenter && radius > 0 && radius <= 50 && (
                    <Circle
                        center={mapCenter}
                        radius={radius * 1000} // meters
                        pathOptions={{ color: '#d97706', fillColor: '#d97706', fillOpacity: 0.1, weight: 1 }}
                    />
                )}

                {Object.values(taskGroups).map((group, index) => {
                    const position: [number, number] = [group[0].latitude, group[0].longitude];

                    if (group.length === 1) {
                        const task = group[0];
                        return (
                            <Marker key={task.id} position={position}>
                                <Popup>
                                    <div className="p-1 min-w-[150px]">
                                        <h3 className="font-bold text-sm mb-1">{task.title}</h3>
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-amber-600">
                                                {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                            <a
                                                href={`/tasks/${task.id}`}
                                                className="text-blue-600 hover:underline font-medium"
                                            >
                                                Details
                                            </a>
                                        </div>
                                        <div className="mt-1 pt-1 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                                            <span>PLZ: {task.zipCode}</span>
                                            {task.distance !== undefined && (
                                                <span>{Math.round(task.distance)} km</span>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    } else {
                        // Cluster Marker
                        return (
                            <Marker
                                key={`cluster-${index}`}
                                position={position}
                                icon={createClusterIcon(group.length)}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[200px] max-h-[300px] overflow-y-auto">
                                        <h3 className="font-bold text-sm mb-2 sticky top-0 bg-white dark:bg-zinc-900 pb-1 border-b border-gray-100">
                                            {group.length} Angebote hier
                                        </h3>
                                        <div className="space-y-3">
                                            {group.map(task => (
                                                <div key={task.id} className="border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                                    <h4 className="font-medium text-xs line-clamp-1">{task.title}</h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-xs font-bold text-amber-600">
                                                            {(task.priceCents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                        </span>
                                                        <a
                                                            href={`/tasks/${task.id}`}
                                                            className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                                        >
                                                            Ansehen
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                })}
            </MapContainer>
        </div>
    );
}
