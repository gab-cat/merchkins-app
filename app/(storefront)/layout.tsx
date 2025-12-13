import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/src/features/common/components/site-header';
import { SiteFooter } from '@/src/features/common/components/site-footer';
import ErrorBoundary from '@/src/components/error-boundary';

export const metadata: Metadata = {
  title: 'Merchkins',
};

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Content layer */}
      <div className="relative z-10">
        <SiteHeader />
        <main className="w-full min-h-[80vh]">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}











