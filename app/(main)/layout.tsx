import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { SiteHeader } from '@/src/features/common/components/site-header'
import { SiteFooter } from '@/src/features/common/components/site-footer'

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
}

export default function MainLayout ({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}


