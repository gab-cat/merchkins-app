import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/src/features/common/components/site-header';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import ErrorBoundary from '@/src/components/error-boundary';
import { PlatformChatwoot } from '@/src/components/chatwoot/platform-chatwoot';
import CTAComponent from '@/src/features/common/components/cta';
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
  return (
    <div className="relative min-h-screen">
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
