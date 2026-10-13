import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'City Money — A little goes around here',
  description: 'A fictional neighborhood-voucher sandbox on Monad testnet, powered by a real Cleanverse verified asset.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
