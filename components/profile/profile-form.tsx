
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfile } from '@/app/actions';
import TagSelector from './tag-selector';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? 'Speichern...' : 'Basisdaten Speichern'}
        </button>
    );
}

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
    const [state, formAction] = useActionState(updateUserProfile, null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setShowSuccess(true);
            const scrollableElement = document.querySelector('main');
            if (scrollableElement) {
                scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const [bankInfo, setBankInfo] = useState({
        bic: user.bic || '',
        bankName: ''
    });

    const bicMap: Record<string, { bic: string, bankName: string }> = {
        '10000000': { bic: 'PBNKDEFF', bankName: 'Postbank' },
        '10070024': { bic: 'DEUTDEDX', bankName: 'Deutsche Bank' },
        '20040000': { bic: 'COBADEFF', bankName: 'Commerzbank' },
        '12030000': { bic: 'DKBADEB1', bankName: 'DKB' },
        '37010050': { bic: 'WASPDE33', bankName: 'Sparkasse' },
        '70020270': { bic: 'HYVEDEMM', bankName: 'HypoVereinsbank' },
        '50010517': { bic: 'INGBDEFF', bankName: 'ING-DiBa' },
        '30020900': { bic: 'TARGDE21', bankName: 'TARGOBANK' },
        '10020000': { bic: 'GENODED1', bankName: 'Berliner Volksbank' },
        '20070024': { bic: 'DEUTDEDX', bankName: 'Deutsche Bank (Hamburg)' },
        '30050000': { bic: 'COBADEFF', bankName: 'Commerzbank (Düsseldorf)' },
        '44050199': { bic: 'STADDE44', bankName: 'Stadtsparkasse Düsseldorf' },
        '60050101': { bic: 'BWADEB60', bankName: 'LBBW' },
        '70050000': { bic: 'BAYEDEMM', bankName: 'BayernLB' },
        '25050000': { bic: 'NOLADE21', bankName: 'Nord/LB' },
        '37050198': { bic: 'HELA DE FF', bankName: 'Helaba' },
    };

    const handleIbanChange = (val: string) => {
        const cleanVal = (val || '').replace(/\s/g, '').toUpperCase();
        if (cleanVal.startsWith('DE') && cleanVal.length >= 12) {
            const blz = cleanVal.substring(4, 12);
            if (bicMap[blz]) {
                setBankInfo(bicMap[blz]);
            } else {
                setBankInfo({ bic: '', bankName: '' });
            }
        } else {
            setBankInfo({ bic: '', bankName: '' });
        }
    };

    useEffect(() => {
        if (user.iban) {
            handleIbanChange(user.iban);
        }
    }, [user.iban]);

    return (
        <div className="space-y-10">
            <form action={formAction} className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10 sm:rounded-xl md:col-span-2">
                <input type="hidden" name="id" value={user.id} />

                <div className="px-4 py-6 sm:p-8">
                    {showSuccess && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="text-sm font-bold">Änderungen erfolgreich gespeichert!</p>
                        </div>
                    )}

                    {state?.error && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <p className="text-sm font-bold">{state.error}</p>
                        </div>
                    )}

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
                                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
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
                                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
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
                                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Wird auf deinem öffentlichen Profil angezeigt.
                            </p>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Neues Passwort (optional)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Passwort..."
                                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="passwordConfirm" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Passwort bestätigen
                            </label>
                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="passwordConfirm"
                                    id="passwordConfirm"
                                    placeholder="Nochmal eingeben..."
                                    className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
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
                                <div className="sm:col-span-4">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-900 dark:text-white">Straße</label>
                                    <input
                                        type="text"
                                        name="street"
                                        id="street"
                                        defaultValue={user.street || ''}
                                        placeholder="Hauptstraße"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-900 dark:text-white">Nr.</label>
                                    <input
                                        type="text"
                                        name="houseNumber"
                                        id="houseNumber"
                                        defaultValue={user.houseNumber || ''}
                                        placeholder="12a"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-900 dark:text-white">PLZ</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        id="zipCode"
                                        defaultValue={user.zipCode || ''}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-4">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-900 dark:text-white">Ort</label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        defaultValue={user.city || ''}
                                        placeholder="Berlin"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-900 dark:text-white">Land</label>
                                    <input
                                        type="text"
                                        name="country"
                                        id="country"
                                        defaultValue={user.country || 'Deutschland'}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-3 border-t border-gray-100 dark:border-white/5 pt-6 mt-2">
                                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900 dark:text-white">Geburtsdatum</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        id="dateOfBirth"
                                        defaultValue={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-3 border-t border-gray-100 dark:border-white/5 pt-6 mt-2">
                                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-900 dark:text-white">Steuer-ID</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        id="taxId"
                                        defaultValue={user.taxId || ''}
                                        placeholder="11-stellige Id"
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                    />
                                </div>

                                <div className="sm:col-span-6 border-t border-gray-100 dark:border-white/5 pt-6">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Bankverbindung</h5>

                                    <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 gap-x-6">
                                        <div className="sm:col-span-6">
                                            <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-900 dark:text-white">Kontoinhaber</label>
                                            <input
                                                type="text"
                                                name="accountHolderName"
                                                id="accountHolderName"
                                                defaultValue={user.accountHolderName || user.fullName || ''}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700"
                                            />
                                        </div>

                                        <div className="sm:col-span-6 mt-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="iban" className="block text-xs font-medium text-gray-500 mb-1">IBAN</label>
                                                    <input
                                                        type="text"
                                                        name="iban"
                                                        id="iban"
                                                        defaultValue={user.iban || ''}
                                                        placeholder="DE00 0000 0000 0000 0000 00"
                                                        onChange={(e) => handleIbanChange(e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 uppercase"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="bic" className="block text-xs font-medium text-gray-500 mb-1">BIC</label>
                                                    <input
                                                        type="text"
                                                        name="bic"
                                                        id="bic"
                                                        value={bankInfo.bic}
                                                        onChange={(e) => setBankInfo(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                                                        placeholder="BIC"
                                                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 uppercase"
                                                    />
                                                </div>
                                            </div>

                                            {bankInfo.bankName && (
                                                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-500">
                                                    <span>🏦 {bankInfo.bankName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 dark:border-white/10 px-4 py-4 sm:px-8">
                    <SubmitButton />
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
