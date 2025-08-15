import React from 'react'
import type { Metadata } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { CategoryProducts } from '@/src/features/categories/components/category-products'

interface Params {
  params: Promise<{ orgSlug: string; slug: string }>
}

export async function generateMetadata (
  { params }: Params
): Promise<Metadata> {
  const { orgSlug, slug } = await params
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug })
  if (!organization) return {}
  let category = null
  try {
    category = await client.query(api.categories.queries.index.getCategoryBySlug, {
      slug,
      organizationId: organization._id,
    })
  } catch {}
  const title = category?.name
    ? `${category.name} — ${organization.name}`
    : `Category — ${organization.name}`
  return {
    title,
    description: 'Browse products in this organization category.',
    alternates: { canonical: `/o/${orgSlug}/c/${slug}` },
    openGraph: {
      title,
      url: `/o/${orgSlug}/c/${slug}`,
      description: 'Browse products in this organization category.',
    },
  }
}

export default async function Page ({ params }: Params) {
  const { orgSlug, slug } = await params
  // Validate org exists to avoid leakage between orgs
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug })
  if (!organization) {
    return (
      <div className="container mx-auto px-3 py-12 text-center">
        <p className="text-muted-foreground">Organization not found.</p>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-3 py-6">
      <CategoryProducts slug={slug} orgSlug={orgSlug} />
    </div>
  )
}


