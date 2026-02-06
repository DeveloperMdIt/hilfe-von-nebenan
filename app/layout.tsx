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
  title: "Hilfe von Nebenan",
  description: "Deine Plattform für Nachbarschaftshilfe.",
};

import { cookies } from "next/headers";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq } from "drizzle-orm";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  let user = null;

  if (userId) {
    const result = await db.select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    }).from(users).where(eq(users.id, userId));
    user = result[0] || null;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950`}
      >
        <Header user={user} />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
