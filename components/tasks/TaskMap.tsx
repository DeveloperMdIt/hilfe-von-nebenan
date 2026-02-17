'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useTransition } from 'react';
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
    zipCode: string;
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

export default function TaskMap({ initialTasks, center = [51.1657, 10.4515], zoom = 6, userZip }: TaskMapProps) {
    const [tasks, setTasks] = useState<TaskMarker[]>(initialTasks);
    // Only enable radius search if we have a userZip (activatable area)
    const [radius, setRadius] = useState<number>(userZip ? 25 : 0);
    const [mapCenter, setMapCenter] = useState<[number, number]>(center);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!userZip || radius === 0) return;

        startTransition(async () => {
            const res = await getTasksInRadius(userZip, radius);
            if (res.success && res.tasks) {
                setTasks(res.tasks);
                if (res.center) {
                    setMapCenter([res.center.lat, res.center.lng]);
                }
            }
        });
    }, [radius, userZip]);

    return (
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner z-0 group">

            {/* Radius Slider Overlay */}
            {userZip && (
                <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 w-64">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="radius" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Umkreis: <span className="text-amber-600">{radius} km</span>
                        </label>
                        {isPending && <Loader2 size={12} className="animate-spin text-amber-600" />}
                    </div>
                    <input
                        type="range"
                        id="radius"
                        min="0"
                        max="25"
                        step="5"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>0km</span>
                        <span>25km</span>
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
                {tasks.map((task) => (
                    <Marker key={task.id} position={[task.latitude, task.longitude]}>
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
                ))}
            </MapContainer>
        </div>
    );
}
