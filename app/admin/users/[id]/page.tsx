import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { updateUser } from '@/app/actions';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import Link from 'next/link';
import { User, Shield, BadgeCheck, Activity, Trash2, ArrowLeft, CreditCard } from 'lucide-react';

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const result = await db.select().from(users).where(eq(users.id, params.id)).limit(1);
    const user = result[0];

    if (!user) {
        return <div className="p-8 font-bold text-red-600">Benutzer nicht gefunden.</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <Link href="/admin/users" className="group flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 mb-8 transition-colors w-fit">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Zurück zur Benutzerliste
            </Link>

            <div className="flex justify-between items-end mb-10 border-b border-gray-100 dark:border-zinc-800 pb-6">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1 block">Benutzer-Profil</span>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-none">
                        {user.fullName || 'Name fehlt'}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                        {user.email}
                        <span className="h-1 w-1 bg-gray-300 rounded-full" />
                        ID: <span className="text-[10px] font-mono bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded italic">{user.id}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <form action={updateUser} className="bg-white dark:bg-zinc-900 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-10 space-y-10">
                        <input type="hidden" name="id" value={user.id} />

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-amber-600" />
                                Stammdaten
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Vollständiger Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        defaultValue={user.fullName || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all hover:border-gray-300 shadow-sm sm:text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">E-Mail Adresse</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={user.email}
                                        required
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all hover:border-gray-300 shadow-sm sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Straße</label>
                                    <input
                                        type="text"
                                        name="street"
                                        defaultValue={user.street || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Hausnummer</label>
                                    <input
                                        type="text"
                                        name="houseNumber"
                                        defaultValue={user.houseNumber || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">PLZ</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        defaultValue={user.zipCode || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Stadt</label>
                                    <input
                                        type="text"
                                        name="city"
                                        defaultValue={user.city || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <BadgeCheck size={20} className="text-amber-600" />
                                PStTG & Rechtliches
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Geburtsdatum</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        defaultValue={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Steuer-ID</label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        defaultValue={user.taxId || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <CreditCard size={20} className="text-amber-600" />
                                Bankverbindung
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kontoinhaber</label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        defaultValue={user.accountHolderName || ''}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">IBAN</label>
                                        <input
                                            type="text"
                                            name="iban"
                                            defaultValue={user.iban || ''}
                                            className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">BIC</label>
                                        <input
                                            type="text"
                                            name="bic"
                                            defaultValue={user.bic || ''}
                                            className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield size={20} className="text-amber-600" />
                                Rollen & Status
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Benutzerrolle</label>
                                    <select
                                        name="role"
                                        defaultValue={user.role || 'customer'}
                                        className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                    >
                                        <option value="customer">Nachbar (Kunde)</option>
                                        <option value="admin">Administrator (Vollen Zugriff)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`flex items-center gap-4 p-6 rounded-3xl border transition-all ${user.isHelperBadge ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20' : 'bg-gray-50/50 border-gray-100 dark:bg-zinc-800/20 dark:border-zinc-800'}`}>
                                        <input
                                            type="checkbox"
                                            id="isHelperBadge"
                                            name="isHelperBadge"
                                            defaultChecked={user.isHelperBadge || false}
                                            className="h-7 w-7 rounded-xl border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <label htmlFor="isHelperBadge" className="cursor-pointer">
                                            <span className="text-sm font-black text-gray-900 dark:text-white block">Helfer-Badge</span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Verifiziertes Profilsymbol</span>
                                        </label>
                                    </div>

                                    <div className={`flex items-center gap-4 p-6 rounded-3xl border transition-all ${user.isActive !== false ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20' : 'bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'}`}>
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            defaultChecked={user.isActive !== false}
                                            className="h-7 w-7 rounded-xl border-gray-300 text-green-600 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <label htmlFor="isActive" className="cursor-pointer">
                                            <span className="text-sm font-black text-gray-900 dark:text-white block">Account Aktiv</span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Login Erlaubnis erteilen</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Beta Tester Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <div className={`flex items-center gap-4 p-6 rounded-3xl border transition-all ${user.isBetaTester ? 'bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900/20' : 'bg-gray-50/50 border-gray-100 dark:bg-zinc-800/20 dark:border-zinc-800'}`}>
                                        <input
                                            type="checkbox"
                                            id="isBetaTester"
                                            name="isBetaTester"
                                            defaultChecked={user.isBetaTester || false}
                                            className="h-7 w-7 rounded-xl border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                        />
                                        <label htmlFor="isBetaTester" className="cursor-pointer">
                                            <span className="text-sm font-black text-gray-900 dark:text-white block">Beta-Tester Status</span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">Spezialkonditionen aktiv</span>
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Beta-Rabattsatz (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="betaDiscountRate"
                                                min="0"
                                                max="100"
                                                defaultValue={user.betaDiscountRate || 0}
                                                className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all hover:border-gray-300 shadow-sm sm:text-sm pr-10"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic px-1">Rabatt auf die Standard-Provision (nach der Beta-Phase).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-gray-100 dark:border-zinc-800 space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-amber-600" />
                                Sicherheit
                            </h3>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Neues Passwort setzen</label>
                                <input
                                    type="text"
                                    name="password"
                                    placeholder="Passwort eingeben oder leer lassen..."
                                    className="block w-full rounded-2xl border-gray-200 dark:border-zinc-800 dark:bg-zinc-950 p-4 border transition-all hover:border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                />
                                <p className="text-xs text-gray-400 flex items-center gap-2 italic">
                                    <Activity size={12} />
                                    Nur ausfüllen, wenn das Passwort geändert werden soll.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-5 px-6 rounded-3xl bg-gray-900 dark:bg-white text-white dark:text-black text-base font-black hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-2xl shadow-gray-400/20 dark:shadow-none active:scale-[0.98]"
                            >
                                Änderungen speichern
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 p-8">
                        <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6">Details</h4>
                        <div className="space-y-5">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mitglied seit</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PLZ / Gebiet</span>
                                <span className="text-sm font-bold text-amber-600">{user.zipCode || 'Nicht hinterlegt'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Verifizierungsstatus</span>
                                {user.isVerified ? (
                                    <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded w-fit mt-1">✓ VERIFIZIERT</span>
                                ) : (
                                    <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded w-fit mt-1">⏳ AUSSTEHEND</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50/50 dark:bg-red-900/10 shadow-xl rounded-[2.5rem] border border-red-100 dark:border-red-900/20 p-8 space-y-6">
                        <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                            <Trash2 size={24} />
                            <h4 className="font-black text-lg">Gefahrenzone</h4>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                            Löschen ist endgültig. Alle Tasks, Nachrichten und Bewertungen dieses Nutzers werden gelöscht.
                        </p>
                        <DeleteUserButton userId={user.id} variant="full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
