import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Header } from "../components/ui/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nachbarschafts-Helden",
    template: "%s | Nachbarschafts-Helden"
  },
  description: "Deine Plattform für Nachbarschaftshilfe. Einfach, lokal und sicher Hilfe finden oder anbieten.",
  keywords: ["Nachbarschaftshilfe", "Held", "Hilfe", "Unterstützung", "Lokal", "Nachbarschafts-Helden"],
  authors: [{ name: "Nachbarschafts-Helden Team" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://nachbarschafts-helden.de",
    siteName: "Nachbarschafts-Helden",
    title: "Nachbarschafts-Helden - Deine Nachbarschaftsplattform",
    description: "Verbinde dich mit deinen Nachbarn, biete Hilfe an oder finde Unterstützung in deinem Viertel.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Nachbarschafts-Helden Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nachbarschafts-Helden",
    description: "Deine Plattform für Nachbarschaftshilfe.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { users, messages } from "../lib/schema";
import { eq, and, count } from "drizzle-orm";

import { CookieBanner } from "../components/ui/cookie-banner";
import { Footer } from "../components/ui/footer";
import { ActivityTracker } from "../components/utils/ActivityTracker";
import { getZipCodeStats } from "./actions";

import { headers } from "next/headers";

import { ActivationRedirect } from "@/components/auth/ActivationRedirect";
import { AutoLogout } from "@/components/auth/AutoLogout";
import { FeedbackButton } from "@/components/utils/FeedbackButton";
import { PwaInstallBanner } from "@/components/utils/PwaInstallBanner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const headerList = await headers();
  const headerPath = headerList.get("x-pathname");
  const path = headerPath || "/";

  let user = null;
  let unreadCount = 0;
  let userActive = true;
  let userRole = null;

  if (userId) {
    try {
      const userResult = await db.select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        zipCode: users.zipCode,
        isVerified: users.isVerified,
      }).from(users).where(eq(users.id, userId as string));
      user = userResult[0] || null;

      if (user) {
        userRole = user.role;
        // Check ZIP activation
        if (user.zipCode && user.role !== 'admin') {
          try {
            const stats = await getZipCodeStats(user.zipCode);
            userActive = stats.isActive;
          } catch (err) {
            console.error("ZIP Activation check failed:", err);
          }
        }

        const messageResult = await db.select({
          value: count()
        }).from(messages).where(
          and(
            eq(messages.receiverId, userId as string),
            eq(messages.isRead, false)
          )
        );
        unreadCount = Number(messageResult[0]?.value || 0);
      }
    } catch (e) {
      console.error("Layout data fetch failed:", e);
    }
  }

  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  // Registration was successful
                }, function(err) {
                  // registration failed :(
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100`}
      >
        <ActivityTracker />
        <PwaInstallBanner />
        {userId && <AutoLogout />}
        <ActivationRedirect isActive={userActive} role={userRole} />
        <Header user={user} unreadCount={unreadCount} />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          {!path.startsWith('/admin') && <Footer />}
        </main>
        <CookieBanner />
        <FeedbackButton userId={userId || null} />
      </body>
    </html>
  );
}
