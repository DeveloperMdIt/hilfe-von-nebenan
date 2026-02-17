
import { db } from './db';
import { zipCoordinates } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Ensures that coordinates for a given ZIP code exist in the database.
 * This is a 'self-healing' mechanism that falls back to Nominatim (OSM) geocoding.
 */
export async function ensureZipCoordinates(zipCode: string): Promise<{ latitude: number; longitude: number } | null> {
    if (!zipCode || !/^\d{5}$/.test(zipCode)) return null;

    try {
        // 1. Check local DB
        const existing = await db.select().from(zipCoordinates).where(eq(zipCoordinates.zipCode, zipCode)).limit(1);
        if (existing.length > 0) {
            return { latitude: existing[0].latitude, longitude: existing[0].longitude };
        }

        // 2. Fetch from Nominatim (OpenStreetMap)
        console.log(`[Self-Healing] Fetching coordinates for ZIP ${zipCode} from Nominatim...`);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=Germany&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'HilfeVonNebenan/1.0 (Self-Healing System)'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            // 3. Save to DB
            console.log(`[Self-Healing] Found ZIP ${zipCode}: ${latitude}, ${longitude}. Saving to DB.`);
            await db.insert(zipCoordinates).values({
                zipCode,
                latitude,
                longitude
            }).onConflictDoNothing();

            return { latitude, longitude };
        }

        console.warn(`[Self-Healing] No coordinates found for ZIP: ${zipCode}`);
        return null;
    } catch (error) {
        console.error(`[Self-Healing] Error ensuring ZIP ${zipCode}:`, error);
        return null;
    }
}
