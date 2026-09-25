import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LivingYuji — Developer',
  description: 'LivingYuji personal developer portfolio.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}