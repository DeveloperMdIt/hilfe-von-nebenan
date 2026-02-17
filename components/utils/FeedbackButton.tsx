'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Bug, Lightbulb, MessageCircle, Send, BookOpen, GripVertical } from 'lucide-react';
import { submitFeedback } from '@/app/actions';
import Link from 'next/link';

interface FeedbackButtonProps {
    userId: string | null;
}

export function FeedbackButton({ userId }: FeedbackButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('idea');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [position, setPosition] = useState({ bottom: 24, right: 24 });
    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await submitFeedback(userId, type, content);
            setShowSuccess(true);
            setContent('');
            setTimeout(() => {
                setShowSuccess(false);
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            console.error('Feedback error:', error);
            alert('Fehler beim Senden. Bitte versuche es später erneut.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Feedback-Button */}
            <div
                className="fixed z-50 transition-transform active:scale-95"
                style={{ bottom: position.bottom, right: position.right }}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl shadow-2xl shadow-purple-900/40 border border-purple-400/30 group overflow-hidden relative"
                    title="Feedback geben"
                >
                    <div className="flex items-center gap-2 relative z-10 font-black uppercase text-xs tracking-widest">
                        <GripVertical size={14} className="text-purple-300" />
                        <MessageSquare size={18} />
                    </div>
                    {/* Pulsing background effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 pb-0 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black mb-1">Feedback geben (Beta)</h2>
                                <p className="text-gray-500 text-sm">Hast du einen Bug gefunden oder eine Idee? Lass es uns wissen!</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Handbook Link */}
                        <div className="px-6 pt-4">
                            <Link
                                href="/beta-handbook"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                            >
                                <BookOpen size={16} />
                                Zum Beta-Tester Handbuch
                            </Link>
                        </div>

                        {showSuccess ? (
                            <div className="p-12 text-center animate-in fade-in zoom-in">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send size={24} />
                                </div>
                                <h3 className="text-xl font-black mb-2">Vielen Dank!</h3>
                                <p className="text-gray-500">Dein Feedback wurde erfolgreich übermittelt.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Art des Feedbacks</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'bug', label: 'Fehler', icon: Bug, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
                                            { id: 'idea', label: 'Idee', icon: Lightbulb, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                                            { id: 'other', label: 'Sonstiges', icon: MessageCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setType(opt.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === opt.id
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                        : 'border-transparent bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                <opt.icon size={20} className={opt.color} />
                                                <span className="text-[10px] font-bold mt-1 uppercase">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Deine Nachricht</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Beschreibe, was dir aufgefallen ist..."
                                        rows={4}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !content.trim()}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-xl shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Senden
                                            <Send size={18} />
                                        </>
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
