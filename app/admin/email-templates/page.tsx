import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/schema';
import { Mail, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default async function EmailTemplatesPage() {
    // 1. Fetch existing templates
    let templates = await db.select().from(emailTemplates);

    // 2. Seed default templates if empty
    if (templates.length === 0) {
        console.log('Seeding email templates...');
        const defaults = [
            {
                key: 'welcome_customer',
                subject: 'Willkommen bei Nachbarschafts-Helden! 👋',
                body: 'Hallo {{name}},\n\nschön, dass du dabei bist! Wir freuen uns, dich in unserer Community begrüßen zu dürfen.\n\nFinde jetzt Hilfe in deiner Nachbarschaft oder biete deine Unterstützung an.\n\nViele Grüße,\nDein Team'
            },
            {
                key: 'verify_email',
                subject: 'Bitte bestätige deine E-Mail-Adresse 📧',
                body: 'Hallo {{name}},\n\nbitte klicke auf den folgenden Link, um deine E-Mail-Adresse zu bestätigen:\n\n{{link}}\n\nDanke!'
            },
            {
                key: 'reminder_unverified',
                subject: 'Erinnerung: Bitte bestätige deine E-Mail ⏰',
                body: 'Hallo {{name}},\n\ndu hast dich vor einiger Zeit registriert, aber deine E-Mail noch nicht bestätigt. Bitte hole das nach, um alle Funktionen nutzen zu können.\n\n{{link}}'
            },
            {
                key: 'new_message',
                subject: 'Du hast eine neue Nachricht 💬',
                body: 'Hallo {{name}},\n\ndu hast eine neue Nachricht von {{sender}} erhalten. Logge dich ein, um sie zu lesen.'
            }
        ];

        // Insert defaults
        await db.insert(emailTemplates).values(defaults);

        // Re-fetch
        templates = await db.select().from(emailTemplates);
    }

    return (
        <div className="p-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={32} />
                </span>
                Email Vorlagen
            </h1>

            <div className="grid gap-4">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg">{template.subject}</h3>
                                <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-500">
                                    {template.key}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {template.body}
                            </p>
                        </div>

                        <Link
                            href={`/admin/email-templates/${template.id}`}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                            <Edit2 size={20} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
