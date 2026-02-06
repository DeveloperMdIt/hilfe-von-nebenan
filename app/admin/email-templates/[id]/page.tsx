import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { updateEmailTemplate } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function EditEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    const template = result[0];

    if (!template) {
        redirect('/admin/email-templates');
    }

    return (
        <div className="p-8 max-w-4xl">
            <Link href="/admin/email-templates" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Zurück zur Übersicht
            </Link>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Vorlage bearbeiten</h1>
                    <p className="text-gray-500 mt-1 font-mono text-sm">{template.key}</p>
                </div>
            </div>

            <form action={updateEmailTemplate} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <input type="hidden" name="id" value={template.id} />

                <div>
                    <label className="block text-sm font-medium mb-2">Betreff</label>
                    <input
                        type="text"
                        name="subject"
                        defaultValue={template.subject}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-3 bg-transparent font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Nachricht (Body)</label>
                    <p className="text-xs text-gray-500 mb-2">
                        Verfügbare Platzhalter: <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{link}}'}</code>
                    </p>
                    <textarea
                        name="body"
                        rows={12}
                        defaultValue={template.body}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-3 bg-transparent font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-y"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                    >
                        <Save size={18} />
                        Speichern
                    </button>
                </div>
            </form>
        </div>
    );
}
