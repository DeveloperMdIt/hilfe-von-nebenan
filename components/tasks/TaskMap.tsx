'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

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
}

interface TaskMapProps {
    tasks: TaskMarker[];
    center?: [number, number];
    zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function TaskMap({ tasks, center = [51.1657, 10.4515], zoom = 6 }: TaskMapProps) {
    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {tasks.map((task) => (
                    <Marker key={task.id} position={[task.latitude, task.longitude]}>
                        <Popup>
                            <div className="p-1">
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
                                <div className="mt-1 pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                                    PLZ: {task.zipCode}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
