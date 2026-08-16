import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { AnalyticsPageView } from "@/components/AnalyticsPageView";
import { PWARegister } from "@/components/PWARegister";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://byte-runner.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000011',
}

export const metadata: Metadata = {
  title: "Byte Runner - A Cybersecurity Survival Game for Everyone",
  description: "Endless runner game that teaches real security tools. Die to ransomware, learn about backups. Free to play.",
  metadataBase: new URL(BASE_URL),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Byte Runner',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Byte Runner - A Cybersecurity Survival Game for Everyone',
    description: 'Endless runner game that teaches real security tools. Die to ransomware, learn about backups. Free to play.',
    url: BASE_URL,
    siteName: 'Byte Runner',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Byte Runner - A Cybersecurity Survival Game for Everyone'
    }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Byte Runner - A Cybersecurity Survival Game for Everyone',
    description: 'Endless runner game that teaches real security tools. Die to ransomware, learn about backups.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Byte Runner',
  description: 'An endless runner game that teaches real cybersecurity tools. Dodge threats like ransomware and phishing, collect protection kits, and learn what professionals use to stay safe online.',
  url: BASE_URL,
  image: `${BASE_URL}/og-image.png`,
  genre: ['Educational', 'Action', 'Endless Runner'],
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  author: {
    '@type': 'Organization',
    name: 'Byte Runner',
    url: BASE_URL,
    email: 'connect@byterunner.co',
  },
  educationalUse: 'Cybersecurity awareness and training',
  audience: {
    '@type': 'Audience',
    audienceType: 'General Public',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  return (
    <html lang="en" className="bg-black">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* CrazyGames SDK — disabled/no-op on all non-CrazyGames domains */}
        <script src="https://sdk.crazygames.com/crazygames-sdk-v2.js" async />
      </head>
      <body className="bg-black">
        {/* Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <AnalyticsPageView />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
