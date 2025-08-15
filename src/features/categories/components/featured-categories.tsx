"use client"

import React from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function FeaturedCategories (
  { orgSlug }: { orgSlug?: string } = {},
) {
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const result = useQuery(
    api.categories.queries.index.getCategories,
    organization?._id
      ? { organizationId: organization._id, isFeatured: true, isActive: true, limit: 6 }
      : { isFeatured: true, isActive: true, limit: 6 }
  )
  const loading = result === undefined
  const categories = result?.categories ?? []

  const isUrl = (val?: string) => !!val && (/^https?:\/\//.test(val) || val.startsWith('/'))

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Featured categories</h2>
        <Link className="text-sm text-primary" href={orgSlug ? `/o/${orgSlug}/search` : '/search'}>
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? new Array(6).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden">
                <div className="relative h-28 w-full">
                  <span className="absolute inset-0 animate-pulse bg-secondary/60" />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="h-4 w-28 animate-pulse rounded bg-secondary" />
                  <span className="h-4 w-16 animate-pulse rounded bg-secondary" />
                </div>
              </Card>
            ))
          : categories.map((c) => (
              <Link
                key={c._id}
                href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden border-muted/60 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative h-28 w-full">
                    {isUrl(c.imageUrl) ? (
                      <Image
                        src={c.imageUrl as string}
                        alt={`${c.name} cover`}
                        fill
                        sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 100vw"
                        className="object-cover object-center"
                        quality={85}
                        priority={false}
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: c.color
                            ? `linear-gradient(135deg, ${c.color} 0%, rgba(0,0,0,0.08) 100%)`
                            : undefined,
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    {c.color && (
                      <span
                        aria-hidden
                        className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/70 shadow"
                        style={{ backgroundColor: c.color }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium group-hover:underline">{c.name}</div>
                      {c.description && (
                        <div className="truncate text-xs text-muted-foreground">{c.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {c.activeProductCount} products
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
      {!loading && categories.length === 0 && (
        <div className="text-sm text-muted-foreground">No categories to show.</div>
      )}
    </div>
  )
}

