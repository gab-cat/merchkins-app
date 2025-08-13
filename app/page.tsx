import React from 'react'
import { HomeHero } from '@/src/features/products/components/home-hero'
import { PopularProducts } from '@/src/features/products/components/popular-products'
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories'

export default function Page () {
  return (
    <div className="min-h-dvh flex flex-col">
      <HomeHero />
      <section className="container mx-auto px-4 py-12">
        <FeaturedCategories />
      </section>
      <section className="container mx-auto px-4 py-12">
        <PopularProducts />
      </section>
    </div>
  )
}