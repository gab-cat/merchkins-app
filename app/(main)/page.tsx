import React from 'react'
import { HomeHero } from '@/src/features/products/components/home-hero'
import { PopularProducts } from '@/src/features/products/components/popular-products'
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories'
import type { Metadata } from 'next'
import { PopularOrganizations } from '@/src/features/organizations/components/popular-organizations'

export default function Page () {
  return (
    <div className="w-full">
      <HomeHero />
      <section className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <FeaturedCategories />
        </div>
      </section>
      <section className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <PopularOrganizations />
        </div>
      </section>
      <section className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <PopularProducts />
        </div>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
  description: 'Discover popular products and categories on Merchkins.',
}