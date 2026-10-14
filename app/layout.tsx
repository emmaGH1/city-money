import type { Metadata } from 'next';
import './globals.css';
import './brand.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://city-money.vercel.app'),
  title: 'City Money | A little goes around here',
  description: "Community credits with built-in rules for who can receive them. Explore City Money's Cleanverse-powered voucher experience with verifiable payments on Monad testnet.",
  applicationName: 'City Money',
  alternates: { canonical: '/' },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], shortcut: '/icon.svg' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'City Money | A little goes around here',
    description: "Community credits with built-in rules for who can receive them. Explore City Money's Cleanverse-powered voucher experience with verifiable payments on Monad testnet.",
    url: '/',
    siteName: 'City Money',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'City Money: A little goes around here' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City Money | A little goes around here',
    description: "Community credits with built-in rules for who can receive them. Explore City Money's Cleanverse-powered voucher experience with verifiable payments on Monad testnet.",
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
