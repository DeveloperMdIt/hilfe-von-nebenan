import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeClient } from '@/lib/stripe';
import { db } from '@/lib/db';
import { settings, tasks, users, subscriptionPlans } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    const stripe = await getStripeClient();

    // Fetch webhook secret from settings
    const webhookSecretResult = await db.select().from(settings).where(eq(settings.key, 'stripe_webhook_secret'));
    const webhookSecret = webhookSecretResult[0]?.value;

    if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const taskId = session.metadata?.taskId;

        if (taskId) {
            const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

            // Idempotency: If already paid, do nothing
            if (task && task.status !== 'paid') {
                const [customer] = await db.select().from(users).where(eq(users.id, task.customerId!));
                const [helper] = await db.select().from(users).where(eq(users.id, task.helperId!));

                // Calculate commission and payout based on subscription plan
                // Default to 15% if not found
                let commissionRate = 15;
                if (helper?.planId) {
                    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, helper.planId));
                    if (plan) commissionRate = plan.commissionRate;
                }

                const commissionCents = Math.round((task.priceCents * commissionRate) / 100);
                const payoutCents = task.priceCents - commissionCents;

                await db.update(tasks).set({
                    status: 'paid',
                    commissionCents,
                    payoutCents,
                    stripePaymentIntentId: session.payment_intent as string,
                }).where(eq(tasks.id, taskId));

                // Trigger automated payout via Stripe Connect
                if (helper?.stripeAccountId) {
                    try {
                        await stripe.transfers.create({
                            amount: payoutCents,
                            currency: 'eur',
                            destination: helper.stripeAccountId,
                            transfer_group: taskId,
                        });
                        console.log(`Payout of ${payoutCents} cents to ${helper.stripeAccountId} initiated.`);
                    } catch (e) {
                        console.error('Auto-payout failed:', e);
                        // Important: We do NOT re-throw here. The payment from customer was successful.
                        // We need to flag this for manual review/retry, but not fail the webhook
                        // which would cause Stripe to retry the entire event.
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
