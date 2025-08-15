import React from 'react'
import { ProductDetailBoundary } from '@/src/features/products/components/product-detail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page ({ params }: PageProps) {
  const { slug } = await params
  return <ProductDetailBoundary slug={slug} />
}


