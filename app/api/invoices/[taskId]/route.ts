import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateInvoicePDF } from '@/lib/invoices';
import { cookies } from 'next/headers';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const { taskId } = await params;

    // 1. Auth Check
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Data Fetching
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return new NextResponse('Not Found', { status: 404 });

    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));

    // 3. Authorization Check
    // Allowed: Customer (Seeker), Helper, or Admin
    const isCustomer = task.customerId === userId;
    const isHelper = task.helperId === userId;
    const isAdmin = currentUser?.role === 'admin';

    if (!isCustomer && !isHelper && !isAdmin) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const [customer] = await db.select().from(users).where(eq(users.id, task.customerId!));
    const [helper] = await db.select().from(users).where(eq(users.id, task.helperId!));

    const customerAddress = customer
        ? `${customer.street} ${customer.houseNumber}, ${customer.zipCode} ${customer.city}`
        : 'Keine Adresse hinterlegt';

    const pdfData = {
        invoiceNumber: `INV-${task.id.substring(0, 8).toUpperCase()}`,
        date: task.createdAt?.toLocaleDateString('de-DE') || new Date().toLocaleDateString('de-DE'),
        customerName: customer?.fullName || 'Unbekannter Kunde',
        customerAddress: customerAddress,
        helperName: helper?.fullName || 'Unbekannter Helfer',
        taskTitle: task.title,
        amountCents: task.priceCents,
        commissionCents: task.commissionCents || 0,
        payoutCents: task.payoutCents || 0,
    };

    const doc = generateInvoicePDF(pdfData);
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Rechnung-${task.id.substring(0, 8)}.pdf"`,
        },
    });
}
