'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, usePreloadedQuery, Preloaded } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/src/features/products/components/product-card';

interface Props {
  slug: string;
  orgSlug?: string;
  preloadedOrganization?: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategory?: Preloaded<typeof api.categories.queries.index.getCategoryBySlug>;
  preloadedProducts?: Preloaded<typeof api.products.queries.index.getProducts>;
}

// Inner component that handles UI and filter state
interface CategoryProductsInnerProps {
  slug: string;
  orgSlug?: string;
  organizationId?: string;
  category: { _id?: string; name?: string; description?: string } | null | undefined;
  initialProducts: { products: any[]; total: number; hasMore: boolean } | null | undefined;
}

function CategoryProductsInner({ slug: _slug, orgSlug, organizationId, category, initialProducts }: CategoryProductsInnerProps) {
  const categoryId = category?._id;

  type SortOption = 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState('');
  const [hasInventory, setHasInventory] = useState(true);
  const [tagsRaw, setTagsRaw] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const min = parseFloat(priceMin);
  const max = parseFloat(priceMax);
  const rating = parseFloat(minRating);
  const minVal = Number.isNaN(min) ? undefined : min;
  const maxVal = Number.isNaN(max) ? undefined : max;
  const ratingVal = Number.isNaN(rating) ? undefined : rating;
  const tagList = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Check if filters are at default values (for using initial preloaded data)
  const isDefaultFilters =
    sortBy === 'newest' && offset === 0 && priceMin === '' && priceMax === '' && minRating === '' && hasInventory === true && tagList.length === 0;

  // Use regular query for filtered results
  const filteredResult = useQuery(
    api.products.queries.index.getProducts,
    categoryId && !isDefaultFilters
      ? {
          ...(organizationId ? { organizationId: organizationId as any } : {}),
          categoryId: categoryId as any,
          sortBy,
          limit,
          offset,
          ...(hasInventory ? { hasInventory: true } : {}),
          ...(minVal !== undefined ? { minPrice: minVal } : {}),
          ...(maxVal !== undefined ? { maxPrice: maxVal } : {}),
          ...(ratingVal !== undefined ? { minRating: ratingVal } : {}),
          ...(tagList.length > 0 ? { tags: tagList } : {}),
        }
      : 'skip'
  );

  // Use initial products if filters are at defaults, otherwise use filtered result
  const productsResult = isDefaultFilters ? initialProducts : filteredResult;

  const loading = productsResult === undefined || category === undefined;
  const products = productsResult?.products ?? [];
  const total = productsResult?.total ?? 0;
  const hasMore = productsResult?.hasMore ?? false;

  const breadcrumb = useMemo(
    () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href={orgSlug ? `/o/${orgSlug}` : '/'} className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span>Category</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium">{category?.name ?? '...'}</span>
      </div>
    ),
    [category, orgSlug]
  );

  function applyFilters() {
    setOffset(0);
  }

  function clearFilters() {
    setPriceMin('');
    setPriceMax('');
    setMinRating('');
    setHasInventory(true);
    setTagsRaw('');
    setOffset(0);
    setSortBy('newest');
  }

  return (
    <div className="space-y-6">
      {breadcrumb}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">{category?.name ?? 'Loading...'}</h1>
          {category && <p className="text-muted-foreground leading-relaxed text-base">{category.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v as SortOption);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Price Range</label>
          <div className="flex gap-2">
            <Input
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min"
              inputMode="decimal"
              aria-label="Minimum price"
              className="h-9"
            />
            <Input
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max"
              inputMode="decimal"
              aria-label="Maximum price"
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Min Rating</label>
          <Input
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="0-5"
            inputMode="decimal"
            aria-label="Minimum rating"
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Tags</label>
          <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="tag1, tag2" aria-label="Tags" className="h-9" />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
            <input
              type="checkbox"
              checked={hasInventory}
              onChange={(e) => {
                setHasInventory(e.target.checked);
                setOffset(0);
              }}
              className="rounded"
            />
            In stock only
          </label>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
          <Button type="button" onClick={applyFilters} className="h-9">
            Apply
          </Button>
          <Button type="button" variant="outline" onClick={clearFilters} className="h-9">
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" data-testid="category-products-grid">
        {loading
          ? new Array(12).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden py-0 animate-pulse">
                <div className="aspect-4/3 bg-secondary skeleton" />
                <CardHeader className="space-y-2">
                  <div className="flex gap-1">
                    <span className="h-4 w-16 rounded bg-secondary" />
                    <span className="h-4 w-12 rounded bg-secondary" />
                  </div>
                  <CardTitle className="h-4 w-2/3 rounded bg-secondary" />
                  <div className="h-3 w-full rounded bg-secondary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="h-4 w-16 rounded bg-secondary" />
                  <span className="h-7 w-12 rounded bg-secondary" />
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
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found in this category.</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or browse other categories.</p>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {products.length} of {total} products
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              className="h-8"
            >
              Previous
            </Button>
            <Button type="button" size="sm" disabled={!hasMore || loading} onClick={() => setOffset(offset + limit)} className="h-8">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Variant that uses preloaded queries (for server-side preloading)
function CategoryProductsPreloaded({
  slug,
  orgSlug,
  preloadedOrganization,
  preloadedCategory,
  preloadedProducts,
}: {
  slug: string;
  orgSlug?: string;
  preloadedOrganization: Preloaded<typeof api.organizations.queries.index.getOrganizationBySlug>;
  preloadedCategory: Preloaded<typeof api.categories.queries.index.getCategoryBySlug>;
  preloadedProducts: Preloaded<typeof api.products.queries.index.getProducts>;
}) {
  const organization = usePreloadedQuery(preloadedOrganization);
  const category = usePreloadedQuery(preloadedCategory);
  const initialProducts = usePreloadedQuery(preloadedProducts);

  return (
    <CategoryProductsInner slug={slug} orgSlug={orgSlug} organizationId={organization?._id} category={category} initialProducts={initialProducts} />
  );
}

// Variant that uses regular queries (for client-side fetching)
function CategoryProductsQuery({ slug, orgSlug }: { slug: string; orgSlug?: string }) {
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');
  const organizationId = organization?._id;

  const category = useQuery(api.categories.queries.index.getCategoryBySlug, organizationId ? { slug, organizationId } : { slug });
  const categoryId = category?._id;

  // Fetch initial products with default filters
  const initialProducts = useQuery(
    api.products.queries.index.getProducts,
    categoryId
      ? {
          ...(organizationId ? { organizationId } : {}),
          categoryId,
          sortBy: 'newest' as const,
          limit: 24,
          offset: 0,
          hasInventory: true,
        }
      : 'skip'
  );

  return (
    <CategoryProductsInner slug={slug} orgSlug={orgSlug} organizationId={organizationId} category={category} initialProducts={initialProducts} />
  );
}

// Main export: chooses between preloaded and query variants
export function CategoryProducts({ slug, orgSlug, preloadedOrganization, preloadedCategory, preloadedProducts }: Props) {
  // Use preloaded variant if all preloaded queries are provided
  if (preloadedOrganization && preloadedCategory && preloadedProducts) {
    return (
      <CategoryProductsPreloaded
        slug={slug}
        orgSlug={orgSlug}
        preloadedOrganization={preloadedOrganization}
        preloadedCategory={preloadedCategory}
        preloadedProducts={preloadedProducts}
      />
    );
  }

  // Otherwise use client-side queries
  return <CategoryProductsQuery slug={slug} orgSlug={orgSlug} />;
}
