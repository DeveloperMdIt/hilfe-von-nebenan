import { db } from '../lib/db';
import { zipCoordinates } from '../lib/schema';

async function seed() {
    console.log('Seeding ZIP coordinates...');

    // Some sample German ZIP codes and their coordinates
    const samples = [
        { zipCode: '10115', latitude: 52.5323, longitude: 13.3846 }, // Berlin Mitte
        { zipCode: '10117', latitude: 52.5170, longitude: 13.3889 }, // Berlin Mitte
        { zipCode: '10435', latitude: 52.5373, longitude: 13.4071 }, // Berlin Prenzlauer Berg
        { zipCode: '20095', latitude: 53.5511, longitude: 9.9937 },  // Hamburg Mitte
        { zipCode: '80331', latitude: 48.1364, longitude: 11.5775 }, // München Altstadt
        { zipCode: '50667', latitude: 50.9375, longitude: 6.9603 },  // Köln Altstadt
        { zipCode: '60311', latitude: 50.1109, longitude: 8.6821 },  // Frankfurt am Main
        { zipCode: '70173', latitude: 48.7758, longitude: 9.1829 },  // Stuttgart
        { zipCode: '04109', latitude: 51.3397, longitude: 12.3731 }, // Leipzig
        { zipCode: '44135', latitude: 51.5136, longitude: 7.4653 },  // Dortmund
        { zipCode: '36318', latitude: 50.683, longitude: 9.300 },   // Schwalmtal
        { zipCode: '36341', latitude: 50.637, longitude: 9.394 },   // Lauterbach
    ];

    for (const sample of samples) {
        await db.insert(zipCoordinates).values(sample).onConflictDoUpdate({
            target: zipCoordinates.zipCode,
            set: { latitude: sample.latitude, longitude: sample.longitude }
        });
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
