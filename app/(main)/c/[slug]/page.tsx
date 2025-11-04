import React from 'react';
import type { Metadata } from 'next';
import { CategoryProducts } from '@/src/features/categories/components/category-products';
import { preloadQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

interface Params {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Category — Merchkins Storefront',
  description: 'Browse products in this category on Merchkins.',
};

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
    </div>
  );
}
