import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin | Merchkins',
}

export default async function AdminPage ({
  searchParams,
}: {
  searchParams?: Promise<{ org?: string }>
}) {
  const params = await searchParams || {}
  const org = params.org
  redirect(org ? `/admin/products?org=${encodeURIComponent(org)}` : '/admin/products')
}


