import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Food Order - Digital Menu & Ordering System',
  description: 'Transform your dining experience with QR-based food ordering. Scan, order, and enjoy!',
  keywords: ['restaurant', 'QR code', 'food ordering', 'digital menu'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
