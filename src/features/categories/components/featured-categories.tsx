'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePreloadedQuery, Preloaded } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { BlurFade } from '@/src/components/ui/animations';
import { ArrowRight, LayoutGrid, Sparkles, Shirt, Coffee, Laptop, Gift, Music, Camera, Palette, Star } from 'lucide-react';
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

// Predefined gradient combos for variety
const gradients = [
  'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
  'from-blue-500/20 via-cyan-500/10 to-teal-500/20',
  'from-orange-500/20 via-amber-500/10 to-yellow-500/20',
  'from-emerald-500/20 via-green-500/10 to-lime-500/20',
  'from-rose-500/20 via-pink-500/10 to-red-500/20',
  'from-indigo-500/20 via-blue-500/10 to-sky-500/20',
];

interface FeaturedCategoriesProps {
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategories?: Preloaded<typeof api.categories.queries.index.getCategories>;
}

export function FeaturedCategories({ orgSlug, preloadedOrganization, preloadedCategories }: FeaturedCategoriesProps = {}) {
  const organization = preloadedOrganization
    ? usePreloadedQuery(preloadedOrganization)
    : useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }));
  const { buildOrgLink } = useOrgLink(orgSlug);

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
    organization?._id ? { organizationId: organization._id, limit: 6, includeEmpty: false } : { limit: 6, includeEmpty: false }
  );

  const loading = featuredResult === undefined;
  const featuredCategories = featuredResult?.categories ?? [];
  const popularCategories = (popularResult ?? []).map((cat) => ({
    ...cat,
    _id: cat.id, // Normalize id to _id for consistency
  }));

  // Use featured categories if available, otherwise fall back to popular categories
  const categories = featuredCategories.length > 0 ? featuredCategories : popularCategories;

  return (
    <div className="space-y-8">
      {/* Section header */}
      <BlurFade>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-heading">Shop by Category</h2>
            </div>
            <p className="text-muted-foreground text-sm">Find exactly what you&apos;re looking for</p>
          </div>
          <Link
            className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200 whitespace-nowrap"
            href={buildOrgLink('/search')}
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </BlurFade>

      {/* Bento Grid Categories */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {new Array(6).fill(null).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={cn(
                'rounded-2xl bg-linear-to-br from-secondary to-secondary/50 skeleton',
                i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
              )}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 auto-rows-fr">
          {categories.map((c, index) => {
            const Icon = getIconForCategory(c.name);
            const gradient = gradients[index % gradients.length];
            const isLarge = index === 0;

            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(isLarge && 'col-span-2 row-span-2')}
              >
                <Link
                  href={buildOrgLink(`/c/${c.slug}`)}
                  className={cn(
                    'group relative flex flex-col h-full rounded-2xl overflow-hidden',
                    'bg-card border border-border/50',
                    'hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
                    'transition-all duration-500 hover:-translate-y-1',
                    isLarge ? 'p-6 md:p-8' : 'p-4 md:p-5'
                  )}
                >
                  {/* Background gradient */}
                  <div
                    className={cn('absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', gradient)}
                  />

                  {/* Custom color background if available */}
                  {c.color && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{ backgroundColor: c.color }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div className={cn('mb-auto', isLarge ? 'mb-6' : 'mb-3')}>
                      <div
                        className={cn(
                          'inline-flex items-center justify-center rounded-xl transition-all duration-300',
                          'bg-primary/10 group-hover:bg-primary group-hover:scale-110',
                          isLarge ? 'p-4' : 'p-2.5'
                        )}
                        style={
                          c.color
                            ? {
                                backgroundColor: `${c.color}20`,
                              }
                            : undefined
                        }
                      >
                        <Icon
                          className={cn(
                            'transition-colors duration-300 group-hover:text-white',
                            isLarge ? 'h-8 w-8' : 'h-5 w-5',
                            !c.color && 'text-primary'
                          )}
                        />
                      </div>
                    </div>

                    {/* Category info */}
                    <div className="mt-auto">
                      <h3
                        className={cn(
                          'font-bold text-foreground group-hover:text-primary transition-colors font-heading',
                          isLarge ? 'text-xl md:text-2xl mb-2' : 'text-sm md:text-base mb-1'
                        )}
                      >
                        {c.name}
                      </h3>

                      {/* Product count */}
                      <div className="flex items-center gap-2">
                        <span className={cn('text-muted-foreground', isLarge ? 'text-sm' : 'text-xs')}>
                          {c.activeProductCount > 0 ? `${c.activeProductCount} product${c.activeProductCount !== 1 ? 's' : ''}` : 'Coming soon'}
                        </span>

                        {/* Arrow indicator on large card */}
                        {isLarge && (
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div
                    className={cn(
                      'absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                      'bg-linear-to-bl from-primary/20 to-transparent rounded-bl-3xl'
                    )}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <BlurFade>
          <div className="text-center py-16 px-4 rounded-2xl bg-muted/30 border border-dashed border-border">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No categories yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Categories will appear here once added.</p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
