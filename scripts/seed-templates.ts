import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { emailTemplates } from '../lib/schema';
import { eq } from 'drizzle-orm';

const connectionString = 'postgresql://postgres:password@127.0.0.1:5177/hilfevonnebenan';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
    console.log('Seeding email templates...');

    const templates = [
        {
            key: 'plz_waiting_list',
            subject: 'Bald geht es los in {{zipCode}}! 🏡',
            body: `Hallo {{name}},

vielen Dank für dein Interesse an Nachbarschafts-Helden! 

In deiner Postleitzahl {{zipCode}} fehlen uns aktuell noch {{needed}} Nachbarn, um die Plattform in deinem Bereich freizuschalten. 

Sobald wir {{threshold}} Personen erreicht haben, informieren wir dich sofort per E-Mail, damit du direkt loslegen kannst.

Hilf mit und lade deine Nachbarn ein: {{inviteLink}}

Zusammen machen wir die Nachbarschaft ein Stück besser!

Dein Team von Nachbarschafts-Helden`
        },
        {
            key: 'email_verification',
            subject: 'Bestätige deine E-Mail-Adresse | Nachbarschafts-Helden',
            body: `Hallo {{name}},

vielen Dank für deine Registrierung bei Nachbarschafts-Helden! 

Damit du direkt loslegen kannst, bestätige bitte kurz deine E-Mail-Adresse durch einen Klick auf den folgenden Link:

{{verifyUrl}}

Viel Erfolg in deiner Nachbarschaft!
Dein Team von Nachbarschafts-Helden`
        }
    ];

    for (const template of templates) {
        const existing = await db.select().from(emailTemplates).where(eq(emailTemplates.key, template.key));
        if (existing.length === 0) {
            console.log(`Creating template: ${template.key}`);
            await db.insert(emailTemplates).values(template);
        } else {
            console.log(`Template exists: ${template.key}`);
        }
    }

    await client.end();
    console.log('Template seeding completed.');
}

seed().catch(console.error);
