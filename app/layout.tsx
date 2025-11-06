import type { Metadata } from "next";
import { Geist, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalAnalytics } from "@/components/ConditionalAnalytics";
import TopLoader from "@/components/TopLoader";
import { MobileDockWrapper } from "@/components/MobileDockWrapper";
import { InstallPrompt } from "@/components/InstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

// Optymalizacja: tylko 2 czcionki zamiast 4 dla lepszej wydajności
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap", // Zapobiega blokowaniu renderowania
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin", "latin-ext"],
  display: "swap",
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
    <html lang="pl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#FAF8F3" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2E2E2E" media="(prefers-color-scheme: dark)" />
        {/* Preconnect dla zewnętrznych zasobów - lepsza wydajność */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = theme === 'dark' || ((theme === 'system' || !theme) && prefersDark);

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }

                  // Update theme-color meta tag
                  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
                  if (themeColorMeta) {
                    themeColorMeta.setAttribute('content', isDark ? '#2E2E2E' : '#FAF8F3');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${dancingScript.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <Providers userId={user?.id}>
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
