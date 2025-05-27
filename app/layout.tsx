import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Basic SEO
  metadataBase: new URL('https://www.aetherapp.in'), // Crucial for absolute URLs
  title: {
    default: 'Aether: AI-Powered Personal Finance Tracker',
    template: '%s | Aether App', // Suffix for dynamic titles
  },
  description: 'Aether helps you manage your money smarter with AI. Track expenses, create budgets, set financial goals, and get personalized insights for financial freedom in India.',
  keywords: [
    'finance tracker', 'ai finance', 'personal finance app', 'budget app',
    'spending tracker', 'money management', 'financial goals', 'investment tracker',
    'debt management', 'ai financial advisor', 'india finance',
    'rbi account aggregator', 'nextjs', 'typescript'
  ],
  authors: [{ name: 'Aether Labs Pvt. Ltd.' }],
  creator: 'Aether Labs Pvt. Ltd.',
  publisher: 'Aether Labs Pvt. Ltd.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'noimageindex': true,
    },
  },
  alternates: {
    canonical: '/', // Root canonical, specific pages will override
  },

  // Open Graph (for social media sharing)
  openGraph: {
    title: 'Aether: AI-Powered Personal Finance Tracker',
    description: 'Aether helps you manage your money smarter with AI. Track expenses, create budgets, set financial goals, and get personalized insights for financial freedom.',
    url: 'https://www.aetherapp.in',
    siteName: 'Aether App',
    images: [
      {
        url: '/images/og-image.jpg', // Path from `public` directory
        width: 1200,
        height: 630,
        alt: 'Aether App Dashboard showing financial insights',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@AetherApp', // Your Twitter handle
    creator: '@YourPersonalHandle', // Optional
    title: 'Aether: AI-Powered Personal Finance Tracker',
    description: 'Manage your money smarter with Aether. AI-powered insights, smart budgeting, and financial goal tracking for everyone.',
    images: ['/images/twitter-card-image.jpg'], // Path from `public` directory
  },

  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // App Icons & Favicons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  // Application related info (for App Stores if applicable)
  applicationName: 'Aether: AI Finance Tracker',
  // You might want to put App Store/Google Play links here if they are live
  // and relevant for web metadata.
  // app: {
  //   id: 'com.aetherapp.in', // Your app bundle ID
  //   url: {
  //     ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
  //     android: 'https://play.google.com/store/apps/details?id=YOUR_APP_ID',
  //   },
  // },

  // PWA manifest (if you're building a PWA)
  manifest: '/manifest.webmanifest', // Path to your PWA manifest file
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <main className="flex-grow">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
