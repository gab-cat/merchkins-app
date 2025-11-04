import React from 'react';
import { HomeHero } from '@/src/features/products/components/home-hero';
import { PopularProducts } from '@/src/features/products/components/popular-products';
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories';
import type { Metadata } from 'next';
import { PopularOrganizations } from '@/src/features/organizations/components/popular-organizations';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export default async function Page() {
  const preloadedPopularProducts = await preloadQuery(api.products.queries.index.getPopularProducts, { limit: 8 });
  const preloadedFeaturedCategories = await preloadQuery(api.categories.queries.index.getCategories, { isFeatured: true, isActive: true, limit: 6 });
  const preloadedPopularOrganizations = await preloadQuery(api.organizations.queries.index.getPopularOrganizations, { limit: 8 });

  return (
    <div className="w-full">
      <HomeHero />
      <section className="w-full px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <PopularProducts preloadedProducts={preloadedPopularProducts} />
        </div>
      </section>
      <section className="w-full px-4 py-8 md:py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <FeaturedCategories preloadedCategories={preloadedFeaturedCategories} />
        </div>
      </section>
      <section className="w-full px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <PopularOrganizations preloadedOrganizations={preloadedPopularOrganizations} />
        </div>
      </section>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Merchkins Storefront',
  description: 'Discover popular products and categories on Merchkins.',
};
