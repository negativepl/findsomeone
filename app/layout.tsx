import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalAnalytics } from "@/components/ConditionalAnalytics";
import TopLoader from "@/components/TopLoader";
import { MobileDockWrapper } from "@/components/MobileDockWrapper";
import { InstallPrompt } from "@/components/InstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://findsomeone.app'),
  title: {
    default: "FindSomeone - Znajdź pomoc w okolicy",
    template: "%s | FindSomeone"
  },
  description: "Lokalna platforma ogłoszeń łącząca ludzi w Twoim mieście. Sprzedawaj, kupuj, wynajmuj, oferuj usługi lub szukaj pomocy. Wszelkie ogłoszenia w okolicy - za darmo.",
  keywords: ["lokalne ogłoszenia", "sprzedaż w okolicy", "kupno rzeczy", "wynajem", "usługi w mieście", "pomoc w okolicy", "ogłoszenia drobne", "OLX alternatywa", "lokalna platforma", "FindSomeone", "aplikacja PWA", "ogłoszenia za darmo"],
  authors: [{ name: "FindSomeone" }],
  creator: "FindSomeone",
  publisher: "FindSomeone",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: '/',
    siteName: 'FindSomeone',
    title: 'FindSomeone - Znajdź pomoc w okolicy',
    description: 'Lokalna platforma ogłoszeń łącząca ludzi w Twoim mieście. Sprzedawaj, kupuj, wynajmuj, oferuj usługi lub szukaj pomocy - wszelkie ogłoszenia w okolicy za darmo.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindSomeone - Znajdź pomoc w okolicy',
    description: 'Lokalne ogłoszenia w Twoim mieście. Sprzedawaj, kupuj, wynajmuj, oferuj usługi lub szukaj pomocy. Darmowa platforma.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FindSomeone',
  },
  applicationName: 'FindSomeone',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
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
    <html lang="pl">
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
          <InstallPrompt />
          <CookieConsent />
        </Providers>
        <ConditionalAnalytics />
      </body>
    </html>
  );
}
