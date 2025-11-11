import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SonnerToaster } from "@/components/providers/sonner-toaster";

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
    template: "%s | Pulse Dashboard",
    default: "Pulse Dashboard",
  },
  description:
    "Secure, production-ready dashboard starter featuring authentication, Prisma ORM, and modern UI components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}>
        <AuthSessionProvider>
          {children}
          <SonnerToaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
