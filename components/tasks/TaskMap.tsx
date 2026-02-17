'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
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

export interface TaskMarker {
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
    tasks: TaskMarker[];
    center?: [number, number];
    zoom?: number;
    userZip?: string;
    radius?: number;
}

function ChangeView({ center, zoom, radius }: { center: [number, number], zoom: number, radius: number }) {
    const map = useMap();
    useEffect(() => {
        if (radius > 0 && radius <= 50) {
            // Calculate bounds for the circle
            // 1 degree lat ~ 111km
            const dLat = radius / 111;
            const dLon = radius / (111 * Math.cos(center[0] * Math.PI / 180));

            const bounds = L.latLngBounds(
                [center[0] - dLat, center[1] - dLon],
                [center[0] + dLat, center[1] + dLon]
            );

            map.fitBounds(bounds, { padding: [20, 20] });
        } else {
            map.setView(center, zoom);
        }
    }, [center, zoom, radius, map]);
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

export default function TaskMap({ tasks = [], center = [51.1657, 10.4515], zoom = 6, userZip, radius = 0 }: TaskMapProps) {
    const taskGroups = groupTasksByLocation(tasks);

    // Create custom cluster icon
    const createClusterIcon = (count: number) => {
        return L.divIcon({
            html: `<div class="flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-bold border-2 border-white shadow-lg">${count}</div>`,
            className: 'custom-div-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    // Create custom single task icon
    const singleTaskIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded-full font-bold border-2 border-white shadow-md text-[10px]">1</div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    return (
        <div className="relative h-[600px] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner z-0 group">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <ChangeView center={center} zoom={zoom} radius={radius} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Visual Radius Circle - Only show if not "All" (max 50) */}
                {radius > 0 && radius <= 50 && (
                    <Circle
                        center={center}
                        radius={radius * 1000} // meters
                        pathOptions={{ color: '#d97706', fillColor: '#d97706', fillOpacity: 0.1, weight: 1 }}
                    />
                )}

                {Object.values(taskGroups).map((group, index) => {
                    const position: [number, number] = [group[0].latitude, group[0].longitude];

                    if (group.length === 1) {
                        const task = group[0];
                        return (
                            <Marker key={task.id} position={position} icon={singleTaskIcon}>
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
