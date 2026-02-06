import { db } from '@/lib/db';
import { users, messages } from '@/lib/schema';
import { eq, or, and, desc, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, MessageCircle, Crown } from 'lucide-react';

export default async function MessagesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login');
    }

    // 1. Get all messages where current user is sender OR receiver
    const allMessages = await db.select().from(messages)
        .where(
            or(
                eq(messages.senderId, userId),
                eq(messages.receiverId, userId)
            )
        )
        .orderBy(desc(messages.createdAt));

    // 2. Group by partner
    const conversations = new Map();

    for (const msg of allMessages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

        if (!conversations.has(partnerId)) {
            // Fetch partner details only once
            const partnerResult = await db.select().from(users).where(eq(users.id, partnerId));
            const partner = partnerResult[0];

            conversations.set(partnerId, {
                partner,
                lastMessage: msg,
                unreadCount: (msg.receiverId === userId && !msg.isRead) ? 1 : 0
            });
        } else {
            // Update unread count if applicable
            const conv = conversations.get(partnerId);
            if (msg.receiverId === userId && !msg.isRead) {
                conv.unreadCount += 1;
            }
        }
    }

    const conversationList = Array.from(conversations.values());

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <MessageCircle className="text-amber-600" />
                Deine Nachrichten
            </h1>

            {conversationList.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                    <p className="text-gray-500">Noch keine Nachrichten.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {conversationList.map(({ partner, lastMessage, unreadCount }) => (
                        <Link
                            key={partner.id}
                            href={`/messages/${partner.id}`}
                            className="block bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                                    <User size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold truncate flex items-center gap-1">
                                            {partner.fullName}
                                            {partner.isHelperBadge && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                        {lastMessage.senderId === userId && <span className="text-gray-400 font-normal mr-1">Du:</span>}
                                        {lastMessage.content}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <div className="bg-amber-600 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">
                                        {unreadCount}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
