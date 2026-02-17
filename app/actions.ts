'use server';

import { db } from '@/lib/db';
import { users, tasks, reviews, messages, subscriptionPlans, emailTemplates, settings, zipCodeActivations, archivedConversations, tags, userTags, zipCoordinates } from '@/lib/schema';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq, or, and, desc, sql, count, sum, lte, gte } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { filterContactInfo } from '@/lib/utils';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, sendAreaLaunchEmail, sendNeighborInviteEmail, sendPStTGWarningEmail, sendPasswordResetEmail } from '@/lib/mailer';
import { createTaskSchema, registerSchema, loginSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';
import { checkContentModeration } from '@/lib/moderation';
import { reports as reportsTable } from '@/lib/schema';
import { ensureZipCoordinates } from '@/lib/self-healing';

export async function createTask(formData: FormData) {
    try {
        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: formData.get('price'),
        };

        const validation = createTaskSchema.safeParse(rawData);

        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        const { title, description, category, price } = validation.data;

        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return { success: false, error: 'Nicht eingeloggt. Bitte erst anmelden.' };
        }

        // PStTG Gatekeeping: Seeker needs minimum Address & Birthday
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user || !user.street || !user.houseNumber || !user.zipCode || !user.city || !user.dateOfBirth) {
            return { success: false, error: 'profile_incomplete_seeker' };
        }

        // Convert price to cents
        const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

        // Auto-Moderation check
        const modResult = checkContentModeration(`${title} ${description}`);
        const moderationStatus = modResult.isFlagged ? 'flagged' : 'approved';
        const isActive = !modResult.isFlagged;

        await db.insert(tasks).values({
            title,
            description,
            category,
            priceCents,
            customerId: userId,
            status: 'open',
            moderationStatus,
            isActive,
        });

        revalidatePath('/tasks');
        revalidatePath('/admin/tasks');

        if (modResult.isFlagged) {
            return { success: true, flagged: true, message: 'Dein Auftrag wurde zur manuellen Prüfung vorgemerkt.' };
        }

        // Return success for client-side redirect handling OR 
        // redirect here if not using a transition (but we are)
        // However, next/navigation redirect() throws a special error which is usually fine if not caught.
        // We will return success to let the client component handle the final state.
        return { success: true, redirect: '/tasks' };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Ein interner Fehler ist aufgetreten.' };
    }
}

export async function deleteTask(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return { error: 'Keine ID angegeben.' };

    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) return { error: 'Nicht eingeloggt.' };

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task) return { error: 'Auftrag nicht gefunden.' };
    if (task.customerId !== userId && user?.role !== 'admin') {
        return { error: 'Nicht berechtigt.' };
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    revalidatePath('/tasks');
    revalidatePath('/admin/tasks');
    revalidatePath('/profile');

    return { success: true };
}

export async function toggleTaskActive(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return { error: 'Keine ID angegeben.' };

    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) return { error: 'Nicht eingeloggt.' };

    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

    if (!task) return { error: 'Auftrag nicht gefunden.' };
    if (task.customerId !== userId) return { error: 'Nicht berechtigt.' };

    await db.update(tasks).set({ isActive: !task.isActive }).where(eq(tasks.id, id));

    revalidatePath('/tasks');
    revalidatePath('/profile');
    revalidatePath('/admin/tasks');

    return { success: true };
}


export async function updateTask(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            price: formData.get('price'),
        };

        const validation = createTaskSchema.safeParse(rawData);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        const { title, description, category, price } = validation.data;

        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        if (!userId) return { success: false, error: 'Nicht eingeloggt.' };

        const [user] = await db.select().from(users).where(eq(users.id, userId));
        const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

        if (!task) return { success: false, error: 'Auftrag nicht gefunden.' };
        if (task.customerId !== userId && user?.role !== 'admin') {
            return { success: false, error: 'Nicht berechtigt.' };
        }

        const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

        // Auto-Moderation check again on update
        const modResult = checkContentModeration(`${title} ${description}`);
        const moderationStatus = modResult.isFlagged ? 'flagged' : 'approved';
        const isActive = !modResult.isFlagged;

        await db.update(tasks).set({
            title,
            description,
            category,
            priceCents,
            moderationStatus,
            isActive,
        }).where(eq(tasks.id, id));

        revalidatePath(`/tasks/${id}`);
        revalidatePath('/tasks');
        revalidatePath('/admin/tasks');
        revalidatePath('/profile');

        return { success: true, flagged: modResult.isFlagged };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: 'Ein interner Fehler ist aufgetreten.' };
    }
}

export async function registerUser(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        zipCode: formData.get('zipCode'),
        password: formData.get('password'),
        consent: formData.get('consent'),
    };

    const validation = registerSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    const { name, email, zipCode, password } = validation.data;

    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    const refCode = formData.get('ref') as string | null;

    // Rate Limit: 5 registrations per hour per IP (prevent spam bots)
    if (!checkRateLimit(`register_${ipAddress}`, 5, 3600)) {
        return { error: 'Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();

    // Generate simple referral code: specific prefix + random string
    const referralCode = `${name.substring(0, 3).toLowerCase()}${Math.random().toString(36).substring(2, 7)}`;

    let referrerId = null;

    try {
        if (refCode) {
            const [referrer] = await db.select().from(users).where(eq(users.referralCode, refCode));
            if (referrer) {
                referrerId = referrer.id;
                // Award Credits to referrer (e.g. 100 cents = 1 Euro)
                await db.update(users)
                    .set({ creditsCents: (referrer.creditsCents || 0) + 100 })
                    .where(eq(users.id, referrerId));
            }
        }

        // Trigger self-healing for the ZIP code
        if (zipCode) {
            await ensureZipCoordinates(zipCode);
        }

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
            referralCode,
            referredBy: referrerId,
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
    noStore();
    try {
        const settingsResult = await db.select().from(settings).where(eq(settings.key, 'zip_activation_threshold'));
        const thresholdVal = settingsResult[0]?.value;
        const threshold = thresholdVal ? parseInt(thresholdVal) : 10;
        const safeThreshold = isNaN(threshold) ? 10 : threshold;

        const userCountResult = await db.select({ value: count() })
            .from(users)
            .where(eq(users.zipCode, zipCode));

        const userCount = Number(userCountResult[0]?.value || 0);
        const isActive = userCount >= safeThreshold;

        return {
            zipCode,
            count: userCount,
            threshold: safeThreshold,
            isActive,
            needed: Math.max(0, safeThreshold - userCount)
        };
    } catch (error) {
        console.error('Error fetching ZIP stats:', error);
        // Return a safe fallback to avoid crashing the UI
        return {
            zipCode,
            count: 0,
            threshold: 10,
            isActive: false,
            needed: 10
        };
    }
}


export async function loginUser(prevState: any, formData: FormData) {
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validation = loginSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: validation.error.issues[0].message, email: rawData.email as string };
    }

    const { email, password } = validation.data;

    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    console.log('Login attempt:', email);

    // Rate Limit: 10 login attempts per minute per IP
    if (!checkRateLimit(`login_${ipAddress}`, 10, 60)) {
        console.log('Rate limit exceeded for:', email);
        return { error: 'Zu viele Anmeldeversuche. Bitte warten Sie eine Minute.', email };
    }

    try {
        console.log('Fetching user from DB...');
        const userResult = await db.select().from(users).where(eq(users.email, email));
        const user = userResult[0];

        if (!user) {
            console.log('User not found:', email);
            return { error: 'Ungültige Zugangsdaten', email };
        }

        // Check if email is verified
        if (!user.emailVerifiedAt) {
            console.log('User unverified:', email);
            return { error: 'unverified', email: user.email };
        }

        // Check if account is active
        if (user.isActive === false) {
            console.log('User inactive:', email);
            return { error: 'Account deaktiviert. Bitte kontaktieren Sie den Support.', email: user.email };
        }

        // Verify password
        if (user.password) {
            console.log('Verifying password...');
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                console.log('Password mismatch for:', email);
                return { error: 'Ungültige Zugangsdaten', email };
            }
        } else {
            console.log('No password set for:', email);
            // Fallback for old users or if password is missing
            return { error: 'Passwort nicht gesetzt. Bitte Passwort vergessen Funktion nutzen.', email };
        }

        console.log('Setting session cookie for:', user.id);
        const cookieStore = await cookies();
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        console.log('Login successful, redirecting...');
    } catch (e) {
        console.error('Login Error:', e);
        throw e;
    }

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

export async function autoLogoutUser() {
    (await cookies()).delete('userId');
    redirect('/login?reason=timeout');
}

export async function updateUser(formData: FormData) {
    const id = formData.get('id') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;
    const isHelperBadge = formData.get('isHelperBadge') === 'on';
    const isActive = formData.get('isActive') === 'on';
    const street = formData.get('street') as string;
    const houseNumber = formData.get('houseNumber') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string || 'Deutschland';
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const taxId = formData.get('taxId') as string;
    const iban = formData.get('iban') as string;
    const bic = formData.get('bic') as string;
    const accountHolderName = formData.get('accountHolderName') as string;
    const zipCode = formData.get('zipCode') as string;

    if (!id || !email) return;

    const data: any = {
        fullName,
        email,
        role,
        isHelperBadge,
        isActive,
        street,
        houseNumber,
        city,
        country,
        taxId,
        iban,
        bic,
        accountHolderName,
        zipCode,
    };

    if (dateOfBirth) {
        data.dateOfBirth = new Date(dateOfBirth);
    }

    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
    }

    await db.update(users).set(data).where(eq(users.id, id));

    // If user is deactivated, deactivate all their tasks
    if (isActive === false) {
        await db.update(tasks).set({ isActive: false }).where(eq(tasks.customerId, id));
        console.log(`Deactivated all tasks for user ${id}`);
    }

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
    revalidatePath('/tasks');
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

    // PStTG Gatekeeping: Helper needs Tax-ID & Bank Data to be assigned
    const [helper] = await db.select().from(users).where(eq(users.id, helperId));
    if (!helper || !helper.taxId || !helper.iban || !helper.bic || !helper.accountHolderName) {
        throw new Error('profile_incomplete_helper');
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

export async function getPStTGStats(userId: string, year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const result = await db.select({
        count: count(),
        totalRevenue: sum(tasks.priceCents)
    })
        .from(tasks)
        .where(
            and(
                eq(tasks.helperId, userId),
                eq(tasks.status, 'closed'),
                gte(tasks.createdAt, startOfYear),
                lte(tasks.createdAt, endOfYear)
            )
        );

    return {
        transactions: Number(result[0]?.count || 0),
        revenueCents: Number(result[0]?.totalRevenue || 0)
    };
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
        } else {
            newStatus = 'completed_by_seeker';
        }
    } else if (task.helperId === userId) {
        // Helper confirming
        if (task.status === 'completed_by_seeker') {
            newStatus = 'closed';
        } else {
            newStatus = 'completed_by_helper';
        }
    } else {
        throw new Error('Nicht autorisiert');
    }

    await db.update(tasks)
        .set({ status: newStatus })
        .where(eq(tasks.id, taskId));

    // PStTG Logic: Check thresholds if task was closed
    if (newStatus === 'closed' && task.helperId) {
        const currentYear = new Date().getFullYear();
        const stats = await getPStTGStats(task.helperId, currentYear);

        // Thresholds: 25 transactions OR 150.000 cents (1500 EUR)
        const THRESHOLD_TX = 25;
        const THRESHOLD_REVENUE = 150000;

        if (stats.transactions >= THRESHOLD_TX || stats.revenueCents >= THRESHOLD_REVENUE) {
            const [helper] = await db.select().from(users).where(eq(users.id, task.helperId));

            // Send warning if not already sent this year
            if (helper && helper.psttgLastWarningYear !== currentYear) {
                await sendPStTGWarningEmail(helper.email, helper.fullName || 'Nachbar', stats);
                await db.update(users)
                    .set({ psttgLastWarningYear: currentYear })
                    .where(eq(users.id, task.helperId));
                console.log(`✉ PStTG Warning sent to helper ${task.helperId}`);
            }
        }
    }

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

export async function updateUserProfile(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    const bio = formData.get('bio') as string;
    const street = formData.get('street') as string;
    const houseNumber = formData.get('houseNumber') as string;
    const zipCode = formData.get('zipCode') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string || 'Deutschland';
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const taxId = formData.get('taxId') as string;
    const iban = formData.get('iban') as string;
    const bic = formData.get('bic') as string;
    const accountHolderName = formData.get('accountHolderName') as string;

    if (!id || !email) return { error: 'ID und E-Mail sind erforderlich' };

    // Security check: Ensure user is updating their own profile
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('userId')?.value;

    if (!sessionUserId || sessionUserId !== id) {
        return { error: 'Nicht autorisiert' };
    }

    const data: any = {
        fullName,
        email,
        bio,
        street,
        houseNumber,
        zipCode,
        city,
        country,
        taxId,
        iban,
        bic,
        accountHolderName,
    };

    if (dateOfBirth) {
        data.dateOfBirth = new Date(dateOfBirth);
    }

    if (password && password.trim() !== '') {
        if (password !== passwordConfirm) {
            return { error: 'Die Passwörter stimmen nicht überein' };
        }
        const bcrypt = await import('bcryptjs');
        data.password = await bcrypt.hash(password, 10);
    }

    console.log('Update Profile Payload:', data);
    try {
        // Trigger self-healing for the ZIP code
        if (zipCode) {
            await ensureZipCoordinates(zipCode);
        }

        await db.update(users).set(data).where(eq(users.id, id));
        revalidatePath('/profile');
        return { success: true };
    } catch (e) {
        console.error('Update profile error:', e);
        return { error: 'Fehler beim Speichern der Profildaten' };
    }
}

export async function toggleUserTag(tagId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    // Check if link exists
    const [existing] = await db.select()
        .from(userTags)
        .where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId)));

    if (existing) {
        await db.delete(userTags)
            .where(and(eq(userTags.userId, userId), eq(userTags.tagId, tagId)));
    } else {
        await db.insert(userTags).values({ userId, tagId });
    }

    revalidatePath('/profile');
}

export async function suggestTag(name: string, category: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) throw new Error('Nicht eingeloggt');

    try {
        // Create tag
        const [newTag] = await db.insert(tags).values({
            name,
            category,
            isApproved: false,
            suggestedById: userId,
        }).returning();

        // Link to user
        await db.insert(userTags).values({
            userId,
            tagId: newTag.id,
        });

        revalidatePath('/profile');
        return { success: true, tag: newTag };
    } catch (e: any) {
        if (e.message?.includes('unique constraint') || e.code === '23505') {
            // Tag already exists, just link it if not already linked
            const [existingTag] = await db.select().from(tags).where(eq(tags.name, name));
            if (existingTag) {
                await db.insert(userTags).values({ userId, tagId: existingTag.id }).onConflictDoNothing();
                revalidatePath('/profile');
                return { success: true, tag: existingTag };
            }
        }
        return { error: 'Fehler beim Vorschlagen des Tags.' };
    }
}

export async function approveTag(tagId: string) {
    await db.update(tags)
        .set({ isApproved: true })
        .where(eq(tags.id, tagId));

    revalidatePath('/admin/tags');
    revalidatePath('/profile');
}

export async function deleteTag(tagId: string) {
    // Delete links first (though cascade might be better, let's be explicit)
    await db.delete(userTags).where(eq(userTags.tagId, tagId));
    await db.delete(tags).where(eq(tags.id, tagId));

    revalidatePath('/admin/tags');
    revalidatePath('/profile');
}

export async function updateTagAdmin(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const isApproved = formData.get('isApproved') === 'on';

    if (!id || !name || !category) return;

    await db.update(tags)
        .set({ name, category, isApproved })
        .where(eq(tags.id, id));

    revalidatePath('/admin/tags');
    revalidatePath('/profile');
}

import { getStripeClient } from '@/lib/stripe';

export async function createCheckoutSession(taskId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) throw new Error('Nicht eingeloggt');

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) throw new Error('Auftrag nicht gefunden');
    if (task.customerId !== userId) throw new Error('Nicht autorisiert');

    const stripe = await getStripeClient();
    const origin = (await headers()).get('origin') || 'http://localhost:3009';

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'sepa_debit', 'giropay'],
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: task.title,
                        description: task.description,
                    },
                    unit_amount: task.priceCents,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${origin}/tasks/${taskId}?payment=success`,
        cancel_url: `${origin}/tasks/${taskId}?payment=cancel`,
        metadata: {
            taskId: task.id,
            customerId: userId,
        },
    });

    if (!session.url) throw new Error('Fehler beim Erstellen der Stripe-Session');
    redirect(session.url);
}

export async function onboardHelper() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) throw new Error('Nicht eingeloggt');

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User nicht gefunden');

    const stripe = await getStripeClient();
    let accountId = user.stripeAccountId;

    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        accountId = account.id;
        await db.update(users).set({ stripeAccountId: accountId }).where(eq(users.id, userId));
    }

    const origin = (await headers()).get('origin') || 'http://localhost:3009';
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/profile`,
        return_url: `${origin}/profile`,
        type: 'account_onboarding',
    });

    redirect(accountLink.url);
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: 'E-Mail ist erforderlich' };
    }

    const userResult = await db.select().from(users).where(eq(users.email, email));
    const user = userResult[0];

    // Security: Do not reveal if user exists. Just say "If email exists..."
    // But for better UX in this specific app context, providing feedback might be okay?
    // Let's stick to standard security practice: Always return success message.

    if (user) {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await db.update(users)
            .set({
                resetPasswordToken: token,
                resetPasswordExpiresAt: expiresAt,
            })
            .where(eq(users.id, user.id));

        try {
            await sendPasswordResetEmail(user.email, user.fullName || 'Nachbar', token);
        } catch (error) {
            console.error('Failed to send reset email:', error);
            // Even if email fails, we might want to tell user "If account exists..." or show generic error
            return { error: 'Konnte E-Mail nicht senden. Bitte später erneut versuchen.' };
        }
    }

    return { success: true, message: 'Falls ein Konto mit dieser E-Mail existiert, haben wir einen Link zum Zurücksetzen gesendet.' };
}

export async function resetPassword(prevState: any, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;

    if (!token || !password || !passwordConfirm) {
        return { error: 'Alle Felder sind erforderlich' };
    }

    if (password !== passwordConfirm) {
        return { error: 'Passwörter stimmen nicht überein' };
    }

    if (password.length < 8) {
        return { error: 'Passwort muss mindestens 8 Zeichen lang sein' };
    }

    const userResult = await db.select().from(users)
        .where(
            and(
                eq(users.resetPasswordToken, token),
                gte(users.resetPasswordExpiresAt, new Date())
            )
        );

    const user = userResult[0];

    if (!user) {
        return { error: 'Ungültiger oder abgelaufener Link. Bitte fordere einen neuen an.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users)
        .set({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiresAt: null,
        })
        .where(eq(users.id, user.id));

    redirect('/login?reset=success');
}

export async function toggleUserVerification(userId: string, isVerified: boolean) {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('userId')?.value;

    if (!adminId) {
        return { success: false, error: 'Unauthorized' };
    }

    const [adminUser] = await db.select().from(users).where(eq(users.id, adminId));

    if (!adminUser || adminUser.role !== 'admin') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await db.update(users)
            .set({ isVerified: isVerified })
            .where(eq(users.id, userId));

        revalidatePath('/admin/users');
        revalidatePath(`/admin/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle verification:', error);
        return { success: false, error: 'Failed to update verification status' };
    }
}

export async function reportTask(taskId: string, reason: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) throw new Error('Nicht eingeloggt');

    await db.insert(reportsTable).values({
        reporterId: userId,
        targetTaskId: taskId,
        reason,
    });

    // Flag the task automatically
    await db.update(tasks).set({ moderationStatus: 'flagged' }).where(eq(tasks.id, taskId));

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/admin/tasks');
}

export async function reportUser(targetUserId: string, reason: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) throw new Error('Nicht eingeloggt');

    await db.insert(reportsTable).values({
        reporterId: userId,
        targetUserId,
        reason,
    });
}

export async function approveTask(taskId: string) {
    await db.update(tasks)
        .set({ moderationStatus: 'approved', isActive: true })
        .where(eq(tasks.id, taskId));
    revalidatePath('/admin/tasks');
    revalidatePath('/tasks');
}

export async function rejectTask(taskId: string) {
    await db.update(tasks)
        .set({ moderationStatus: 'rejected', isActive: false })
        .where(eq(tasks.id, taskId));
    revalidatePath('/admin/tasks');
    revalidatePath('/tasks');
}



export async function getTasksInRadius(userZip: string, radiusKm: number) {
    if (!userZip || !radiusKm) return { success: false, error: 'Invalid parameters' };

    try {
        // 1. Get coordinates for the user's ZIP (center)
        const [center] = await db.select({
            lat: zipCoordinates.latitude,
            lng: zipCoordinates.longitude
        })
            .from(zipCoordinates)
            .where(eq(zipCoordinates.zipCode, userZip));

        if (!center) return { success: false, error: 'ZIP coordinates not found' };

        // 2. Query tasks with distance calculation
        const distanceSql = sql<number>`
            (6371 * acos(
                cos(radians(${center.lat})) * cos(radians(${zipCoordinates.latitude})) *
                cos(radians(${zipCoordinates.longitude}) - radians(${center.lng})) +
                sin(radians(${center.lat})) * sin(radians(${zipCoordinates.latitude}))
            ))
        `;

        const tasksWithDistance = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                priceCents: tasks.priceCents,
                latitude: zipCoordinates.latitude,
                longitude: zipCoordinates.longitude,
                zipCode: users.zipCode,
                distance: distanceSql,
            })
            .from(tasks)
            .innerJoin(users, eq(tasks.customerId, users.id))
            .innerJoin(zipCoordinates, eq(users.zipCode, zipCoordinates.zipCode))
            .where(
                and(
                    eq(tasks.isActive, true),
                    eq(tasks.moderationStatus, 'approved')
                    // Removed radius filter for the map pins (we want all), 
                    // BUT for this specific function which implies "InRadius", we should keep it?
                    // The user wants ALL on map. So we need a new function or modify this one.
                    // Let's create a new function `getAllTaskMarkers` or similar.
                )
            )
            .orderBy(distanceSql);

        // Filter returned tasks by radius ONLY for the list view usage, 
        // OR return them all and let client filter?
        // Better: Return ALL for map, but mark if they are in radius?
        // Actually, let's keep this function as "getTasksInRadius" for list view
        // and create a new one for valid map data.

        // Wait, the map component calls this. If we want ALL tasks on map, 
        // the map component should call a function that returns ALL tasks.

        return {
            success: true,
            tasks: tasksWithDistance.filter(t => t.distance <= radiusKm), // explicit filter for list
            allTasks: tasksWithDistance, // return all for map? No, payload too big if logic changes.
            center: center
        };

    } catch (error) {
        console.error('Error fetching tasks in radius:', error);
        return { success: false, error: 'Failed to fetch tasks' };
    }
}

export async function getAllTaskMarkers() {
    noStore();
    try {
        const result = await db
            .select({
                id: tasks.id,
                title: tasks.title,
                description: tasks.description,
                priceCents: tasks.priceCents,
                latitude: zipCoordinates.latitude,
                longitude: zipCoordinates.longitude,
                zipCode: users.zipCode,
            })
            .from(tasks)
            .innerJoin(users, eq(tasks.customerId, users.id))
            .innerJoin(zipCoordinates, eq(users.zipCode, zipCoordinates.zipCode))
            .where(
                and(
                    eq(tasks.isActive, true),
                    eq(tasks.moderationStatus, 'approved')
                )
            );

        return { success: true, tasks: result };
    } catch (error) {
        return { success: false, error: 'Fehler beim Laden der Karten-Pins' };
    }
}
