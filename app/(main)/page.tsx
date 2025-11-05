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
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Merchkins',
            description: 'Custom merch made easy — shop, manage, and fulfill with Merchkins',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com',
            logo: 'https://app.merchkins.com/favicon.ico',
            sameAs: [
              // Add social media URLs if available
            ],
          }),
        }}
      />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  return {
    title: 'Merchkins Storefront — Custom Merch Made Easy',
    description:
      'Discover unique custom merchandise from top organizations. Shop personalized products, browse featured categories, and support your favorite creators on Merchkins.',
    keywords: ['custom merch', 'personalized products', 'merchandise', 'custom printing', 'unique gifts'],
    authors: [{ name: 'Merchkins' }],
    openGraph: {
      title: 'Merchkins Storefront — Custom Merch Made Easy',
      description: 'Discover unique custom merchandise from top organizations. Shop personalized products and support your favorite creators.',
      url: baseUrl,
      siteName: 'Merchkins',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Merchkins Storefront — Custom Merch Made Easy',
      description: 'Discover unique custom merchandise from top organizations. Shop personalized products and support your favorite creators.',
      creator: '@merchkins',
    },
    alternates: {
      canonical: baseUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
