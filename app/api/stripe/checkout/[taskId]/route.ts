import { createCheckoutSession } from '@/app/actions';
import { redirect } from 'next/navigation';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;
    try {
        await createCheckoutSession(taskId);
    } catch (e) {
        console.error('Checkout error:', e);
        redirect(`/tasks/${taskId}?error=checkout_failed`);
    }
}
