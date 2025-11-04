'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery, usePreloadedQuery, Preloaded } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { fadeInUpContainer, fadeInUp } from '@/lib/animations';

interface FeaturedCategoriesProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategories?: Preloaded<typeof api.categories.queries.index.getCategories>;
}

export function FeaturedCategories({ orgSlug, preloadedOrganization, preloadedCategories }: FeaturedCategoriesProps = {}) {
  const organization = preloadedOrganization
    ? usePreloadedQuery(preloadedOrganization)
    : useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }));

  // First try to get featured categories
  const featuredResult = preloadedCategories
    ? usePreloadedQuery(preloadedCategories)
    : useQuery(
        api.categories.queries.index.getCategories,
        organization?._id
          ? { organizationId: organization._id, isFeatured: true, isActive: true, limit: 6 }
          : { isFeatured: true, isActive: true, limit: 6 }
      );

  // If no featured categories, fall back to popular categories
  const popularResult = useQuery(
    api.categories.queries.index.getPopularCategories,
    organization?._id
      ? { organizationId: organization._id, limit: 6, includeEmpty: false }
      : { limit: 6, includeEmpty: false }
  );

  const loading = featuredResult === undefined;
  const featuredCategories = featuredResult?.categories ?? [];
  const popularCategories = (popularResult ?? []).map(cat => ({
    ...cat,
    _id: cat.id // Normalize id to _id for consistency
  }));

  // Use featured categories if available, otherwise fall back to popular categories
  const categories = featuredCategories.length > 0 ? featuredCategories : popularCategories;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-primary tracking-tight">Featured categories</h2>
        <Link
          className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline transition-all duration-200 whitespace-nowrap"
          href={orgSlug ? `/o/${orgSlug}/search` : '/search'}
        >
          View all →
        </Link>
      </div>
      <motion.div className="flex flex-wrap gap-2" variants={fadeInUpContainer} initial="initial" animate="animate">
        {loading
          ? new Array(6).fill(null).map((_, i) => <div key={`skeleton-${i}`} className="h-9 w-24 rounded-sm bg-secondary skeleton" />)
          : categories.map((c) => (
              <motion.div key={c._id} variants={fadeInUp}>
                <Link
                  href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 h-9 rounded-sm border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-sm font-medium text-card-foreground shadow-sm"
                  style={
                    c.color
                      ? {
                          borderColor: c.color,
                        }
                      : undefined
                  }
                >
                  {c.color && <span aria-hidden className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />}
                  <span className="whitespace-nowrap">{c.name}</span>
                  {c.activeProductCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium shrink-0">
                      {c.activeProductCount}
                    </Badge>
                  )}
                </Link>
              </motion.div>
            ))}
      </motion.div>
      {!loading && categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No categories to show.</p>
        </div>
      )}
    </div>
  );
}
