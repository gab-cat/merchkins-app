import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/src/features/common/components/site-header';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import ErrorBoundary from '@/src/components/error-boundary';
import { PlatformChatwoot } from '@/src/components/chatwoot/platform-chatwoot';
import CTAComponent from '@/src/features/common/components/cta';
import { BUSINESS_NAME, BUSINESS_DESCRIPTION } from '@/src/constants/business-info';
// import { PlatformBackground } from '@/src/components/ui/backgrounds/platform-background';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse and shop from independent sellers, artists, and SMEs. Find unique merchandise, support local businesses, and enjoy seamless ordering.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function MainLayout({ children }: { children: ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  // JSON-LD structured data for SEO
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BUSINESS_NAME,
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description: BUSINESS_DESCRIPTION,
    sameAs: ['https://www.facebook.com/merchkins', 'https://www.linkedin.com/company/merchkins/'],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@merchkins.com',
      contactType: 'customer service',
    },
  };

  return (
    <div className="relative min-h-screen">
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* Full-width animated platform background */}
      {/* <PlatformBackground /> */}

      {/* Content layer */}
      <div className="relative z-10">
        <SiteHeader />
        <main className="w-full min-h-[80vh]">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <CTAComponent />
        <SiteFooter />
      </div>
      <PlatformChatwoot />
    </div>
  );
}
