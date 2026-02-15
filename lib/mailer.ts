import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(to: string, name: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify/${token}`;

    const mailOptions = {
        from: `"Hilfe von Nebenan" <${process.env.SMTP_FROM || 'noreply@hilfevonnebenan.de'}>`,
        to,
        subject: 'Bestätige deine E-Mail-Adresse | Hilfe von Nebenan',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #d97706;">Hallo ${name},</h2>
                <p>vielen Dank für deine Registrierung bei <strong>Hilfe von Nebenan</strong>!</p>
                <p>Damit du direkt loslegen kannst, bestätige bitte kurz deine E-Mail-Adresse durch einen Klick auf den folgenden Button:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">E-Mail bestätigen</a>
                </div>
                <p style="font-size: 12px; color: #666;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>${verifyUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">Diese Mail wurde automatisch generiert. Bitte antworte nicht darauf.</p>
            </div>
        `,
    };

    if (!process.env.SMTP_USER) {
        console.log('--- DEVELOPMENT MAIL LOG ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Token: ${token}`);
        console.log(`Verify URL: ${verifyUrl}`);
        console.log('----------------------------');
        return;
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('E-Mail konnte nicht versendet werden.');
    }
}
export async function sendAreaLaunchEmail(toEmails: string[], zipCode: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3009';

    const mailOptions = {
        from: `"Hilfe von Nebenan" <${process.env.SMTP_FROM}>`,
        bcc: toEmails.join(', '),
        subject: `Gute Nachrichten! Hilfe von Nebenan ist jetzt live in ${zipCode} 🚀`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #d97706; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 32px; line-height: 64px;">❤</div>
                </div>
                <h1 style="color: #111827; text-align: center; font-size: 28px; font-weight: 800; margin-bottom: 10px;">Es geht los! 🚀</h1>
                <p style="color: #4b5563; text-align: center; font-size: 18px; line-height: 1.6;">
                    Gute Nachrichten für dich und dein Viertel: In <strong>${zipCode}</strong> haben sich genug Nachbarn gefunden!
                </p>
                <div style="background-color: #fffbeb; border: 2px dashed #fcd34d; border-radius: 20px; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="color: #92400e; font-weight: 700; margin: 0;">Die Plattform ist ab sofort für dich freigeschaltet.</p>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${baseUrl}" style="background-color: #d97706; color: white; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.3);">Jetzt Nachbarn finden</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center; line-height: 1.5;">
                    Vielen Dank, dass du von Anfang an dabei bist. Gemeinsam machen wir die Nachbarschaft ein Stück besser.
                </p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;">
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                    Hilfe von Nebenan | Deine lokale Plattform für Nachbarschaftshilfe
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending launch email:', error);
    }
}

export async function sendNeighborInviteEmail(toEmail: string, senderName: string, zipCode: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3009';

    const mailOptions = {
        from: `"Hilfe von Nebenan" <${process.env.SMTP_FROM}>`,
        to: toEmail,
        subject: `${senderName} lädt dich zu Hilfe von Nebenan in ${zipCode} ein!`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #d97706; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 32px; line-height: 64px;">❤</div>
                </div>
                <h2 style="color: #111827; text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Hallo Nachbar! 👋</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center;">
                    <strong>${senderName}</strong> hat dich eingeladen, Teil von <strong>Hilfe von Nebenan</strong> in <strong>${zipCode}</strong> zu werden.
                </p>
                <div style="background-color: #f9fafb; border-radius: 20px; padding: 25px; margin: 30px 0; border: 1px solid #f3f4f6 text-align: center;">
                    <p style="color: #374151; font-style: italic; margin: 0; line-height: 1.6;">
                        "Ich habe eine tolle neue Plattform für Nachbarschaftshilfe entdeckt. Damit wir in ${zipCode} starten können, brauchen wir noch ein paar Leute. Machst du mit?"
                    </p>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${baseUrl}/register" style="background-color: #d97706; color: white; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(217, 119, 6, 0.3);">Kostenlos registrieren</a>
                </div>
                <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                    Dein Nachbar <strong>${senderName}</strong> freut sich auf dich!
                </p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;">
                <p style="font-size: 11px; color: #d1d5db; text-align: center;">
                    Solltest du keine weiteren Einladungen erhalten wollen, kannst du diese Mail ignorieren.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invite sent from ${senderName} to ${toEmail}`);
    } catch (error) {
        console.error('Error sending invite email:', error);
        throw new Error('E-Mail konnte nicht versendet werden.');
    }
}
export async function sendPStTGWarningEmail(to: string, name: string, stats: { transactions: number, revenueCents: number }) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3009';
    const revenueEur = (stats.revenueCents / 100).toFixed(2);

    const mailOptions = {
        from: `"Finanz-Team | Hilfe von Nebenan" <${process.env.SMTP_FROM}>`,
        to,
        subject: 'Wichtiger Hinweis zu deiner steuerlichen Meldepflicht (PStTG) | Hilfe von Nebenan',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #fca5a5; border-radius: 24px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="background-color: #ef4444; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 32px; line-height: 64px;">⚠</div>
                </div>
                <h2 style="color: #111827; text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Wichtiger Hinweis für dich, ${name}</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Wir möchten dich darüber informieren, dass du im laufenden Kalenderjahr bald die gesetzlichen Schwellenwerte für die Meldepflicht nach dem <strong>Plattformen-Steuertransparenzgesetz (PStTG)</strong> erreichst.
                </p>
                <div style="background-color: #fef2f2; border-radius: 20px; padding: 25px; margin: 30px 0; border: 1px solid #fee2e2;">
                    <h4 style="color: #991b1b; margin-top: 0; margin-bottom: 15px;">Deine aktuellen Werte für das Kalenderjahr:</h4>
                    <ul style="color: #b91c1c; margin: 0; padding-left: 20px;">
                        <li>Abgeschlossene Hilfen: <strong>${stats.transactions}</strong> (Grenze: 30)</li>
                        <li>Gesamtumsatz: <strong>${revenueEur} €</strong> (Grenze: 2.000 €)</li>
                    </ul>
                </div>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    <strong>Keine Sorge:</strong> Nachbarschaftshilfe ist in der Regel bis zu gewissen Freibeträgen steuerfrei. Wir sind jedoch gesetzlich verpflichtet, dem Bundeszentralamt für Steuern (BZSt) Daten zu übermitteln, sobald die Grenze von 30 Transaktionen oder 2.000 € Umsatz überschritten wird.
                </p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${baseUrl}/profile" style="background-color: #111827; color: white; padding: 18px 36px; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 16px; display: inline-block;">Profil überprüfen</a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                    Bei Fragen wende dich bitte an deinen Steuerberater. Wir stellen dir am Jahresende eine übersichtliche Aufstellung deiner Transaktionen zur Verfügung, die du beim Finanzamt einreichen kannst.
                </p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 40px 0;">
                <p style="font-size: 11px; color: #d1d5db; text-align: center;">
                    Dies ist eine gesetzlich erforderliche Information von Hilfe von Nebenan.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`PStTG Warning sent to ${to}`);
    } catch (error) {
        console.error('Error sending PStTG warning email:', error);
    }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    const mailOptions = {
        from: `"Hilfe von Nebenan" <${process.env.SMTP_FROM || 'noreply@hilfevonnebenan.de'}>`,
        to,
        subject: 'Passwort zurücksetzen | Hilfe von Nebenan',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #d97706;">Hallo ${name},</h2>
                <p>du hast angefordert, dein Passwort zurückzusetzen.</p>
                <p>Klicke auf den folgenden Button, um ein neues Passwort zu vergeben:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Passwort ändern</a>
                </div>
                <p style="font-size: 12px; color: #666;">Dieser Link ist 1 Stunde lang gültig.</p>
                <p style="font-size: 12px; color: #666;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>${resetUrl}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">Falls du dies nicht angefordert hast, kannst du diese Mail ignorieren.</p>
            </div>
        `,
    };

    if (!process.env.SMTP_USER) {
        console.log('--- DEVELOPMENT MAIL LOG ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('----------------------------');
        return;
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${to}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('E-Mail konnte nicht versendet werden.');
    }
}
