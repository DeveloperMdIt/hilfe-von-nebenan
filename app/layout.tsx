import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
    default: "Hilfe von Nebenan",
    template: "%s | Hilfe von Nebenan"
  },
  description: "Deine Plattform für Nachbarschaftshilfe. Einfach, lokal und sicher Hilfe finden oder anbieten.",
  keywords: ["Nachbarschaftshilfe", "Nebenan", "Hilfe", "Unterstützung", "Lokal"],
  authors: [{ name: "Hilfe von Nebenan Team" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://hilfe-von-nebenan.de",
    siteName: "Hilfe von Nebenan",
    title: "Hilfe von Nebenan - Deine Nachbarschaftsplattform",
    description: "Verbinde dich mit deinen Nachbarn, biete Hilfe an oder finde Unterstützung in deinem Viertel.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Hilfe von Nebenan Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hilfe von Nebenan",
    description: "Deine Plattform für Nachbarschaftshilfe.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { cookies } from "next/headers";
import { db } from "../lib/db";
import { users, messages } from "../lib/schema";
import { eq, and, count } from "drizzle-orm";

import { CookieBanner } from "../components/ui/cookie-banner";
import { Footer } from "../components/ui/footer";
import { ActivityTracker } from "../components/utils/ActivityTracker";
import { getZipCodeStats } from "./actions";
import ZipCodeWaitingView from "../components/dashboard/ZipCodeWaitingView";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const headerList = await headers();
  const urlHeader = headerList.get("x-url") || headerList.get("referer") || "";

  let path = "/";
  if (urlHeader) {
    try {
      if (urlHeader.startsWith("http")) {
        path = new URL(urlHeader).pathname;
      } else {
        path = urlHeader.split("?")[0];
      }
    } catch (e) {
      console.error("Layout path parsing failed:", e);
    }
  }

  const isExempt = path === "/profile" || path === "/login" || path.startsWith("/api") || path.startsWith("/verify");

  let user = null;
  let unreadCount = 0;
  let waitingInfo = null;

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
        // Check ZIP activation
        if (user.zipCode && !isExempt) {
          const stats = await getZipCodeStats(user.zipCode);
          if (!stats.isActive) {
            waitingInfo = stats;
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

  const content = waitingInfo ? (
    <div className="min-h-[calc(100vh-80px)] bg-amber-50/50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <ZipCodeWaitingView
        zipCode={waitingInfo.zipCode}
        count={waitingInfo.count}
        threshold={waitingInfo.threshold}
        needed={waitingInfo.needed}
        userName={user?.fullName || "Nachbar"}
      />
    </div>
  ) : children;

  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100`}
      >
        <ActivityTracker />
        <Header user={user} unreadCount={unreadCount} />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1">
            {content}
          </div>
          <Footer />
        </main>
        <CookieBanner />
      </body>
    </html>
  );
}
