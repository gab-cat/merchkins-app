'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, TrendingUp, Star, TrendingDown, Search, Package, Sparkles } from 'lucide-react';
import { ProductCard } from './product-card';
import { BlurFade } from '@/src/components/ui/animations';
import { Doc } from '@/convex/_generated/dataModel';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';

type Product = Doc<'products'>;

export function SearchResults({ orgSlug }: { orgSlug?: string } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const debouncedQ = useDebouncedSearch(q, 300);
  type SortOption = 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  // Update URL when debounced value changes (but only if different from current URL param)
  useEffect(() => {
    const currentQ = searchParams.get('q') ?? '';
    if (debouncedQ.trim() !== currentQ.trim()) {
      const url = orgSlug
        ? `/o/${orgSlug}/search${debouncedQ.trim() ? `?q=${encodeURIComponent(debouncedQ.trim())}` : ''}`
        : `/search${debouncedQ.trim() ? `?q=${encodeURIComponent(debouncedQ.trim())}` : ''}`;
      router.replace(url);
    }
  }, [debouncedQ, orgSlug, router, searchParams]);

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  // Use search when there's a query, otherwise use popular products
  // Use debouncedQ for query to avoid excessive requests
  const searchArgs = debouncedQ.trim()
    ? {
        query: debouncedQ.trim(),
        limit: 50,
        ...(organization?._id ? { organizationId: organization._id } : {}),
      }
    : 'skip';
  const popularArgs = !debouncedQ.trim()
    ? {
        limit: 50,
        ...(organization?._id ? { organizationId: organization._id } : {}),
      }
    : 'skip';

  const searchResult = useQuery(api.products.queries.index.searchProducts, searchArgs);
  const popularResult = useQuery(api.products.queries.index.getPopularProducts, popularArgs);

  const loading = debouncedQ.trim() !== '' && searchResult === undefined;
  const result = debouncedQ.trim() ? searchResult : popularResult;
  const products = useMemo(() => {
    const list = result?.products ?? [];
    const copy = [...list];
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'rating':
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewsCount - a.reviewsCount;
        case 'price_low':
          return (a.minPrice ?? Number.MAX_VALUE) - (b.minPrice ?? Number.MAX_VALUE);
        case 'price_high':
          return (b.maxPrice ?? 0) - (a.maxPrice ?? 0);
        case 'popular':
          if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders;
          return b.viewCount - a.viewCount;
        default:
          return 0;
      }
    });
    return copy;
  }, [result, sortBy]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Use debouncedQ for immediate URL update on submit
    router.push(orgSlug ? `/o/${orgSlug}/search?q=${encodeURIComponent(debouncedQ.trim())}` : `/search?q=${encodeURIComponent(debouncedQ.trim())}`);
  }

  return (
    <div className="space-y-8">
      {/* Search header */}
      <BlurFade>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-heading">
              {debouncedQ.trim() ? `Search results for "${debouncedQ}"` : 'Browse Products'}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {debouncedQ.trim() ? `Found ${products.length} product${products.length !== 1 ? 's' : ''}` : 'Discover amazing products'}
          </p>
        </div>
      </BlurFade>

      {/* Search form */}
      <BlurFade delay={0.1}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 pl-10 rounded-xl border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-44 h-11 rounded-xl border-border/50">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </div>
                </SelectItem>
                <SelectItem value="rating">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </div>
                </SelectItem>
                <SelectItem value="price_low">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Price: Low to High
                  </div>
                </SelectItem>
                <SelectItem value="price_high">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price: High to Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="h-11 px-6 rounded-xl font-semibold shadow-sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>
      </BlurFade>

      {/* Results grid */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? new Array(10).fill(null).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm py-0">
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-secondary/50 skeleton" />
                  <CardHeader className="p-4 space-y-3">
                    <CardTitle className="h-5 w-2/3 rounded-lg bg-secondary skeleton" />
                    <div className="h-3 w-full rounded-lg bg-secondary skeleton" />
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-4 pt-0">
                    <span className="h-5 w-20 rounded-lg bg-secondary skeleton" />
                    <span className="h-4 w-14 rounded-lg bg-secondary skeleton" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          : products.map((p: Product, index: number) => (
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

      {/* Empty state */}
      {!loading && debouncedQ.trim() && products.length === 0 && (
        <BlurFade>
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Package className="h-10 w-10 text-primary/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground font-heading mb-2">No products found</h3>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              We couldn&apos;t find any products matching &quot;{debouncedQ}&quot;. Try adjusting your search terms or browse our categories.
            </p>
          </div>
        </BlurFade>
      )}
    </div>
  );
}
