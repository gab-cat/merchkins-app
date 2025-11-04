'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, TrendingUp, Star, TrendingDown, Search } from 'lucide-react';
import { ProductCard } from './product-card';
import { Doc } from '@/convex/_generated/dataModel';

type Product = Doc<'products'>;

export function SearchResults({ orgSlug }: { orgSlug?: string } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  type SortOption = 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );

  // Use search when there's a query, otherwise use popular products
  const searchArgs = q.trim()
    ? {
        query: q.trim(),
        limit: 50,
        ...(organization?._id ? { organizationId: organization._id } : {}),
      }
    : 'skip';
  const popularArgs = !q.trim()
    ? {
        limit: 50,
        ...(organization?._id ? { organizationId: organization._id } : {}),
      }
    : 'skip';

  const searchResult = useQuery(api.products.queries.index.searchProducts, searchArgs);
  const popularResult = useQuery(api.products.queries.index.getPopularProducts, popularArgs);

  const loading = q.trim() !== '' && searchResult === undefined;
  const result = q.trim() ? searchResult : popularResult;
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
    router.push(orgSlug ? `/o/${orgSlug}/search?q=${encodeURIComponent(q.trim())}` : `/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search">
        <div className="flex-1">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." aria-label="Search products" className="h-10" />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 h-10">
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
          <Button type="submit" className="h-10 px-6">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? new Array(10).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden rounded-xl border bg-card shadow-sm py-0 animate-pulse">
                <div className="aspect-[4/3] bg-secondary skeleton" />
                <CardHeader className="p-3 space-y-2">
                  <CardTitle className="h-4 w-2/3 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-3">
                  <span className="h-4 w-16 rounded bg-secondary" />
                  <span className="h-3 w-12 rounded bg-secondary" />
                </CardContent>
              </Card>
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

      {!loading && q.trim() && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found for &quot;{q}&quot;.</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
