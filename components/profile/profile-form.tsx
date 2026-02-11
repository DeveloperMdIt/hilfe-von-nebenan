
'use client';

import { updateUserProfile } from '@/app/actions';

export default function ProfileForm({ user }: { user: any }) {
    return (
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
                </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 dark:border-white/10 px-4 py-4 sm:px-8">
                <button
                    type="submit"
                    className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                    Speichern
                </button>
            </div>
        </form>
    );
}
