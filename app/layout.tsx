import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Byte Runner - Learn Cybersecurity",
  description: "An endless runner game that teaches cybersecurity concepts through interactive puzzles",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-black">{children}</body>
    </html>
  );
}
