import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin | Merchkins',
}

export default async function AdminPage ({
  searchParams,
}: {
  searchParams?: { org?: string }
}) {
  const org = searchParams?.org
  redirect(org ? `/admin/products?org=${encodeURIComponent(org)}` : '/admin/products')
}


