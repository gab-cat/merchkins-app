'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePreloadedQuery, Preloaded } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { ProductCard } from './product-card';
import { BlurFade } from '@/src/components/ui/animations';
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight, Flame, Star } from 'lucide-react';
import { R2Image } from '@/src/components/ui/r2-image';
import { cn } from '@/lib/utils';
import { useOrgLink } from '@/src/hooks/use-org-link';

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

// Inner component shared by both variants
interface PopularProductsInnerProps {
  orgSlug?: string;
  products: ProductCardData[];
  loading: boolean;
}

function PopularProductsInner({ orgSlug, products, loading }: PopularProductsInnerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { buildOrgLink } = useOrgLink(orgSlug);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Split products: first one is featured, rest are regular
  const featuredProduct = products[0];
  const regularProducts = products.slice(1);

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
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-slate-400 mb-2">Trending</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-heading">Popular Products</h2>
        </div>
        <div className="flex items-center gap-2 pb-1">
          {/* Mobile scroll buttons */}
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-700" onClick={scrollLeft}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-700" onClick={scrollRight}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Link
            className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-all duration-200 whitespace-nowrap"
            href={buildOrgLink('/search')}
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      {loading ? (
        /* Loading skeleton grid */
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {new Array(8).fill(null).map((_, i) => (
            <motion.div
              key={`skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="overflow-hidden rounded-2xl border-0 bg-card shadow-md py-0">
                <div className="aspect-4/3 bg-linear-to-br from-secondary to-secondary/50 skeleton" />
                <CardHeader className="p-4 space-y-2">
                  <CardTitle className="h-5 w-3/4 rounded-lg bg-secondary skeleton" />
                  <div className="h-3 w-full rounded-lg bg-secondary skeleton" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-4 pt-0">
                  <span className="h-6 w-20 rounded-lg bg-secondary skeleton" />
                  <span className="h-8 w-8 rounded-full bg-secondary skeleton" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop: Featured spotlight + grid layout */}
          <div className="hidden md:block">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Featured product - larger card */}
              {featuredProduct && (
                <motion.div
                  className="lg:col-span-5 xl:col-span-5"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Link href={buildOrgLink(`/p/${featuredProduct.slug}`)} className="group block">
                    {/* Premium Editorial Layout */}
                    <div className="relative h-[480px] md:h-[540px] lg:h-[560px]">
                      {/* Image Container - Full width with elegant overlay */}
                      <div className="absolute inset-0 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xl group-hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] transition-all duration-700">
                        {featuredProduct.imageUrl?.[0] ? (
                          <R2Image
                            fileKey={featuredProduct.imageUrl[0]}
                            alt={featuredProduct.title}
                            fetchPriority="high"
                            loading="eager"
                            fill
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp className="h-24 w-24 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}

                        {/* Sophisticated gradient overlay */}
                        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-black/60 via-black/30 to-black/50 group-hover:from-black/50 group-hover:via-black/25 group-hover:to-black/40 transition-all duration-700" />
                        <div className="absolute inset-0 rounded-3xl bg-linear-to-t from-black/80 via-transparent to-transparent" />

                        {/* Featured badge - Premium design */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, y: -10 }}
                          whileInView={{ scale: 1, opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
                          className="absolute top-6 left-6 z-20"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-neon text-black text-xs font-black tracking-wide shadow-2xl shadow-brand-neon/50 backdrop-blur-md border-2 border-black/10">
                            <Flame className="h-4 w-4" />
                            <span className="uppercase">#1 Trending</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Content Overlay - Editorial style - Compact */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className={cn(
                          'absolute inset-x-0 bottom-0',
                          'bg-linear-to-t from-black/20 via-black/15 to-black/10',
                          'backdrop-blur-xs',
                          'rounded-b-3xl p-4 md:p-5',
                          'border-t border-white/10',
                          'flex flex-col justify-end'
                        )}
                      >
                        <div className="max-w-2xl w-full space-y-2.5">
                          {/* Category Label */}
                          <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-brand-neon" />
                            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-neon">Hot Pick</p>
                          </div>

                          {/* Title + Price Row - Compact layout */}
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white font-heading line-clamp-2 leading-tight group-hover:text-brand-neon transition-colors duration-500 flex-1">
                              {featuredProduct.title}
                            </h3>
                            {/* Price - Premium display */}
                            <div className="text-right shrink-0">
                              <p className="text-[9px] text-white/60 mb-0.5 font-medium uppercase tracking-wider">Starting from</p>
                              <p className="text-2xl md:text-3xl font-black text-brand-neon font-heading tracking-tight leading-none">
                                ₱{featuredProduct.minPrice?.toLocaleString() ?? '—'}
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          {featuredProduct.rating && featuredProduct.rating > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-white font-bold text-sm">{featuredProduct.rating.toFixed(1)}</span>
                              </div>
                              {featuredProduct.reviewsCount && (
                                <span className="text-white/70 text-[10px]">({featuredProduct.reviewsCount.toLocaleString()})</span>
                              )}
                            </div>
                          ) : null}

                          {/* Description + CTA Button Row */}
                          <div className="flex items-center justify-between gap-3">
                            {/* Description */}
                            {featuredProduct.description && (
                              <p className="text-xs md:text-sm text-white/85 line-clamp-2 leading-relaxed font-medium flex-1">
                                {featuredProduct.description}
                              </p>
                            )}

                            {/* CTA Button - Premium design */}
                            <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }} className="shrink-0">
                              <div
                                className={cn(
                                  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full',
                                  'bg-brand-neon text-black',
                                  'font-black text-[10px] uppercase tracking-wider',
                                  'shadow-lg shadow-brand-neon/40',
                                  'group-hover:shadow-brand-neon/60 group-hover:bg-white',
                                  'transition-all duration-300',
                                  'border-2 border-black/10'
                                )}
                              >
                                <span>Shop Now</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Decorative accent lines */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-brand-neon/50 to-transparent opacity-50" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Regular products grid */}
              <div className="lg:col-span-7 xl:col-span-7">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {regularProducts.map((p, index) => (
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
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Horizontal scroll carousel */}
          <div className="md:hidden -mx-4">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((p, index) => (
                <div key={p._id} className="shrink-0 w-[280px] snap-start">
                  <ProductCard
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
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 && (
        <BlurFade>
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="h-8 w-8 text-primary/50" />
            </div>
            <p className="text-muted-foreground text-lg">No trending products yet.</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Check back soon for hot items!</p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}

// Variant that uses preloaded queries (for server-side preloading)
function PopularProductsPreloaded({
  orgSlug,
  preloadedOrganization,
  preloadedProducts,
}: {
  orgSlug?: string;
  preloadedOrganization: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedProducts: Preloaded<typeof api.products.queries.index.getPopularProducts>;
}) {
  usePreloadedQuery(preloadedOrganization); // Hydrate but don't need the result
  const result = usePreloadedQuery(preloadedProducts);
  const loading = result === undefined;
  const products = (result?.products ?? []) as unknown as ProductCardData[];

  return <PopularProductsInner orgSlug={orgSlug} products={products} loading={loading} />;
}

// Variant that uses regular queries (for client-side fetching)
function PopularProductsQuery({ orgSlug }: { orgSlug?: string }) {
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );
  const result = useQuery(
    api.products.queries.index.getPopularProducts,
    organization?._id ? { limit: 8, organizationId: organization._id } : { limit: 8 }
  );
  const loading = result === undefined;
  const products = (result?.products ?? []) as unknown as ProductCardData[];

  return <PopularProductsInner orgSlug={orgSlug} products={products} loading={loading} />;
}

// Main export: chooses between preloaded and query variants
export function PopularProducts({ orgSlug, preloadedOrganization, preloadedProducts }: PopularProductsProps = {}) {
  // Use preloaded variant if both preloaded queries are provided
  if (preloadedOrganization && preloadedProducts) {
    return <PopularProductsPreloaded orgSlug={orgSlug} preloadedOrganization={preloadedOrganization} preloadedProducts={preloadedProducts} />;
  }

  // Otherwise use client-side queries
  return <PopularProductsQuery orgSlug={orgSlug} />;
}
