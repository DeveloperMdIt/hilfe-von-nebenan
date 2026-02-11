'use server';

import { db } from '@/lib/db';
import { users, tasks, reviews, messages, subscriptionPlans, emailTemplates, settings, zipCodeActivations, archivedConversations } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, or, and, desc, sql, count } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { filterContactInfo } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, sendAreaLaunchEmail, sendNeighborInviteEmail } from '@/lib/mailer';

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = formData.get('price') as string;

    // Basic validation
    if (!title || !description || !price) {
        throw new Error('Bitte alle Felder ausfüllen');
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        throw new Error('Nicht eingeloggt. Bitte erst anmelden.');
    }

    // Convert price to cents (assuming input is e.g. "15" or "15.50")
    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

    await db.insert(tasks).values({
        title,
        description,
        category,
        priceCents,
        customerId: userId,
        status: 'open',
    });

    revalidatePath('/tasks');
    revalidatePath('/admin/tasks');
    redirect('/tasks');
}

export async function deleteTask(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/admin/tasks');
    revalidatePath('/tasks');
}



export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const zipCode = formData.get('zipCode') as string;
    const password = formData.get('password') as string;
    const consent = formData.get('consent');

    if (!name || !email || !consent || !zipCode || !password) {
        return { error: 'Bitte füllen Sie alle Pflichtfelder aus.' };
    }

    // Password Validation
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLen || !hasUpper || !hasNumber || !hasSpecial) {
        return { error: 'Passwort erfüllt nicht die Sicherheitsanforderungen.' };
    }

    // ZipCode Validation (Simple whitelist for now as mentioned in UI)
    const allowedPrefixes = ['36', '34', '35']; // Added 35 as it's often close to 36/34 in Hessen
    const prefix = zipCode.substring(0, 2);
    if (!allowedPrefixes.includes(prefix)) {
        return { error: 'Aktuell sind wir nur in den Gebieten 36xxx, 34xxx und 35xxx verfügbar.' };
    }

    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();

    try {
        await db.insert(users).values({
            email,
            fullName: name,
            password: hashedPassword,
            role: 'customer',
            zipCode,
            verificationToken,
            acceptedTermsAt: new Date(),
            acceptedPrivacyAt: new Date(),
            termsVersion: 'v1.0',
            ipAddress: ipAddress,
        });

        // Send verification email
        await sendVerificationEmail(email, name, verificationToken);
    } catch (e: any) {
        if (e.message?.includes('unique constraint') || e.code === '23505') {
            return { error: 'Diese E-Mail Adresse ist bereits registriert.' };
        }
        console.error('Registration error:', e);
        return { error: 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.' };
    }

    redirect('/login?registered=true');
}

export async function getZipCodeStats(zipCode: string) {
    const threshold = 10; // Number of users needed to activate the area
    const userCountResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.zipCode, zipCode));

    const count = userCountResult[0]?.count || 0;
    const isActive = count >= threshold;

    return {
        zipCode,
        count,
        threshold,
        isActive,
        needed: Math.max(0, threshold - count)
    };
}


export async function loginUser(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email und Passwort erforderlich', email };
    }

    const userResult = await db.select().from(users).where(eq(users.email, email));
    const user = userResult[0];

    if (!user) {
        return { error: 'Ungültige Zugangsdaten', email };
    }

    // Check if email is verified
    if (!user.emailVerifiedAt) {
        return { error: 'unverified', email: user.email };
    }

    // Check if account is active
    if (user.isActive === false) {
        return { error: 'Account deaktiviert. Bitte kontaktieren Sie den Support.', email: user.email };
    }

    // Verify password
    if (user.password) {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { error: 'Ungültige Zugangsdaten', email };
        }
    } else {
        // Fallback for old users or if password is missing
        return { error: 'Passwort nicht gesetzt. Bitte Passwort vergessen Funktion nutzen.', email };
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    redirect('/');
}

export async function resendVerificationEmail(email: string) {
    const userResult = await db.select().from(users).where(eq(users.email, email));
    const user = userResult[0];

    if (!user) {
        throw new Error('Nutzers nicht gefunden');
    }

    if (user.emailVerifiedAt) {
        throw new Error('E-Mail ist bereits verifiziert');
    }

    // Use existing token or generate new one
    const token = user.verificationToken || crypto.randomUUID();
    if (!user.verificationToken) {
        await db.update(users).set({ verificationToken: token }).where(eq(users.id, user.id));
    }

    await sendVerificationEmail(user.email, user.fullName || 'Nachbar', token);
    return { success: true };
}

export async function verifyEmail(token: string) {
    const userResult = await db.select().from(users).where(eq(users.verificationToken, token));
    const user = userResult[0];

    if (!user) {
        return { success: false, error: 'Ungültiger Verifizierungslink.' };
    }

    if (user.emailVerifiedAt) {
        return { success: true };
    }

    // Mark user as verified
    await db.update(users)
        .set({
            isVerified: true,
            emailVerifiedAt: new Date(),
        })
        .where(eq(users.id, user.id));

    // PLZ Activation Logic
    if (user.zipCode) {
        const threshold = 10;
        const verifiedUsersInPlz = await db.select({ count: count() })
            .from(users)
            .where(
                and(
                    eq(users.zipCode, user.zipCode),
                    eq(users.isVerified, true)
                )
            );

        const verifiedCount = verifiedUsersInPlz[0]?.count || 0;

        if (verifiedCount >= threshold) {
            // Check if already activated
            const [activation] = await db.select()
                .from(zipCodeActivations)
                .where(eq(zipCodeActivations.zipCode, user.zipCode));

            if (!activation) {
                // Record activation
                await db.insert(zipCodeActivations).values({ zipCode: user.zipCode });

                // Get all verified users to notify
                const recipients = await db.select({ email: users.email })
                    .from(users)
                    .where(
                        and(
                            eq(users.zipCode, user.zipCode),
                            eq(users.isVerified, true)
                        )
                    );

                const emails = recipients.map(r => r.email);
                await sendAreaLaunchEmail(emails, user.zipCode);
                console.log(`🚀 Area ${user.zipCode} activated! Notified ${emails.length} users.`);
            }
        }
    }

    return { success: true };
}

export async function sendInvitationAction(recipientEmail: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return { error: 'Nicht eingeloggt.' };
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { error: 'Benutzer nicht gefunden.' };
    if (!user.zipCode) return { error: 'Bitte gib zuerst deine PLZ in deinem Profil an.' };

    try {
        await sendNeighborInviteEmail(recipientEmail, user.fullName || 'Dein Nachbar', user.zipCode);
        return { success: true };
    } catch (error: any) {
        return { error: 'Einladung konnte nicht gesendet werden.' };
    }
}

export async function logoutUser() {
    (await cookies()).delete('userId');
    redirect('/login');
}

export async function updateUser(formData: FormData) {
    const id = formData.get('id') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const isHelperBadge = formData.get('isHelperBadge') === 'on';
    const isActive = formData.get('isActive') === 'on';

    if (!id || !email) return;

    const data: any = {
        fullName,
        email,
        role,
        isHelperBadge,
        isActive,
    };

    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
    }

    await db.update(users).set(data).where(eq(users.id, id));

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    redirect('/admin/users');
}

export async function deleteUserAdmin(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    // Security check: ensure admin is not deleting themselves easily or at least handle it?
    // For now, let's just delete.

    await db.delete(users).where(eq(users.id, id));

    revalidatePath('/admin/users');
    redirect('/admin/users');
}

export async function adminCreateUser(formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const isVerified = formData.get('isVerified') === 'on';
    // const sendMail = formData.get('sendMail') === 'on'; // Todo: Implement Mailer

    if (!fullName || !email) {
        throw new Error('Name und Email erforderlich');
    }

    try {
        await db.insert(users).values({
            fullName,
            email,
            role,
            password: password || 'changeme', // Temporary default if empty
            isVerified,
            trustLevel: 1 // Default trust for admin created users
        });
    } catch (e) {
        console.error('Create User Error:', e);
        throw new Error('Fehler beim Anlegen');
    }

    revalidatePath('/admin/users');
}


export async function updateEmailTemplate(formData: FormData) {
    const id = formData.get('id') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;

    if (!id || !subject || !body) return;

    await db.update(emailTemplates)
        .set({ subject, body, updatedAt: new Date() })
        .where(eq(emailTemplates.id, id));

    revalidatePath('/admin/email-templates');
    redirect('/admin/email-templates');
}

export async function updateSettings(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    // Helper to upsert setting
    const saveSetting = async (key: string, value: string) => {
        await db.insert(settings).values({ key, value }).onConflictDoUpdate({
            target: settings.key,
            set: { value },
        });
    };

    if (rawData.stripeLivePublicKey) await saveSetting('stripe_live_public_key', rawData.stripeLivePublicKey as string);
    if (rawData.stripeLiveSecretKey) await saveSetting('stripe_live_secret_key', rawData.stripeLiveSecretKey as string);
    if (rawData.stripeSandboxPublicKey) await saveSetting('stripe_sandbox_public_key', rawData.stripeSandboxPublicKey as string);
    if (rawData.stripeSandboxSecretKey) await saveSetting('stripe_sandbox_secret_key', rawData.stripeSandboxSecretKey as string);
    await saveSetting('stripe_test_mode', rawData.stripeTestMode === 'on' ? 'true' : 'false');

    // Modules
    await saveSetting('module_chat', rawData.moduleChat === 'on' ? 'true' : 'false');
    await saveSetting('module_reviews', rawData.moduleReviews === 'on' ? 'true' : 'false');
    await saveSetting('module_subscriptions', rawData.moduleSubscriptions === 'on' ? 'true' : 'false');

    // Email Automation
    revalidatePath('/admin/settings');
}

export async function sendMessage(formData: FormData) {
    const receiverId = formData.get('receiverId') as string;
    const content = formData.get('content') as string;
    const taskId = formData.get('taskId') as string;

    if (!receiverId || !content) return;

    const cookieStore = await cookies();
    const senderId = cookieStore.get('userId')?.value;

    if (!senderId) {
        throw new Error('Nicht eingeloggt');
    }

    const filteredContent = filterContactInfo(content);

    await db.insert(messages).values({
        senderId,
        receiverId,
        taskId: taskId || null,
        content: filteredContent,
    });

    const redirectPath = taskId
        ? `/messages/${receiverId}?taskId=${taskId}`
        : `/messages/${receiverId}`;

    revalidatePath(redirectPath);
    revalidatePath('/messages');
}

export async function markMessagesAsRead(partnerId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId || !partnerId) return;

    await db.update(messages)
        .set({ isRead: true })
        .where(
            and(
                eq(messages.senderId, partnerId),
                eq(messages.receiverId, userId),
                eq(messages.isRead, false)
            )
        );
}

export async function assignTask(taskId: string, helperId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    // Security: Check if user owns the task
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task || task.customerId !== userId) {
        throw new Error('Nicht autorisiert oder Auftrag nicht gefunden');
    }

    await db.update(tasks)
        .set({
            helperId,
            status: 'assigned'
        })
        .where(eq(tasks.id, taskId));

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/profile');
    revalidatePath(`/messages/${helperId}`);
    revalidatePath('/messages');
}

export async function unassignTask(taskId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task || task.customerId !== userId) {
        throw new Error('Nicht autorisiert');
    }

    const helperId = task.helperId;

    await db.update(tasks)
        .set({
            helperId: null,
            status: 'open'
        })
        .where(eq(tasks.id, taskId));

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/profile');
    if (helperId) revalidatePath(`/messages/${helperId}`);
    revalidatePath('/messages');
}

export async function archiveConversation(partnerId: string, taskId: string | null) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    await db.insert(archivedConversations).values({
        userId,
        partnerId,
        taskId
    });

    revalidatePath('/messages');
}

export async function updateActivity() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (userId) {
        await db.update(users)
            .set({ lastSeenAt: new Date() })
            .where(eq(users.id, userId));
    }
}

export async function confirmTaskCompletion(taskId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) throw new Error('Auftrag nicht gefunden');

    let newStatus = task.status;

    if (task.customerId === userId) {
        // Seeker confirming
        if (task.status === 'completed_by_helper') {
            newStatus = 'closed';
            // Trigger payout logic here (placeholder)
            console.log(`💰 Payout triggered for task ${taskId}. Helper ${task.helperId} received funds minus commission.`);
        } else {
            newStatus = 'completed_by_seeker';
        }
    } else if (task.helperId === userId) {
        // Helper confirming
        if (task.status === 'completed_by_seeker') {
            newStatus = 'closed';
            // Trigger payout logic here (placeholder)
            console.log(`💰 Payout triggered for task ${taskId}. Helper ${task.helperId} received funds minus commission.`);
        } else {
            newStatus = 'completed_by_helper';
        }
    } else {
        throw new Error('Nicht autorisiert');
    }

    await db.update(tasks)
        .set({ status: newStatus })
        .where(eq(tasks.id, taskId));

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/profile');
}


export async function updateSubscriptionPlan(formData: FormData) {
    const id = formData.get('id') as string;
    const priceMonthly = formData.get('priceMonthly') as string;
    const priceYearly = formData.get('priceYearly') as string;
    const commissionRate = formData.get('commissionRate') as string;

    if (!id) return;

    const data: any = {};
    if (priceMonthly) data.priceMonthlyCents = Math.round(parseFloat(priceMonthly) * 100);
    if (priceYearly) data.priceYearlyCents = Math.round(parseFloat(priceYearly) * 100);
    if (commissionRate) data.commissionRate = parseInt(commissionRate);

    await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id));

    revalidatePath('/admin/plans');
    revalidatePath('/pricing');

    return { success: true, message: 'Erfolgreich gespeichert' };
}

export async function submitReview(formData: FormData) {
    const taskId = formData.get('taskId') as string;
    const revieweeId = formData.get('revieweeId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;
    const type = formData.get('type') as string; // 'helper' or 'seeker'

    if (!taskId || !revieweeId || !rating || !type) {
        throw new Error('Unvollständige Daten');
    }

    const cookieStore = await cookies();
    const reviewerId = cookieStore.get('userId')?.value;

    if (!reviewerId) {
        throw new Error('Nicht eingeloggt');
    }

    await db.insert(reviews).values({
        taskId,
        reviewerId,
        revieweeId,
        rating,
        comment,
        type,
    });

    revalidatePath('/tasks');
    revalidatePath('/admin/tasks');
    revalidatePath(`/tasks/${taskId}`);
}

export async function toggleHelperBadge(userId: string) {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];

    if (!user) throw new Error('Benutzer nicht gefunden');

    await db.update(users)
        .set({ isHelperBadge: !user.isHelperBadge })
        .where(eq(users.id, userId));

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
}

export async function deleteReview(formData: FormData) {
    const id = formData.get('id') as string;
    const taskId = formData.get('taskId') as string;

    if (!id) return;

    await db.delete(reviews).where(eq(reviews.id, id));

    revalidatePath('/admin/reviews');
    if (taskId) revalidatePath(`/tasks/${taskId}`);
}

export async function updateUserProfile(formData: FormData) {
    const id = formData.get('id') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const bio = formData.get('bio') as string;

    if (!id || !email) return;

    // Security check: Ensure user is updating their own profile
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('userId')?.value;

    if (!sessionUserId || sessionUserId !== id) {
        throw new Error('Nicht autorisiert');
    }

    const data: any = {
        fullName,
        email,
        bio,
    };

    if (password && password.trim() !== '') {
        data.password = password;
    }

    await db.update(users).set(data).where(eq(users.id, id));

    revalidatePath('/profile');
    // redirect('/profile'); // Optional, to refresh page content fully
}
