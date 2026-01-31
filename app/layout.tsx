import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Byte Runner - Learn Cybersecurity",
  description: "Endless runner game that teaches real security tools. Die to ransomware, learn about backups. Free to play.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover', // For notched devices (iPhone X+)
  },
  themeColor: '#000011', // Cyber dark theme
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Byte Runner',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Byte Runner - Learn Cybersecurity by Playing',
    description: 'Endless runner game that teaches real security tools. Die to ransomware, learn about backups. Free to play.',
    url: 'https://byte-runner.vercel.app',
    siteName: 'Byte Runner',
    images: [{
      url: 'https://byte-runner.vercel.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Byte Runner - Learn Cybersecurity by Playing'
    }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Byte Runner - Learn Cybersecurity by Playing',
    description: 'Endless runner game that teaches real security tools. Die to ransomware, learn about backups.',
    images: ['https://byte-runner.vercel.app/og-image.png'],
  },
};

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
        
        {children}
        <Footer />
      </body>
    </html>
  );
}
