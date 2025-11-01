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
import { Doc } from '@/convex/_generated/dataModel'

type Product = Doc<'products'>

export function SearchResults ({ orgSlug }: { orgSlug?: string } = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  type SortOption = 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high'
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
    : 'skip'
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" role="search">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 h-10">
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
          <Button type="submit" className="h-10 px-6">Search</Button>
        </div>
      </form>

      {!q.trim() && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Enter a search term to begin.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? new Array(10).fill(null).map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-xl border bg-card shadow-sm py-0 animate-pulse"
              >
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
              <Link
                key={p._id}
                href={orgSlug ? `/o/${orgSlug}/p/${p.slug}` : `/p/${p.slug}`}
                aria-label={`View ${p.title}`}
                className="group block"
                data-testid="product-card"
              >
                <Card
                  className={`overflow-hidden rounded-xl border bg-card shadow-sm py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 card-enter card-enter-delay-${(index % 8) + 1}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <R2Image
                      fileKey={p.imageUrl?.[0]}
                      alt={p.title}
                      width={400}
                      height={300}
                      className="h-full w-full bg-secondary object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute left-1.5 top-1.5 flex flex-wrap gap-1">
                      {p.isBestPrice && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-medium">
                          Best price
                        </Badge>
                      )}
                      {p.discountLabel && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-medium">
                          {p.discountLabel}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader className="space-y-1 p-3">
                    <CardTitle
                      className="line-clamp-2 text-sm font-semibold leading-tight text-primary group-hover:text-primary/90 transition-colors"
                      data-testid="product-card-title"
                    >
                      {p.title}
                    </CardTitle>
                    {p.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-3 pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary" data-testid="product-card-price">
                        {p.minPrice !== undefined ? `$${p.minPrice.toFixed(2)}` : ''}
                      </span>
                      {p.rating && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star size={12} className="fill-current text-yellow-400" />
                          {p.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-primary font-medium">
                      View →
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {!loading && q.trim() && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found for &quot;{q}&quot;.</p>
          <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  )
}


