import type { Metadata } from 'next'
import { ReactNode } from 'react'
import AdminHeader from '@/src/features/admin/components/admin-header'
import AdminFooter from '@/src/features/admin/components/admin-footer'

export const metadata: Metadata = {
  title: 'Admin — Merchkins',
}

export default function AdminRootLayout ({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <AdminHeader />
      <main className="flex-1 container mx-auto px-3 py-4">
        {children}
      </main>
      <AdminFooter />
    </div>
  )
}


