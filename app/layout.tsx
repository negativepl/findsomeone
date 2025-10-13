import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import TopLoader from "@/components/TopLoader";
import { MobileDockWrapper } from "@/components/MobileDockWrapper";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

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
    default: "FindSomeone - Znajdź lokalnych specjalistów",
    template: "%s | FindSomeone"
  },
  description: "Platforma łącząca ludzi lokalnie. Znajdź specjalistów lub oferuj swoje usługi - hydraulika, elektryka, sprzątanie i więcej.",
  keywords: ["usługi lokalne", "specjaliści", "ogłoszenia", "hydraulik", "elektryk", "sprzątanie"],
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
    viewportFit: 'cover',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers>
          {children}
          <MobileDockWrapper user={user} />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
