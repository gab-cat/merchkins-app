import React from 'react';
import { HomeHero } from '@/src/features/products/components/home-hero';
import { PopularProducts } from '@/src/features/products/components/popular-products';
import { FeaturedCategories } from '@/src/features/categories/components/featured-categories';
import type { Metadata } from 'next';
import { PopularOrganizations } from '@/src/features/organizations/components/popular-organizations';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { BUSINESS_NAME, BUSINESS_DESCRIPTION } from '@/src/constants/business-info';

export default async function Page() {
  const preloadedPopularProducts = await preloadQuery(api.products.queries.index.getPopularProducts, { limit: 8 });
  const preloadedFeaturedCategories = await preloadQuery(api.categories.queries.index.getCategories, { isFeatured: true, isActive: true, limit: 6 });
  const preloadedPopularOrganizations = await preloadQuery(api.organizations.queries.index.getPopularOrganizations, { limit: 8 });

  return (
    <div className="w-full overflow-hidden">
      {/* Hero - Full width background */}
      <HomeHero />

      {/* Popular Products Section */}
      <section className="relative w-full py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <PopularProducts preloadedProducts={preloadedPopularProducts} />
        </div>
      </section>

      {/* Section spacer */}
      <div className="h-8 md:h-12" />

      {/* Categories Section */}
      <section className="relative w-full py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <FeaturedCategories preloadedCategories={preloadedFeaturedCategories} />
        </div>
      </section>

      {/* Section spacer */}
      <div className="h-8 md:h-12" />

      {/* Organizations Section */}
      <section className="relative w-full py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
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
            name: BUSINESS_NAME,
            description: BUSINESS_DESCRIPTION,
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
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: 'Merchkins Storefront — Custom Merch Made Easy',
      description: 'Discover unique custom merchandise from top organizations. Shop personalized products and support your favorite creators.',
      url: baseUrl,
      siteName: 'Merchkins',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Merchkins Storefront — Custom Merch Made Easy',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Merchkins Storefront — Custom Merch Made Easy',
      description: 'Discover unique custom merchandise from top organizations. Shop personalized products and support your favorite creators.',
      creator: '@merchkins',
      images: ['/og-image.png'],
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
