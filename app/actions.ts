'use server';

import { db } from '../lib/db';
import { tasks, reviews } from '../lib/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = formData.get('price') as string;

    // Basic validation
    if (!title || !description || !price) {
        throw new Error('Bitte alle Felder ausfüllen');
    }

    // Convert price to cents (assuming input is e.g. "15" or "15.50")
    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);

    // In a real app, we would get the user ID from the session
    // For now, we'll fetch the first user (our seed customer)
    // const user = await db.query.users.findFirst(); 
    // simplified:
    const result = await db.select().from(users).limit(1);
    const userId = result[0]?.id;

    if (!userId) {
        throw new Error('Kein Benutzer gefunden (Seed script gelaufen?)');
    }

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

import { users } from '../lib/schema';

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
    const role = 'customer'; // Default role

    const consent = formData.get('consent');

    if (!name || !email || !consent) {
        throw new Error('Bitte füllen Sie alle Pflichtfelder aus.');
    }

    const cookieStore = await cookies(); // Used later for session
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';

    // Check if user exists (mock check, or handle unique constraint error)
    // For now, just try insert
    try {
        await db.insert(users).values({
            email,
            fullName: name,
            role,
            // default trustLevel, isVerified etc from schema defaults
            acceptedTermsAt: new Date(),
            acceptedPrivacyAt: new Date(),
            termsVersion: 'v1.0',
            ipAddress: ipAddress,
        });
    } catch (e) {
        console.error('Registration error:', e);
        // In real app, return error to form
        throw new Error('Email existiert bereits oder Fehler aufgetreten');
    }

    redirect('/login');
}

import { cookies, headers } from 'next/headers';

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        throw new Error('Email erforderlich');
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user) {
        throw new Error('Benutzer nicht gefunden');
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    if (user.role === 'admin') {
        redirect('/admin');
    } else {
        redirect('/tasks');
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

    if (!id || !email) return;

    const data: any = {
        fullName,
        email,
        role,
        isHelperBadge,
    };

    if (password && password.trim() !== '') {
        data.password = password;
    }

    await db.update(users).set(data).where(eq(users.id, id));

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}`);
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

import { emailTemplates, settings } from '../lib/schema';

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
    if (rawData.reminderDays) await saveSetting('reminder_days', rawData.reminderDays as string);

    revalidatePath('/admin/settings');
}

import { messages } from '../lib/schema';
import { or, and, desc } from 'drizzle-orm';

export async function sendMessage(formData: FormData) {
    const receiverId = formData.get('receiverId') as string;
    const content = formData.get('content') as string;

    if (!receiverId || !content) return;

    const cookieStore = await cookies();
    const senderId = cookieStore.get('userId')?.value;

    if (!senderId) {
        throw new Error('Nicht eingeloggt');
    }

    await db.insert(messages).values({
        senderId,
        receiverId,
        content,
    });

    revalidatePath(`/messages/${receiverId}`);
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

import { subscriptionPlans } from '../lib/schema';



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
    };

    if (password && password.trim() !== '') {
        data.password = password;
    }

    await db.update(users).set(data).where(eq(users.id, id));

    revalidatePath('/profile');
    // redirect('/profile'); // Optional, to refresh page content fully
}
