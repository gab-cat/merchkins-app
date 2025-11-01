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
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Featured categories</h2>
        <Link className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200" href={orgSlug ? `/o/${orgSlug}/search` : '/search'}>
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? new Array(6).fill(null).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden animate-pulse">
                <div className="relative h-32 w-full bg-secondary skeleton" />
                <div className="flex items-center justify-between p-3">
                  <div className="space-y-1">
                    <span className="h-4 w-24 rounded bg-secondary block" />
                    <span className="h-3 w-32 rounded bg-secondary block" />
                  </div>
                  <span className="h-5 w-16 rounded bg-secondary" />
                </div>
              </Card>
            ))
          : categories.map((c) => (
              <Link
                key={c._id}
                href={orgSlug ? `/o/${orgSlug}/c/${c.slug}` : `/c/${c.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden border-muted/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30">
                  <div className="relative h-32 w-full overflow-hidden">
                    {isUrl(c.imageUrl) ? (
                      <Image
                        src={c.imageUrl as string}
                        alt={`${c.name} cover`}
                        fill
                        sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 100vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        quality={85}
                        priority={false}
                      />
                    ) : (
                      <div
                        className="h-full w-full transition-all duration-300"
                        style={{
                          background: c.color
                            ? `linear-gradient(135deg, ${c.color} 0%, rgba(0,0,0,0.08) 100%)`
                            : undefined,
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                    {c.color && (
                      <span
                        aria-hidden
                        className="absolute left-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/70 shadow-lg transition-all duration-200 group-hover:scale-110"
                        style={{ backgroundColor: c.color }}
                      />
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-white font-bold text-lg leading-tight drop-shadow-md group-hover:text-white/90 transition-colors">
                        {c.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        {c.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {c.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0 ml-2 text-[10px] px-2 py-0.5 font-medium">
                        {c.activeProductCount} products
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
      {!loading && categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No categories to show.</p>
        </div>
      )}
    </div>
  )
}

