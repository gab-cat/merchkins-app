import React from 'react';
import type { Metadata } from 'next';
import { CategoryProducts } from '@/src/features/categories/components/category-products';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  // Fetch category first to get categoryId for products query
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
  const category = await client.query(api.categories.queries.index.getCategoryBySlug, { slug });

  // Preload category query
  const preloadedCategory = await preloadQuery(api.categories.queries.index.getCategoryBySlug, { slug });

  // Preload products query if category exists
  const preloadedProducts = category?._id
    ? await preloadQuery(api.products.queries.index.getProducts, {
        categoryId: category._id,
        sortBy: 'newest',
        limit: 24,
        offset: 0,
        hasInventory: true,
      })
    : undefined;

  return (
    <div className="container mx-auto px-3 py-6">
      <CategoryProducts slug={slug} preloadedCategory={preloadedCategory} preloadedProducts={preloadedProducts} />
      {/* Structured Data */}
      {category && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: category.name,
              description: category.seoDescription || category.description || `Browse ${category.name} products on Merchkins`,
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/c/${slug}`,
              mainEntity: {
                '@type': 'ItemList',
                name: category.name,
                description: category.seoDescription || category.description || `Browse ${category.name} products on Merchkins`,
                numberOfItems: category.activeProductCount || category.productCount,
              },
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: category.name,
                    item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com'}/c/${slug}`,
                  },
                ],
              },
            }),
          }}
        />
      )}
    </div>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  try {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
    const category = await client.query(api.categories.queries.index.getCategoryBySlug, { slug });

    if (!category) {
      return {
        title: 'Category Not Found — Merchkins',
        description: 'The requested category could not be found.',
      };
    }

    const title = category.seoTitle || `${category.name} — Merchkins Storefront`;
    const description =
      category.seoDescription ||
      category.description ||
      `Browse ${category.activeProductCount || category.productCount} products in the ${category.name} category on Merchkins.`;

    // Resolve category image URL for Open Graph
    let ogImage = category.imageUrl || '/favicon.ico';
    if (category.imageUrl && !category.imageUrl.startsWith('http')) {
      try {
        ogImage = await client.query(api.files.queries.index.getFileUrl, { key: category.imageUrl });
      } catch {}
    }

    return {
      title,
      description,
      keywords: [
        category.name || '',
        'custom merch',
        'personalized products',
        'merchandise',
        category.organizationInfo?.name || '',
        ...(category.tags || []),
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        url: `${baseUrl}/c/${slug}`,
        siteName: 'Merchkins',
        locale: 'en_US',
        type: 'website',
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
        creator: '@merchkins',
      },
      alternates: {
        canonical: `${baseUrl}/c/${slug}`,
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
  } catch (error) {
    // If category not found or other error, return basic metadata
    return {
      title: 'Category — Merchkins Storefront',
      description: 'Browse products in this category on Merchkins.',
      alternates: {
        canonical: `${baseUrl}/c/${slug}`,
      },
    };
  }
}
