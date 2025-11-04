import React from 'react'
import { ProductDetailBoundary } from '@/src/features/products/components/product-detail'
import { preloadQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page ({ params }: PageProps) {
  const { slug } = await params
  
  // Fetch product first to get productId for recommendations query
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)
  const product = await client.query(api.products.queries.index.getProductBySlug, { slug })
  
  // Preload product query
  const preloadedProduct = await preloadQuery(
    api.products.queries.index.getProductBySlug,
    { slug }
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
      preloadedProduct={preloadedProduct}
      preloadedRecommendations={preloadedRecommendations}
    />
  )
}


