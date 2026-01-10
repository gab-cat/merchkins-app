'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePreloadedQuery, Preloaded } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { ArrowRight, Sparkles, Shirt, Coffee, Laptop, Gift, Music, Camera, Palette, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrgLink } from '@/src/hooks/use-org-link';

// Icon mapping for categories (can be extended)
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  apparel: Shirt,
  clothing: Shirt,
  shirts: Shirt,
  tshirts: Shirt,
  drinkware: Coffee,
  mugs: Coffee,
  tech: Laptop,
  electronics: Laptop,
  accessories: Gift,
  gifts: Gift,
  music: Music,
  photography: Camera,
  art: Palette,
  default: Star,
};

const getIconForCategory = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, Icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key)) return Icon;
  }
  return categoryIcons.default;
};


interface FeaturedCategoriesProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategories?: Preloaded<typeof api.categories.queries.index.getCategories>;
}

// Type for category data
type CategoryData = {
  _id: string;
  slug: string;
  name: string;
  color?: string;
  activeProductCount?: number;
};

// Inner component shared by both variants
interface FeaturedCategoriesInnerProps {
  orgSlug?: string;
  categories: CategoryData[];
  loading: boolean;
}

function FeaturedCategoriesInner({ orgSlug, categories, loading }: FeaturedCategoriesInnerProps) {
  const { buildOrgLink } = useOrgLink(orgSlug);

  return (
    <div className="space-y-10">
      {/* Section header — minimal, editorial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-slate-400 mb-2">Browse</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-heading">Categories</h2>
        </div>
        <Link
          className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200 whitespace-nowrap pb-1"
          href={buildOrgLink('/search')}
        >
          <span>View all</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      {/* Category Grid — Asymmetric layout */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {new Array(6).fill(null).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn('rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse', i < 2 ? 'col-span-2 h-48' : 'h-32')}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((c, index) => {
            const Icon = getIconForCategory(c.name);
            // First 2 categories are featured (larger)
            const isFeatured = index < 2;

            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(isFeatured && 'col-span-2')}
              >
                <Link
                  href={buildOrgLink(`/c/${c.slug}`)}
                  className={cn(
                    'group relative flex h-full rounded-2xl overflow-hidden',
                    'bg-white dark:bg-slate-900',
                    'border border-slate-200 dark:border-slate-800',
                    'hover:border-[#1d43d8]/40 hover:shadow-2xl hover:shadow-[#1d43d8]/10',
                    'transition-all duration-500 hover:-translate-y-1',
                    isFeatured ? 'p-6 md:p-8 min-h-[180px]' : 'p-4 md:p-5 min-h-[120px]'
                  )}
                >
                  {/* Large decorative icon — background element */}
                  <div
                    className={cn(
                      'absolute -right-4 -bottom-4 opacity-[0.04] dark:opacity-[0.08] transition-all duration-500',
                      'group-hover:opacity-[0.08] group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2',
                      isFeatured ? 'text-[160px]' : 'text-[100px]'
                    )}
                  >
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    {/* Top: Small icon badge */}
                    <div>
                      <div
                        className={cn(
                          'inline-flex items-center justify-center rounded-xl',
                          'bg-[#1d43d8]/8 group-hover:bg-[#1d43d8] group-hover:scale-105',
                          'transition-all duration-300',
                          isFeatured ? 'p-3' : 'p-2'
                        )}
                      >
                        <Icon
                          className={cn('text-[#1d43d8] group-hover:text-white transition-colors duration-300', isFeatured ? 'h-6 w-6' : 'h-4 w-4')}
                        />
                      </div>
                    </div>

                    {/* Bottom: Name and count */}
                    <div className="mt-auto">
                      <h3
                        className={cn(
                          'font-bold text-slate-900 dark:text-white group-hover:text-[#1d43d8] transition-colors font-heading',
                          isFeatured ? 'text-xl md:text-2xl' : 'text-sm md:text-base'
                        )}
                      >
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-slate-500', isFeatured ? 'text-sm' : 'text-xs')}>
                          {c.activeProductCount !== undefined && c.activeProductCount > 0
                            ? `${c.activeProductCount} product${c.activeProductCount !== 1 ? 's' : ''}`
                            : 'Coming soon'}
                        </span>
                        {isFeatured && (
                          <ArrowRight className="h-4 w-4 text-[#1d43d8] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d43d8] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Sparkles className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg font-medium">No categories yet</p>
          <p className="text-slate-400 text-sm mt-1">Categories will appear here once added.</p>
        </motion.div>
      )}
    </div>
  );
}

// Variant that uses preloaded queries (for server-side preloading)
function FeaturedCategoriesPreloaded({
  orgSlug,
  preloadedOrganization,
  preloadedCategories,
}: {
  orgSlug?: string;
  preloadedOrganization: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategories: Preloaded<typeof api.categories.queries.index.getCategories>;
}) {
  usePreloadedQuery(preloadedOrganization); // Hydrate but don't need the result
  const featuredResult = usePreloadedQuery(preloadedCategories);
  const loading = featuredResult === undefined;
  const categories = (featuredResult?.categories ?? []) as CategoryData[];

  return <FeaturedCategoriesInner orgSlug={orgSlug} categories={categories} loading={loading} />;
}

// Variant that uses regular queries (for client-side fetching)
function FeaturedCategoriesQuery({ orgSlug }: { orgSlug?: string }) {
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  // First try to get featured categories
  const featuredResult = useQuery(
    api.categories.queries.index.getCategories,
    organization?._id
      ? { organizationId: organization._id, isFeatured: true, isActive: true, limit: 6 }
      : { isFeatured: true, isActive: true, limit: 6 }
  );

  // If no featured categories, fall back to popular categories
  const popularResult = useQuery(
    api.categories.queries.index.getPopularCategories,
    organization?._id ? { organizationId: organization._id, limit: 6, includeEmpty: false } : { limit: 6, includeEmpty: false }
  );

  const loading = featuredResult === undefined;
  const featuredCategories = (featuredResult?.categories ?? []) as CategoryData[];
  const popularCategories = (popularResult ?? []).map((cat) => ({
    ...cat,
    _id: cat.id, // Normalize id to _id for consistency
  })) as CategoryData[];

  // Use featured categories if available, otherwise fall back to popular categories
  const categories = featuredCategories.length > 0 ? featuredCategories : popularCategories;

  return <FeaturedCategoriesInner orgSlug={orgSlug} categories={categories} loading={loading} />;
}

// Main export: chooses between preloaded and query variants
export function FeaturedCategories({ orgSlug, preloadedOrganization, preloadedCategories }: FeaturedCategoriesProps = {}) {
  // Use preloaded variant if both preloaded queries are provided
  if (preloadedOrganization && preloadedCategories) {
    return <FeaturedCategoriesPreloaded orgSlug={orgSlug} preloadedOrganization={preloadedOrganization} preloadedCategories={preloadedCategories} />;
  }

  // Otherwise use client-side queries
  return <FeaturedCategoriesQuery orgSlug={orgSlug} />;
}
