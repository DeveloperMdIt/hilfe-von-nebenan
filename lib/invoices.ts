import { jsPDF } from 'jspdf';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerAddress: string;
    helperName: string;
    taskTitle: string;
    amountCents: number;
    commissionCents: number;
    payoutCents: number;
}

export function generateInvoicePDF(data: InvoiceData) {
    const doc = new jsPDF();
    const margin = 20;

    // Header
    doc.setFontSize(22);
    doc.text('RECHNUNG', margin, 30);
    doc.setFontSize(10);
    doc.text(`Rechnungsnr: ${data.invoiceNumber}`, margin, 40);
    doc.text(`Datum: ${data.date}`, margin, 45);

    // Platform Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Nachbarschafts-Helden', 140, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Ein Projekt von MD IT Solutions', 140, 35);
    doc.text('Musterstraße 123', 140, 40);
    doc.text('12345 Musterstadt', 140, 45);

    // Recipient
    doc.setFont('helvetica', 'bold');
    doc.text('Empfänger:', margin, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerName, margin, 70);
    doc.text(data.customerAddress, margin, 75);

    // Item Table
    let y = 100;
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Beschreibung', margin, y);
    doc.text('Betrag', 160, y);
    y += 5;
    doc.line(margin, y, 190, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(data.taskTitle, margin, y);
    doc.text(`${(data.amountCents / 100).toFixed(2)} €`, 160, y);

    y += 20;
    doc.line(margin, y, 190, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Gesamtbetrag:', 120, y);
    doc.text(`${(data.amountCents / 100).toFixed(2)} €`, 160, y);

    y += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Davon Vermittlungsprovision: ${(data.commissionCents / 100).toFixed(2)} €`, margin, y);
    doc.text(`Auszahlung an Helfer (${data.helperName}): ${(data.payoutCents / 100).toFixed(2)} €`, margin, y + 5);

    // Footer
    doc.setFontSize(8);
    doc.text('Vielen Dank für die Nutzung von Nachbarschafts-Helden!', margin, 270);
    doc.text('Umsatzsteuerbefreit aufgrund der Kleinunternehmerregelung gemäß § 19 UStG.', margin, 275);

    return doc;
}
