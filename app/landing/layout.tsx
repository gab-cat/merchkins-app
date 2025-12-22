import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://merchkins.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'Merchkins — Custom Merch Made Easy',
  description: 'Create, manage, and fulfill custom merchandise for your organization. Join thousands of teams building their brand with Merchkins.',
  keywords: [
    'custom merchandise',
    'team merch',
    'branded products',
    'e-commerce',
    'organization store',
    'custom printing',
    'merchandise platform',
    'team apparel',
    'brand merchandise',
  ],
  authors: [{ name: 'Merchkins' }],
  alternates: {
    canonical: `${baseUrl}/landing`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Merchkins — Custom Merch Made Easy',
    description: 'Create, manage, and fulfill custom merchandise for your organization. Join thousands of teams building their brand with Merchkins.',
    url: `${baseUrl}/landing`,
    type: 'website',
    siteName: 'Merchkins',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Merchkins — Custom Merch Made Easy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchkins — Custom Merch Made Easy',
    description: 'Create, manage, and fulfill custom merchandise for your organization. Join thousands of teams building their brand with Merchkins.',
    site: '@merchkins',
    creator: '@merchkins',
    images: ['/og-image.png'],
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh flex flex-col bg-white scroll-smooth">{children}</div>;
}
