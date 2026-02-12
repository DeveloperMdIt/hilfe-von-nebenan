import { db } from '../lib/db';
import { tags } from '../lib/schema';

const initialTags = [
    // Familie & Soziales
    { name: 'Freunde', category: 'Familie & Soziales', isApproved: true },
    { name: 'Kinder', category: 'Familie & Soziales', isApproved: true },
    { name: 'Kochen', category: 'Familie & Soziales', isApproved: true },
    { name: 'Backen', category: 'Familie & Soziales', isApproved: true },
    { name: 'Haustiere', category: 'Familie & Soziales', isApproved: true },
    { name: 'Soziales Engagement', category: 'Familie & Soziales', isApproved: true },
    { name: 'Nachbarschaftshilfe', category: 'Familie & Soziales', isApproved: true },
    { name: 'Garten', category: 'Familie & Soziales', isApproved: true },

    // Kunst & Kultur
    { name: 'Musik', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Malerei', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Tanz', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Theater', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Museen', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Fotografie', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Kreativ', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Literatur', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Design', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Kino', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Konzerte', category: 'Kunst & Kultur', isApproved: true },
    { name: 'Flohmärkte', category: 'Kunst & Kultur', isApproved: true },

    // Sport & Freizeit
    { name: 'Yoga', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Wandern', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Joggen', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Fitness', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Reisen', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Shopping', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Computerspiele', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Gesellschaftsspiele', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Ausgehen', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Skifahren', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Radfahren', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Fußball', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Klettern', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Schwimmen', category: 'Sport & Freizeit', isApproved: true },
    { name: 'Segeln', category: 'Sport & Freizeit', isApproved: true },

    // Haushalt & Garten
    { name: 'Gärtnern', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Handwerken', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Reparaturen', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Einkaufen', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Finanzen', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Pflanzen', category: 'Haushalt & Garten', isApproved: true },
    { name: 'Heimwerken', category: 'Haushalt & Garten', isApproved: true },

    // Wissen & Bildung
    { name: 'Sprachen', category: 'Wissen & Bildung', isApproved: true },
    { name: 'IT', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Mentoring', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Geschichte', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Wissenschaft', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Psychologie', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Wirtschaft', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Politik', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Geographie', category: 'Wissen & Bildung', isApproved: true },
    { name: 'Religion', category: 'Wissen & Bildung', isApproved: true },
];

async function seed() {
    console.log('Seeding tags...');
    for (const tag of initialTags) {
        try {
            await db.insert(tags).values(tag).onConflictDoNothing();
            console.log(`Added tag: ${tag.name}`);
        } catch (error) {
            console.error(`Error adding tag ${tag.name}:`, error);
        }
    }
    console.log('Done!');
    process.exit(0);
}

seed();
