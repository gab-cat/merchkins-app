import React from 'react'
import type { Metadata } from 'next'
import { CategoryProducts } from '@/src/features/categories/components/category-products'

interface Params {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Category — Merchkins Storefront',
  description: 'Browse products in this category on Merchkins.',
}

export default async function Page ({ params }: Params) {
  const { slug } = await params
  return (
    <div className="container mx-auto px-3 py-6">
      <CategoryProducts slug={slug} />
    </div>
  )
}


