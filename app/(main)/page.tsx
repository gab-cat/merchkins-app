import React from 'react'
import { HomeHero } from '@/src/features/products/components/home-hero'
import { PopularProducts } from '@/src/features/products/components/popular-products'
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories'
import type { Metadata } from 'next'
import { PopularOrganizations } from '@/src/features/organizations/components/popular-organizations'

export default function Page () {
  return (
    <div className="min-h-dvh flex flex-col">
      <HomeHero />
      <section className="container mx-auto px-3 py-6">
        <FeaturedCategories />
      </section>
      <section className="container mx-auto px-3 py-6">
        <PopularOrganizations />
      </section>
      <section className="container mx-auto px-3 py-6">
        <PopularProducts />
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
  description: 'Discover popular products and categories on Merchkins.',
}