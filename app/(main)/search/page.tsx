import React from 'react';
import type { Metadata } from 'next';
import { SearchResults } from '@/src/features/products/components/search-results';

export default function Page() {
  return (
    <div className="container mx-auto px-3 py-6">
      <SearchResults />
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';
  const params = await searchParams;
  const query = params.q as string;

  // If there's a search query, include it in the title and description
  const title = query ? `Search results for "${query}" — Merchkins Storefront` : 'Search — Merchkins Storefront';
  const description = query
    ? `Find products matching "${query}" on Merchkins. Browse custom merchandise and personalized products.`
    : 'Search for products on Merchkins. Find custom merchandise and personalized products from top creators.';

  return {
    title,
    description,
    keywords: query
      ? [query, 'custom merch', 'personalized products', 'search results'].filter(Boolean)
      : ['custom merch', 'personalized products', 'merchandise', 'search'],
    openGraph: {
      title,
      description,
      url: query ? `${baseUrl}/search?q=${encodeURIComponent(query)}` : `${baseUrl}/search`,
      siteName: 'Merchkins',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@merchkins',
    },
    alternates: {
      canonical: `${baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
    },
    robots: {
      index: query ? false : true, // Don't index specific search results, but index the search page itself
      follow: true,
      googleBot: {
        index: query ? false : true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
