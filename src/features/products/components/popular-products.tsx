"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { R2Image } from '@/src/components/ui/r2-image'

type ProductCard = {
  _id: string
  slug: string
  title: string
  description?: string
  imageUrl?: string[]
  minPrice?: number
  rating?: number
  reviewsCount?: number
  isBestPrice?: boolean
  discountLabel?: string
}

export function PopularProducts ({ orgSlug }: { orgSlug?: string } = {}) {
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const result = useQuery(
    api.products.queries.index.getPopularProducts,
    organization?._id ? { limit: 8, organizationId: organization._id } : { limit: 8 }
  )
  const loading = result === undefined
  const products = (result?.products ?? []) as unknown as ProductCard[]

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Popular products</h2>
        <Link className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200" href={orgSlug ? `/o/${orgSlug}/search` : '/search'}>
          View all
        </Link>
      </div>
      <div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        data-testid="popular-products-grid"
      >
        {loading
          ? new Array(8).fill(null).map((_, i) => (
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
          : products.map((p, index) => (
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
                          <Star size={12} className="fill-current" />
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
      {!loading && products.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No popular products yet.</p>
        </div>
      )}
    </div>
  )
}

