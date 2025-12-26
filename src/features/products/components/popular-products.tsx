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
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
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

export function PopularProducts({ orgSlug, preloadedOrganization, preloadedProducts }: PopularProductsProps = {}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { buildOrgLink } = useOrgLink(orgSlug);

  const organization = preloadedOrganization
    ? usePreloadedQuery(preloadedOrganization)
    : useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }));
  const result = preloadedProducts
    ? usePreloadedQuery(preloadedProducts)
    : useQuery(api.products.queries.index.getPopularProducts, organization?._id ? { limit: 8, organizationId: organization._id } : { limit: 8 });
  const loading = result === undefined;
  const products = (result?.products ?? []) as unknown as ProductCardData[];

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
    <div className="space-y-8">
      {/* Section header */}
      <BlurFade>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <TrendingUp className="h-5 w-5 text-primary" />
                <Flame className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-heading">Trending Now</h2>
            </div>
            <p className="text-muted-foreground text-sm">Hot picks loved by our community</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile scroll buttons */}
            <div className="flex items-center gap-1 md:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollLeft}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={scrollRight}>
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
        </div>
      </BlurFade>

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
                  className="lg:col-span-5 xl:col-span-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={buildOrgLink(`/p/${featuredProduct.slug}`)} className="group block h-full">
                    <div
                      className={cn(
                        'relative h-full rounded-3xl overflow-hidden',
                        'bg-linear-to-br from-primary via-primary/90 to-primary/70',
                        'shadow-xl hover:shadow-2xl transition-all duration-500',
                        'hover:scale-[1.02]'
                      )}
                    >
                      {/* Background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-grid-pattern" />
                      </div>

                      {/* Featured badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-neon text-black text-xs font-bold shadow-lg">
                          <Flame className="h-3.5 w-3.5" />
                          #1 Trending
                        </div>
                      </div>

                      {/* Product image */}
                      <div className="relative aspect-4/5 p-6 pt-16">
                        {featuredProduct.imageUrl?.[0] ? (
                          <div className="relative h-full w-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                            <R2Image
                              fileKey={featuredProduct.imageUrl[0]}
                              alt={featuredProduct.title}
                              fetchPriority="high"
                              loading="eager"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                          </div>
                        ) : (
                          <div className="h-full w-full rounded-2xl bg-white/10 flex items-center justify-center">
                            <TrendingUp className="h-16 w-16 text-white/30" />
                          </div>
                        )}
                      </div>

                      {/* Product info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                        <h3 className="text-xl font-bold text-white font-heading line-clamp-2 mb-2">{featuredProduct.title}</h3>
                        {featuredProduct.description && <p className="text-white/70 text-sm line-clamp-2 mb-3">{featuredProduct.description}</p>}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-brand-neon font-heading">
                            ₱{featuredProduct.minPrice?.toLocaleString() ?? '—'}
                          </span>
                          <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold gap-1.5">
                            Shop now
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Regular products grid */}
              <div className="lg:col-span-7 xl:col-span-8">
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
