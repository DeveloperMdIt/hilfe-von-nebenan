import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });

async function testEmail() {
    console.log('--- Testing SMTP Configuration ---');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Secure: ${process.env.SMTP_SECURE}`);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection successful!');

        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_FROM}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email | Hilfe von Nebenan',
            text: 'This is a test email to verify SMTP settings.',
            html: '<b>This is a test email to verify SMTP settings.</b>',
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP Error:', error);
    }
}

testEmail();
