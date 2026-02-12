import { db } from '@/lib/db';
import { users, messages, tasks, archivedConversations } from '@/lib/schema';
import { eq, or, and, desc, isNull, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, MessageCircle, Crown, Briefcase, Archive, Trash2 } from 'lucide-react';
import { archiveConversation } from '@/app/actions';

export default async function MessagesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login');
    }

    // 1. Get archived conversation identifiers
    const archived = await db.select().from(archivedConversations).where(eq(archivedConversations.userId, userId));
    const archivedSet = new Set(archived.map(a => `${a.partnerId}-${a.taskId || 'general'}`));

    // 2. Get all messages where current user is sender OR receiver, including task titles
    const allMessages = await db.select({
        id: messages.id,
        content: messages.content,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        taskId: messages.taskId,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
        taskTitle: tasks.title
    })
        .from(messages)
        .leftJoin(tasks, eq(messages.taskId, tasks.id))
        .where(
            or(
                eq(messages.senderId, userId),
                eq(messages.receiverId, userId)
            )
        )
        .orderBy(desc(messages.createdAt));

    // 3. Group by partner AND taskId (context)
    const conversations = new Map();

    for (const msg of allMessages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const contextKey = `${partnerId}-${msg.taskId || 'general'}`;

        // Skip if archived
        if (archivedSet.has(contextKey)) continue;

        if (!conversations.has(contextKey)) {
            // Fetch partner details only once per partnerId
            const partnerResult = await db.select().from(users).where(eq(users.id, partnerId));
            const partner = partnerResult[0];

            conversations.set(contextKey, {
                partner,
                taskId: msg.taskId,
                taskTitle: msg.taskId ? msg.taskTitle : 'Allgemeine Anfrage',
                lastMessage: msg,
                unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
            });
        } else {
            const conv = conversations.get(contextKey);
            if (msg.receiverId === userId && !msg.isRead) {
                conv.unreadCount += 1;
            }
        }
    }

    const conversationList = Array.from(conversations.values());

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-4xl font-black mb-10 flex items-center gap-3 text-gray-900 dark:text-white">
                <MessageCircle className="text-amber-600" size={32} />
                Deine Nachrichten
            </h1>

            {conversationList.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <p className="text-gray-500 font-bold text-xl mb-2">Noch keine Nachrichten.</p>
                    <p className="text-gray-400 text-sm">Deine Korrespondenz zu Aufträgen erscheint hier.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {conversationList.map(({ partner, taskId, taskTitle, lastMessage, unreadCount }) => {
                        const isOnline = partner?.lastSeenAt && (new Date().getTime() - new Date(partner.lastSeenAt).getTime()) < 10 * 60 * 1000;
                        const lastSeenText = partner?.lastSeenAt
                            ? `Zuletzt online: ${new Date(partner.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Offline';

                        return (
                            <div key={`${partner.id}-${taskId}`} className="relative group">
                                <Link
                                    href={`/messages/${partner.id}${taskId ? `?taskId=${taskId}` : ''}`}
                                    className="block bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
                                >
                                    {unreadCount > 0 && (
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-600" />
                                    )}
                                    <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="h-14 w-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 group-hover:rotate-3 transition-transform">
                                                {taskId ? <Briefcase size={28} /> : <User size={28} />}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm transition-colors ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate group-hover:text-amber-600 transition-colors leading-tight">
                                                        {taskTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                                            {isOnline ? 'Online' : lastSeenText}
                                                        </span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-xs font-bold text-gray-500">mit {partner?.fullName || 'Unbekannt'}</span>
                                                        {partner?.isHelperBadge && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                                                        {lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleDateString('de-DE') : ''}
                                                    </span>
                                                    {unreadCount > 0 && (
                                                        <div className="bg-amber-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-amber-900/20">
                                                            {unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-sm mt-3 truncate ${unreadCount > 0 ? 'font-black text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                                {lastMessage.senderId === userId && <span className="text-amber-600 font-bold mr-1 italic">Du:</span>}
                                                {lastMessage.content}
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                {/* Archive Action */}
                                <form action={async () => {
                                    'use server';
                                    await archiveConversation(partner.id, taskId);
                                }} className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="submit"
                                        title="Chat archivieren"
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    >
                                        <Archive size={18} />
                                    </button>
                                </form>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
