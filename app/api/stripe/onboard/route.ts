import { onboardHelper } from '@/app/actions';
import { redirect } from 'next/navigation';

export async function POST() {
    try {
        await onboardHelper();
    } catch (e) {
        console.error('Onboarding error:', e);
        redirect('/profile?error=stripe_onboarding_failed');
    }
}
