import Stripe from 'stripe';
import { db } from './db';
import { settings } from './schema';
import { eq } from 'drizzle-orm';

export async function getStripeClient() {
    const testModeResult = await db.select().from(settings).where(eq(settings.key, 'stripe_test_mode'));
    const isTestMode = testModeResult[0]?.value === 'true';

    const secretKeyKey = isTestMode ? 'stripe_sandbox_secret_key' : 'stripe_live_secret_key';
    const secretKeyResult = await db.select().from(settings).where(eq(settings.key, secretKeyKey));
    const secretKey = secretKeyResult[0]?.value;

    if (!secretKey) {
        throw new Error(`Stripe secret key (${secretKeyKey}) not found in settings.`);
    }

    return new Stripe(secretKey, {
        apiVersion: '2025-02-11-preview' as any, // Use latest or specific
    });
}
