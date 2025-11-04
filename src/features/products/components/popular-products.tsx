'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, usePreloadedQuery, Preloaded } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ProductCard } from './product-card';
import { fadeInUpContainer } from '@/lib/animations';

type ProductCardData = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string[];
  minPrice?: number;
  rating?: number;
  reviewsCount?: number;
  isBestPrice?: boolean;
  discountLabel?: string;
};

interface PopularProductsProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedProducts?: Preloaded<typeof api.products.queries.index.getPopularProducts>;
}

export function PopularProducts({ orgSlug, preloadedOrganization, preloadedProducts }: PopularProductsProps = {}) {
  const organization = preloadedOrganization
    ? usePreloadedQuery(preloadedOrganization)
    : useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }));
  const result = preloadedProducts
    ? usePreloadedQuery(preloadedProducts)
    : useQuery(api.products.queries.index.getPopularProducts, organization?._id ? { limit: 8, organizationId: organization._id } : { limit: 8 });
  const loading = result === undefined;
  const products = (result?.products ?? []) as unknown as ProductCardData[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Popular products</h2>
        <Link
          className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-200 whitespace-nowrap"
          href={orgSlug ? `/o/${orgSlug}/search` : '/search'}
        >
          View all →
        </Link>
      </div>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        data-testid="popular-products-grid"
        variants={fadeInUpContainer}
        initial="initial"
        animate="animate"
      >
        {loading
          ? new Array(8).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden rounded-xl border bg-card shadow-sm py-0">
                <div className="aspect-[4/3] bg-secondary skeleton" />
                <CardHeader className="p-3 space-y-2">
                  <CardTitle className="h-4 w-2/3 rounded bg-secondary skeleton" />
                  <div className="h-3 w-full rounded bg-secondary skeleton" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-3">
                  <span className="h-4 w-16 rounded bg-secondary skeleton" />
                  <span className="h-3 w-12 rounded bg-secondary skeleton" />
                </CardContent>
              </Card>
            ))
          : products.map((p, index) => (
              <ProductCard
                key={p._id}
                _id={p._id}
                slug={p.slug}
                title={p.title}
                description={p.description}
                imageUrl={p.imageUrl}
                minPrice={p.minPrice}
                rating={p.rating}
                reviewsCount={p.reviewsCount}
                isBestPrice={p.isBestPrice}
                discountLabel={p.discountLabel}
                orgSlug={orgSlug}
                index={index}
              />
            ))}
      </motion.div>
      {!loading && products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No popular products yet.</p>
        </div>
      )}
    </div>
  );
}
