import React from 'react'
import { ProductDetailBoundary } from '@/src/features/products/components/product-detail'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { preloadQuery } from 'convex/nextjs'

interface PageProps {
  params: Promise<{ orgSlug: string; slug: string }>
}

export default async function Page ({ params }: PageProps) {
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
  
  // Preload organization query
  const preloadedOrganization = await preloadQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    { slug: orgSlug }
  )
  
  // Fetch product to get productId for recommendations query
  const product = await client.query(api.products.queries.index.getProductBySlug, {
    slug,
    organizationId: organization._id,
  })
  
  // Preload product query
  const preloadedProduct = await preloadQuery(
    api.products.queries.index.getProductBySlug,
    { slug, organizationId: organization._id }
  )
  
  // Preload recommendations query if product exists
  const preloadedRecommendations = product?._id
    ? await preloadQuery(
        api.products.queries.index.getProductRecommendations,
        { productId: product._id, limit: 8 }
      )
    : undefined
  
  return (
    <ProductDetailBoundary
      slug={slug}
      orgSlug={orgSlug}
      preloadedProduct={preloadedProduct}
      preloadedRecommendations={preloadedRecommendations}
    />
  )
}


