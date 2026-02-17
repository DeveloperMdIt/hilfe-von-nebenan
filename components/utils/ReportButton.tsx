'use client';

import { useState } from 'react';
import { ShieldAlert, X, Loader2, CheckCircle2 } from 'lucide-react';
import { reportTask, reportUser } from '@/app/actions';

interface ReportButtonProps {
    targetId: string;
    type: 'task' | 'user';
    className?: string;
}

export function ReportButton({ targetId, type, className }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) return;

        setIsSubmitting(true);
        try {
            const fullReason = details ? `${reason}: ${details}` : reason;
            if (type === 'task') {
                await reportTask(targetId, fullReason);
            } else {
                await reportUser(targetId, fullReason);
            }
            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSuccess(false);
                setReason('');
                setDetails('');
            }, 2000);
        } catch (error) {
            console.error('Reporting failed:', error);
            alert('Fehler beim Melden. Bitte versuche es später erneut.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={className || "flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"}
            >
                <ShieldAlert size={14} />
                {type === 'task' ? 'Auftrag melden' : 'Nutzer melden'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-zinc-800">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">{type === 'task' ? 'Auftrag melden' : 'Zweifelhaftes Profil melden'}</h2>
                                <p className="text-xs text-gray-500 font-medium">Deine Meldung wird vertraulich geprüft.</p>
                            </div>
                        </div>

                        {isSuccess ? (
                            <div className="py-12 text-center animate-in zoom-in-95">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Vielen Dank!</h3>
                                <p className="text-sm text-gray-500">Wir prüfen den Fall umgehend.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Grund der Meldung</label>
                                    <select
                                        required
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full rounded-2xl border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 p-4 border transition-all hover:border-gray-300 focus:ring-2 focus:ring-red-500 outline-none sm:text-sm font-bold"
                                    >
                                        <option value="">Bitte wählen...</option>
                                        <option value="Spam / Werbung">Spam / Werbung</option>
                                        <option value="Unangemessene Inhalte">Unangemessene Inhalte</option>
                                        <option value="Betrugsverdacht">Betrugsverdacht</option>
                                        <option value="Beleidigung / Belästigung">Beleidigung / Belästigung</option>
                                        <option value="Sonstiges">Sonstiges</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Zusätzliche Details (Optional)</label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        rows={4}
                                        placeholder="Was genau ist passiert?"
                                        className="w-full rounded-2xl border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 p-4 border transition-all hover:border-gray-300 focus:ring-2 focus:ring-red-500 outline-none sm:text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Wird gesendet...
                                        </>
                                    ) : (
                                        'Meldung abschicken'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
