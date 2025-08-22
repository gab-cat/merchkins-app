import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { SiteHeader } from '@/src/features/common/components/site-header'
import { SiteFooter } from '@/src/features/common/components/site-footer'
import ErrorBoundary from '@/src/components/error-boundary'

export const metadata: Metadata = {
  title: 'Merchkins',
}

export default function MainLayout ({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </>
  )
}


