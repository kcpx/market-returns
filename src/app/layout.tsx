import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AssetAtlas | All Asset Classes at a Glance',
  description: 'Track returns across stocks, bonds, commodities, crypto, and more. A simple visual tool for understanding market performance over time.',
  keywords: ['asset atlas', 'market returns', 'asset allocation', 'investing', 'stocks', 'bonds', 'commodities', 'crypto', 'heatmap'],
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
