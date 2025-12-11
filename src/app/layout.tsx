import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Market Returns | All Asset Classes at a Glance',
  description: 'See how stocks, bonds, commodities, crypto, and more performed over time. A simple visual tool for understanding market returns.',
  keywords: ['market returns', 'asset allocation', 'investing', 'stocks', 'bonds', 'commodities', 'crypto'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
