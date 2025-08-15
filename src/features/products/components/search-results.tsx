"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { R2Image } from '@/src/components/ui/r2-image'

export function SearchResults ({ orgSlug }: { orgSlug?: string } = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const sortOptions = ['newest', 'popular', 'rating', 'price_low', 'price_high'] as const
  type SortOption = typeof sortOptions[number]
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    setQ(searchParams.get('q') ?? '')
  }, [searchParams])

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const searchArgs = q.trim()
    ? {
        query: q.trim(),
        limit: 50,
        ...(organization?._id ? { organizationId: organization._id } : {}),
      }
    : undefined
  const searchResult = useQuery(api.products.queries.index.searchProducts, searchArgs)

  const loading = q.trim() !== '' && searchResult === undefined
  const products = useMemo(() => {
    const list = searchResult?.products ?? []
    const copy = [...list]
    copy.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt
        case 'rating':
          if (b.rating !== a.rating) return b.rating - a.rating
          return b.reviewsCount - a.reviewsCount
        case 'price_low':
          return (a.minPrice ?? Number.MAX_VALUE) - (b.minPrice ?? Number.MAX_VALUE)
        case 'price_high':
          return (b.maxPrice ?? 0) - (a.maxPrice ?? 0)
        case 'popular':
          if (b.totalOrders !== a.totalOrders) return b.totalOrders - a.totalOrders
          return b.viewCount - a.viewCount
        default:
          return 0
      }
    })
    return copy
  }, [searchResult, sortBy])

  function handleSubmit (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push(
      orgSlug
        ? `/o/${orgSlug}/search?q=${encodeURIComponent(q.trim())}`
        : `/search?q=${encodeURIComponent(q.trim())}`
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 flex items-center gap-2" role="search">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
        <Button type="submit">Search</Button>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
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
      </form>

      {!q.trim() && (
        <div className="text-sm text-muted-foreground">Enter a search term to begin.</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? new Array(12).fill(null).map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-xl border bg-card shadow-sm py-0"
              >
                <div className="aspect-[4/3] animate-pulse bg-secondary" />
                <CardHeader className="p-3 md:p-3">
                  <CardTitle className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-3 md:p-3">
                  <span className="h-4 w-16 animate-pulse rounded bg-secondary" />
                  <span className="h-8 w-20 animate-pulse rounded bg-secondary" />
                </CardContent>
              </Card>
            ))
          : products.map((p: any) => (
              <Link
                key={p._id}
                href={orgSlug ? `/o/${orgSlug}/p/${p.slug}` : `/p/${p.slug}`}
                aria-label={`View ${p.title}`}
                className="group block"
                data-testid="product-card"
              >
                <Card
                  className="overflow-hidden rounded-xl border bg-card shadow-sm py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative h-40 w-full overflow-hidden md:h-44">
                    <R2Image
                      fileKey={p.imageUrl?.[0]}
                      alt={p.title}
                      width={800}
                      height={600}
                      className="h-full w-full bg-secondary object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1">
                      {p.isBestPrice && (
                        <Badge variant="secondary" className="text-[10px]">
                          Best price
                        </Badge>
                      )}
                      {p.discountLabel && (
                        <Badge variant="outline" className="text-[10px]">
                          {p.discountLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader className="space-y-1 p-3 md:p-3">
                    <CardTitle
                      className="line-clamp-2 text-base font-semibold leading-snug text-primary"
                      data-testid="product-card-title"
                    >
                      {p.title}
                    </CardTitle>
                    {p.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-3 md:p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" data-testid="product-card-price">
                        {p.minPrice !== undefined ? `$${p.minPrice.toFixed(2)}` : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star size={14} className="fill-current" />
                        {p.rating?.toFixed(1)} ({p.reviewsCount})
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      View
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!loading && q.trim() && products.length === 0 && (
        <div className="text-sm text-muted-foreground">No products found.</div>
      )}
    </div>
  )
}


