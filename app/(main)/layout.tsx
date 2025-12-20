import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/src/features/common/components/site-header';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import ErrorBoundary from '@/src/components/error-boundary';
import { PlatformChatwoot } from '@/src/components/chatwoot/platform-chatwoot';
// import { PlatformBackground } from '@/src/components/ui/backgrounds/platform-background';

export const metadata: Metadata = {
  title: 'Merchkins',
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
        <SiteFooter />
      </div>
      <PlatformChatwoot />
    </div>
  );
}
