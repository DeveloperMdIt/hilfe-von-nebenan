import { db } from '@/lib/db';
import { users, messages, tasks } from '@/lib/schema';
import { eq, or, and, asc, isNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, User, Crown, CheckCircle2 } from 'lucide-react';
import { sendMessage, markMessagesAsRead, assignTask } from '@/app/actions';
import { RefreshOnMount } from '@/components/ui/refresh-on-mount';

export default async function ChatPage({
    params,
    searchParams
}: {
    params: Promise<{ partnerId: string }>,
    searchParams: Promise<{ taskId?: string }>
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const { partnerId } = await params;
    const { taskId } = await searchParams;

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

    const isPartnerProfileIncomplete = !partner.taxId || !partner.iban || !partner.bic || !partner.accountHolderName;

    // Fetch task details if taskId is present
    let task = null;
    if (taskId) {
        const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
        task = taskResult[0];
    }

    // Fetch conversation history
    const history = await db.select().from(messages)
        .where(
            and(
                or(
                    and(eq(messages.senderId, userId), eq(messages.receiverId, partnerId)),
                    and(eq(messages.senderId, partnerId), eq(messages.receiverId, userId))
                ),
                taskId
                    ? or(eq(messages.taskId, taskId), isNull(messages.taskId))
                    : isNull(messages.taskId)
            )
        )
        .orderBy(asc(messages.createdAt));

    // Fetch user's open tasks to allow assignment
    const myOpenTasks = await db.select().from(tasks).where(
        and(
            eq(tasks.customerId, userId),
            eq(tasks.status, 'open')
        )
    );

    // Mark as read (server-side effect for simple proto)
    // In a real app we'd do this via an action or effect when viewing
    if (history.length > 0) {
        // Ideally we would update "isRead" here, but for now we skip to avoid mutation in render
    }

    const isOnline = partner?.lastSeenAt && (new Date().getTime() - new Date(partner.lastSeenAt).getTime()) < 10 * 60 * 1000;

    const lastSeenText = partner?.lastSeenAt
        ? `Zuletzt online: ${new Date(partner.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Offline';

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
            <RefreshOnMount />
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                <Link href="/messages" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
                    <ArrowLeft size={20} />
                </Link>
                <Link href={`/profile/${partnerId}`} className="relative h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 hover:scale-105 transition-transform shrink-0">
                    <User size={20} />
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                </Link>
                <div className="flex-1 min-w-0">
                    {task ? (
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white truncate leading-tight">
                                {task.title}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Link href={`/profile/${partnerId}`} className="flex items-center gap-1 group">
                                    <span className="text-xs text-amber-600 font-bold">
                                        {partner.fullName}
                                    </span>
                                    {partner.isHelperBadge && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                </Link>
                                <span className="text-gray-300 text-xs">•</span>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                    {isOnline ? 'Online' : lastSeenText}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                {partner.fullName}
                                {partner.isHelperBadge && <Crown size={20} className="text-amber-500 fill-amber-500" />}
                            </h1>
                            <p className={`text-xs font-black flex items-center gap-1.5 mt-0.5 ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-zinc-700'}`} />
                                {isOnline ? 'Online' : lastSeenText}
                            </p>
                        </div>
                    )}
                </div>

                {/* Simplified Task Action Area */}
                <div className="flex items-center gap-2">
                    {task ? (
                        // Case: Contextual Chat (linked to a task)
                        task.customerId === userId && (
                            <div className="flex flex-col items-end gap-1">
                                <form action={async () => {
                                    'use server';
                                    const { assignTask, unassignTask } = await import('@/app/actions');
                                    if (task.helperId === partnerId) {
                                        await unassignTask(task.id);
                                    } else {
                                        await assignTask(task.id, partnerId);
                                    }
                                }}>
                                    <button
                                        type="submit"
                                        disabled={!task.helperId && isPartnerProfileIncomplete}
                                        className={`
                                            text-sm font-black px-6 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-2
                                            ${task.helperId === partnerId
                                                ? 'bg-green-600 text-white hover:bg-red-600 group'
                                                : isPartnerProfileIncomplete
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-amber-600 text-white hover:bg-amber-700 hover:scale-105 active:scale-95'
                                            }
                                        `}
                                    >
                                        {task.helperId === partnerId ? (
                                            <>
                                                <CheckCircle2 size={18} className="group-hover:hidden" />
                                                <span className="group-hover:hidden uppercase tracking-wider">Zugeordnet</span>
                                                <span className="hidden group-hover:inline uppercase tracking-wider">Zuweisung aufheben</span>
                                            </>
                                        ) : (
                                            'Auftrag zuweisen'
                                        )}
                                    </button>
                                </form>
                                {isPartnerProfileIncomplete && !task.helperId && (
                                    <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">Profil unvollständig</span>
                                )}
                            </div>
                        )
                    ) : (
                        // Case: Generic Chat - Show direct button if exactly one task, or cleaner list if more
                        myOpenTasks.length > 0 && (
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                    {myOpenTasks.length === 1 ? (
                                        <form action={async () => {
                                            'use server';
                                            const { assignTask } = await import('@/app/actions');
                                            const t = myOpenTasks[0];
                                            await assignTask(t.id, partnerId);
                                            const { redirect } = await import('next/navigation');
                                            redirect(`/messages/${partnerId}?taskId=${t.id}`);
                                        }}>
                                            <button
                                                type="submit"
                                                disabled={isPartnerProfileIncomplete}
                                                className={`text-sm font-black px-6 py-2.5 rounded-2xl transition-all shadow-md flex flex-col items-center
                                                    ${isPartnerProfileIncomplete
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-900 dark:bg-zinc-800 text-white hover:bg-amber-600 hover:scale-105 active:scale-95'
                                                    }
                                                `}
                                            >
                                                <span className="opacity-60 text-[10px] uppercase block leading-none mb-0.5">Zuweisen:</span>
                                                {myOpenTasks[0].title}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="relative group/menu">
                                            <button className="text-sm font-black px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2 border border-gray-200 dark:border-zinc-700">
                                                Auftrag wählen
                                                <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full">{myOpenTasks.length}</span>
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl p-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 transform origin-top-right scale-95 group-hover/menu:scale-100">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 px-2 py-2 border-b border-gray-100 dark:border-zinc-800 mb-2 tracking-widest text-center">Welcher Auftrag?</p>
                                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 selection-menu">
                                                    {myOpenTasks.map(t => (
                                                        <form action={async () => {
                                                            'use server';
                                                            const { assignTask } = await import('@/app/actions');
                                                            await assignTask(t.id, partnerId);
                                                            const { redirect } = await import('next/navigation');
                                                            redirect(`/messages/${partnerId}?taskId=${t.id}`);
                                                        }} key={t.id}>
                                                            <button
                                                                type="submit"
                                                                disabled={isPartnerProfileIncomplete}
                                                                className={`w-full text-left text-xs font-black p-3 rounded-xl truncate transition-all border-none bg-transparent 
                                                                    ${isPartnerProfileIncomplete ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-amber-600 hover:text-white'}
                                                                `}
                                                            >
                                                                {t.title}
                                                            </button>
                                                        </form>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isPartnerProfileIncomplete && (
                                    <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">Profil unvollständig</span>
                                )}
                            </div>
                        )
                    )}
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
                        <p>Noch keine Nachrichten zu diesem Auftrag. Schreib "Hallo"! 👋</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                <form action={sendMessage} className="flex gap-2">
                    <input type="hidden" name="receiverId" value={partnerId} />
                    {taskId && <input type="hidden" name="taskId" value={taskId} />}
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
