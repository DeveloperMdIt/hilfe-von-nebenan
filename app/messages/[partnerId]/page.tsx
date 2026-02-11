import { db } from '@/lib/db';
import { users, messages } from '@/lib/schema';
import { eq, or, and, asc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Crown } from 'lucide-react';
import { sendMessage, markMessagesAsRead } from '@/app/actions';

export default async function ChatPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const { partnerId } = await params;

    if (!userId) {
        redirect('/login');
    }

    // Mark messages from this partner to current user as read
    await markMessagesAsRead(partnerId);

    // Fetch partner details
    const partnerResult = await db.select().from(users).where(eq(users.id, partnerId));
    const partner = partnerResult[0];

    if (!partner) {
        return <div>Nutzer nicht gefunden.</div>;
    }

    // Fetch conversation history
    const history = await db.select().from(messages)
        .where(
            or(
                and(eq(messages.senderId, userId), eq(messages.receiverId, partnerId)),
                and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
            )
        )
        .orderBy(asc(messages.createdAt));

    // Mark as read (server-side effect for simple proto)
    // In a real app we'd do this via an action or effect when viewing
    if (history.length > 0) {
        // Ideally we would update "isRead" here, but for now we skip to avoid mutation in render
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                <Link href="/messages" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
                    <ArrowLeft size={20} />
                </Link>
                <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500">
                    <User size={20} />
                </div>
                <div>
                    <h1 className="font-bold flex items-center gap-2">
                        {partner.fullName}
                        {partner.isHelperBadge && <Crown size={16} className="text-amber-500 fill-amber-500" />}
                    </h1>
                    <p className="text-xs text-gray-500">Online</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                {history.map((msg) => {
                    const isOwn = msg.senderId === userId;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`
                                    max-w-[80%] px-4 py-2 rounded-2xl shadow-sm
                                    ${isOwn
                                        ? 'bg-amber-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-zinc-700'
                                    }
                                `}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className={`text-[10px] block text-right mt-1 ${isOwn ? 'text-amber-100' : 'text-gray-400'}`}>
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>
                        </div>
                    );
                })}
                {history.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Noch keine Nachrichten. Schreib "Hallo"! 👋</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                <form action={sendMessage} className="flex gap-2">
                    <input type="hidden" name="receiverId" value={partnerId} />
                    <input
                        type="text"
                        name="content"
                        placeholder="Nachricht schreiben..."
                        autoComplete="off"
                        className="flex-1 rounded-full border border-gray-300 dark:border-zinc-700 px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-amber-600 text-white h-11 w-11 rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors shadow-sm"
                    >
                        <Send size={20} className="ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
