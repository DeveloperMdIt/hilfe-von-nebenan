import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { SettingsForm } from '@/components/admin/settings-form';

export default async function AdminSettingsPage() {
    // Fetch current settings
    const allSettings = await db.select().from(settings);
    // Convert array to object for easier consumption
    const settingsMap = allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value || '';
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="p-4 lg:p-8 w-full">
            <h1 className="text-3xl font-black mb-8 tracking-tight">Einstellungen</h1>
            <SettingsForm initialSettings={settingsMap} />
        </div>
    );
}
