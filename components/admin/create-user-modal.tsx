'use client';

import { useState } from 'react';
import { adminCreateUser } from '@/app/actions';
import { X, Plus, Loader2 } from 'lucide-react';

export function CreateUserModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await adminCreateUser(formData);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            alert('Fehler beim Anlegen des Nutzers.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm shadow-sm"
            >
                <Plus size={16} />
                Nutzer anlegen
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-xl font-bold">Neuen Nutzer anlegen</h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            name="fullName"
                            type="text"
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-2.5 bg-transparent"
                            placeholder="Max Mustermann"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">E-Mail</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-2.5 bg-transparent"
                            placeholder="max@beispiel.de"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Rolle</label>
                        <select
                            name="role"
                            className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-2.5 bg-transparent"
                        >
                            <option value="customer">Kunde (Standard)</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Passwort (Optional)</label>
                        <input
                            name="password"
                            type="text"
                            className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 p-2.5 bg-transparent"
                            placeholder="Automatisch generieren wenn leer"
                        />
                    </div>

                    <div className="flex items-start gap-3 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <input
                            id="isVerified"
                            name="isVerified"
                            type="checkbox"
                            defaultChecked
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                        />
                        <div className="text-sm">
                            <label htmlFor="isVerified" className="font-medium text-gray-900 dark:text-gray-100">
                                Sofort verifizieren
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">
                                Der Nutzer muss seine E-Mail nicht mehr bestätigen.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                        <input
                            id="sendMail"
                            name="sendMail"
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
                        />
                        <div className="text-sm">
                            <label htmlFor="sendMail" className="font-medium text-gray-900 dark:text-gray-100">
                                Willkommens-Mail senden
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">
                                Sendet Zugangsdaten an die E-Mail.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            Nutzer anlegen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
