"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { R2Image } from '@/src/components/ui/r2-image'

interface Props {
  slug: string
  orgSlug?: string
}

export function CategoryProducts ({ slug, orgSlug }: Props) {
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const organizationId = organization?._id

  const category = useQuery(
    api.categories.queries.index.getCategoryBySlug,
    organizationId ? { slug, organizationId } : { slug }
  )
  const categoryId = category?._id

  type SortOption = 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high'

  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [minRating, setMinRating] = useState('')
  const [hasInventory, setHasInventory] = useState(true)
  const [tagsRaw, setTagsRaw] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 24

  const min = parseFloat(priceMin)
  const max = parseFloat(priceMax)
  const rating = parseFloat(minRating)
  const minVal = Number.isNaN(min) ? undefined : min
  const maxVal = Number.isNaN(max) ? undefined : max
  const ratingVal = Number.isNaN(rating) ? undefined : rating
  const tagList = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

  const productsResult = useQuery(
    api.products.queries.index.getProducts,
    categoryId
      ? {
          ...(organizationId ? { organizationId } : {}),
          categoryId,
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
  )

  const loading = productsResult === undefined || category === undefined
  const products = productsResult?.products ?? []
  const total = productsResult?.total ?? 0
  const hasMore = productsResult?.hasMore ?? false

  const breadcrumb = useMemo(() => (
    <div className="mb-4 text-sm text-muted-foreground">
      <Link href={orgSlug ? `/o/${orgSlug}` : '/'}>Home</Link>
      <span className="mx-2">/</span>
      <span>Category</span>
      <span className="mx-2">/</span>
      <span className="text-foreground">{category?.name ?? '...'}</span>
    </div>
  ), [category, orgSlug])

  function applyFilters () {
    setOffset(0)
  }

  function clearFilters () {
    setPriceMin('')
    setPriceMax('')
    setMinRating('')
    setHasInventory(true)
    setTagsRaw('')
    setOffset(0)
    setSortBy('newest')
  }

  return (
    <div>
      {breadcrumb}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{category?.name ?? 'Loading...'}</h1>
          {category && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setOffset(0) }}>
            <SelectTrigger className="w-40">
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          placeholder="Min price"
          inputMode="decimal"
          aria-label="Minimum price"
        />
        <Input
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder="Max price"
          inputMode="decimal"
          aria-label="Maximum price"
        />
        <Input
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          placeholder="Min rating (0-5)"
          inputMode="decimal"
          aria-label="Minimum rating"
        />
        <Input
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="Tags (comma separated)"
          aria-label="Tags"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasInventory}
            onChange={(e) => { setHasInventory(e.target.checked); setOffset(0) }}
          />
          In stock only
        </label>
        <div className="sm:col-span-2 lg:col-span-5 flex gap-2">
          <Button type="button" onClick={applyFilters}>Apply</Button>
          <Button type="button" variant="outline" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-testid="category-products-grid"
      >
        {loading
          ? new Array(12).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden py-0">
                <div className="aspect-[4/3] animate-pulse bg-secondary" />
                <CardHeader>
                  <CardTitle className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="h-4 w-16 animate-pulse rounded bg-secondary" />
                  <span className="h-8 w-20 animate-pulse rounded bg-secondary" />
                </CardContent>
              </Card>
            ))
          : products.map((p) => (
              <Link
                key={p._id}
                href={orgSlug ? `/o/${orgSlug}/p/${p.slug}` : `/p/${p.slug}`}
                aria-label={`View ${p.title}`}
                className="group block"
                data-testid="product-card"
              >
                <Card className="overflow-hidden py-0 transition-shadow group-hover:shadow-md">
                  <div className="aspect-[4/3]">
                    <R2Image
                      fileKey={p.imageUrl?.[0]}
                      alt={p.title}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover bg-secondary"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {p.isBestPrice && (
                        <Badge variant="secondary" className="text-xs">
                          Best price
                        </Badge>
                      )}
                      {p.discountLabel && (
                        <Badge variant="outline" className="text-xs">
                          {p.discountLabel}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-medium leading-tight">
                      {p.title}
                    </CardTitle>
                    {p.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {p.minPrice !== undefined ? `$${p.minPrice.toFixed(2)}` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={14} className="fill-current" />
                        {p.rating?.toFixed(1)} ({p.reviewsCount})
                      </span>
                    </div>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!loading && products.length === 0 && (
        <div className="text-sm text-muted-foreground">No products found in this category.</div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? `Showing ${products.length} of ${total}` : ''}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={offset === 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!hasMore || loading}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}


