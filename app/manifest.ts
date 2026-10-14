import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'City Money',
    short_name: 'City Money',
    description: "Community credits with built-in rules for who can receive them. Explore City Money's Cleanverse-powered voucher experience with verifiable payments on Monad testnet.",
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf1e1',
    theme_color: '#03442f',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' }],
  };
}
