import type { Metadata } from 'next';

// Always use merchkins.com for landing page canonical, regardless of access domain
const LANDING_BASE_URL = 'https://app.merchkins.com';

export const metadata: Metadata = {
  metadataBase: new URL(LANDING_BASE_URL),
  icons: {
    icon: '/favicon.ico',
  },
  title: 'Merchkins — The All-in-One Platform for Independent Sellers',
  description:
    'Run your entire business in one place. Custom storefronts, unified order management, payment processing, fulfillment services, and omni-channel customer support — designed for artists, freelancers, and SMEs.',
  keywords: [
    'unified commerce platform',
    'independent sellers',
    'artist storefront',
    'freelancer e-commerce',
    'SME commerce platform',
    'custom merchandise',
    'omni-channel inbox',
    'order management system',
    'payment processing',
    'fulfillment services',
    'branded storefront',
    'Philippines commerce',
    'messenger integration',
    'facebook shop',
    'multi-channel sales',
  ],
  authors: [{ name: 'Merchkins', url: 'https://merchkins.com' }],
  creator: 'Merchkins',
  publisher: 'Merchkins',
  alternates: {
    canonical: 'https://merchkins.com',
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
    title: 'Merchkins — The All-in-One Platform for Independent Sellers',
    description:
      'Run your entire business in one place. Custom storefronts, unified order management, payment processing, fulfillment, and omni-channel support for artists, freelancers, and SMEs.',
    url: 'https://merchkins.com',
    type: 'website',
    siteName: 'Merchkins',
    locale: 'en_PH',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Merchkins — The All-in-One Platform for Independent Sellers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merchkins — The All-in-One Platform for Independent Sellers',
    description:
      'Run your entire business in one place. Custom storefronts, unified order management, and omni-channel support — designed for artists, freelancers, and SMEs.',
    site: '@merchkins',
    creator: '@merchkins',
    images: ['/og-image.png'],
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh flex flex-col bg-white scroll-smooth">{children}</div>;
}
