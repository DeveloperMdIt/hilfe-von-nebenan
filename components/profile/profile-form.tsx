
'use client';

import { updateUserProfile } from '@/app/actions';
import TagSelector from './tag-selector';

export default function ProfileForm({
    user,
    allTags,
    userTagIds,
    categories
}: {
    user: any;
    allTags: any[];
    userTagIds: string[];
    categories: string[];
}) {
    return (
        <div className="space-y-10">
            <form action={updateUserProfile} className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 sm:rounded-xl md:col-span-2">
                <input type="hidden" name="id" value={user.id} />

                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="fullName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Vollständiger Name
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    defaultValue={user.fullName || ''}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                E-Mail Adresse
                            </label>
                            <div className="mt-2">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    defaultValue={user.email}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label htmlFor="bio" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Über mich / Was ich anbiete
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    defaultValue={user.bio || ''}
                                    placeholder="Beschreibe kurz, was du kannst oder wobei du helfen möchtest..."
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Wird auf deinem öffentlichen Profil angezeigt.
                            </p>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Neues Passwort (optional)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Leer lassen zum Beibehalten"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-6 border-t border-gray-900/10 dark:border-white/10 pt-8 mt-4">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                ⚖ Steuerliche Informationen (PStTG)
                            </h4>
                            <p className="text-xs text-gray-500 mb-6">
                                Gemäß PStTG sind wir verpflichtet, diese Daten zu erfassen und zu melden, sobald du 30 Transaktionen oder 2.000€ Umsatz im Jahr erreichst.
                            </p>

                            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-6">
                                <div className="sm:col-span-6">
                                    <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-900 dark:text-white">Anschrift</label>
                                    <input
                                        type="text"
                                        name="streetAddress"
                                        id="streetAddress"
                                        defaultValue={user.streetAddress || ''}
                                        placeholder="Straße, Hausnummer, PLZ, Ort"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900 dark:text-white">Geburtsdatum</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        id="dateOfBirth"
                                        defaultValue={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-900 dark:text-white">Steuer-ID</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        id="taxId"
                                        defaultValue={user.taxId || ''}
                                        placeholder="11-stellige Id"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-900 dark:text-white">Auszahlungskonto (IBAN)</label>
                                    <input
                                        type="text"
                                        name="bankDetails"
                                        id="bankDetails"
                                        defaultValue={user.bankDetails || ''}
                                        placeholder="DE..."
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 dark:border-white/10 px-4 py-4 sm:px-8">
                    <button
                        type="submit"
                        className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    >
                        Basisdaten Speichern
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 sm:rounded-xl p-4 sm:p-8">
                <h3 className="text-base font-semibold leading-7 text-gray-900 dark:text-white mb-6">Meine Interessen & Skills</h3>
                <TagSelector
                    allTags={allTags}
                    userTagIds={userTagIds}
                    categories={categories}
                />
            </div>
        </div>
    );
}
