import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteBrandingSync } from '@/components/common/SiteBrandingSync';

export const metadata: Metadata = {
  title: {
    default: 'LivingYuji OS — Developer Portfolio & Digital Store',
    template: '%s | LivingYuji OS',
  },
  description:
    'LivingYuji — Independent developer specializing in Minecraft plugins, Discord bots, web development and custom server setups. Browse projects, services and the digital store.',
  keywords: [
    'LivingYuji',
    'Minecraft plugins',
    'Discord bot development',
    'web development',
    'custom server setup',
    'Paper plugin',
    'Purpur plugin',
    'developer portfolio',
  ],
  authors: [{ name: 'LivingYuji' }],
  creator: 'LivingYuji',
  openGraph: {
    title: 'LivingYuji OS — Developer Portfolio & Digital Store',
    description: 'Interactive OS-style portfolio. Minecraft plugins, Discord bots, web development and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LivingYuji OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivingYuji OS — Developer Portfolio',
    description: 'Interactive OS-style developer portfolio.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F9FD' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden h-screen w-screen bg-soft-bg">
        <SiteBrandingSync />
        {children}
      </body>
    </html>
  );
}
