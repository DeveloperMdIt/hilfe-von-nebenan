import { verifyEmail } from '../../actions';
import Link from 'next/link';
import { MailCheck, MailX, ArrowRight } from 'lucide-react';

export default async function VerifyPage({ params }: { params: { token: string } }) {
    const { token } = await params;
    const result = await verifyEmail(token);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-amber-50/50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-zinc-800 text-center space-y-8">
                {result.success ? (
                    <>
                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center text-green-600 dark:text-green-500 mx-auto">
                            <MailCheck size={40} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">E-Mail bestätigt!</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Vielen Dank! Deine E-Mail-Adresse wurde erfolgreich verifiziert. Du kannst dich jetzt einloggen.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:bg-amber-600 dark:hover:bg-amber-500 dark:hover:text-white transition-all transform hover:-translate-y-1 shadow-lg"
                        >
                            Zum Login
                            <ArrowRight size={18} />
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-500 mx-auto">
                            <MailX size={40} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Hoppla!</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {result.error || 'Dieser Link ist leider ungültig oder abgelaufen.'}
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-block text-amber-600 font-bold hover:underline"
                        >
                            Zurück zum Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
