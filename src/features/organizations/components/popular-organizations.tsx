"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Id } from '@/convex/_generated/dataModel'
import { R2Image } from '@/src/components/ui/r2-image'

interface PopularOrganizationsProps {
  limit?: number
}

type PopularOrg = {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  logoUrl?: string
  bannerImage?: string
  bannerImageUrl?: string
  organizationType: string
  memberCount: number
  totalOrderCount: number
  isMember?: boolean
}

export function PopularOrganizations ({ limit = 8 }: PopularOrganizationsProps) {
  const result = useQuery(api.organizations.queries.index.getPopularOrganizations, { limit })
  const joinPublic = useMutation(api.organizations.mutations.index.joinPublicOrganization)
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization)

  const loading = result === undefined
  const organizations = (result?.organizations ?? []) as unknown as PopularOrg[]

  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/')

  const handleJoin = async (orgId: string, orgType: string) => {
    try {
      // Join public organizations directly (no invite)
      if (orgType === 'PUBLIC') {
        await joinPublic({ organizationId: orgId as unknown as Id<'organizations'> })
        return
      }
      if (orgType === 'PRIVATE') {
        await requestJoin({ organizationId: orgId as unknown as Id<'organizations'> })
      }
    } catch {}
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold">Popular organizations</h2>
        <Link className="text-sm text-primary" href="/organizations">View all</Link>
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-testid="popular-organizations-grid"
      >
        {loading
          ? new Array(limit).fill(null).map((_, i) => (
              <Card
                key={`skeleton-org-${i}`}
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div className="relative h-16 w-full bg-secondary md:h-20" />
                <CardHeader className="p-3 md:p-3">
                  <CardTitle className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-3 md:p-3">
                  <span className="h-4 w-24 animate-pulse rounded bg-secondary" />
                  <span className="h-8 w-20 animate-pulse rounded bg-secondary" />
                </CardContent>
              </Card>
            ))
          : organizations.map((org) => (
              <Card
                key={org.id}
                className="overflow-hidden rounded-xl py-0 border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Banner */}
                <div className="relative h-16 w-full overflow-hidden md:h-20">
                  {org.bannerImageUrl ? (
                    <Image
                      src={org.bannerImageUrl as string}
                      alt={`${org.name} banner`}
                      fill
                      className="object-cover"
                    />
                  ) : org.bannerImage ? (
                    isKey(org.bannerImage) ? (
                      <R2Image
                        fileKey={org.bannerImage as string}
                        alt={`${org.name} banner`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={org.bannerImage as string}
                        alt={`${org.name} banner`}
                        fill
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-muted to-muted/40" />
                  )}
                  {/* Logo overlay */}
                  <div className="absolute mt-0 z-40 -bottom-4 left-3 h-9 w-9 overflow-hidden rounded-full ring-2 ring-background md:h-10 md:w-10">
                    {org.logoUrl ? (
                      <Image
                        src={org.logoUrl as string}
                        alt={`${org.name} logo`}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover z-40"
                      />
                    ) : org.logo ? (
                      isKey(org.logo) ? (
                        <R2Image
                          fileKey={org.logo as string}
                          alt={`${org.name} logo`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={org.logo as string}
                          alt={`${org.name} logo`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="h-full w-full bg-secondary" />
                    )}
                  </div>
                </div>
                <CardHeader className="p-3 py-0 mt-0 md:p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pl-11">
                      <CardTitle className="truncate text-sm font-semibold">
                        <Link href={`/o/${org.slug}`} aria-label={`Open ${org.name}`}>
                          {org.name}
                        </Link>
                      </CardTitle>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">
                        {org.memberCount} members • {org.totalOrderCount} orders
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {org.organizationType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 p-3 py-0 md:p-3">
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {org.description || '—'}
                  </span>
                  {!org.isMember && (
                    org.organizationType === 'PUBLIC' ? (
                      <Button
                        size="sm"
                        data-testid={`join-org-${org.id}`}
                        aria-label={`Join ${org.name}`}
                        onClick={() => handleJoin(org.id, org.organizationType)}
                        className="shrink-0"
                      >
                        Join
                      </Button>
                    ) : org.organizationType === 'PRIVATE' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`request-org-${org.id}`}
                        aria-label={`Request to join ${org.name}`}
                        onClick={() => handleJoin(org.id, org.organizationType)}
                        className="shrink-0"
                      >
                        Request
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled title="Invite only" className="shrink-0">
                        Invite only
                      </Button>
                    )
                  )}
                  {org.isMember && (
                    <Button size="sm" variant="secondary" asChild className="shrink-0">
                      <Link href={`/o/${org.slug}`} aria-label={`Open ${org.name}`}>
                        Open
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>
      {!loading && organizations.length === 0 && (
        <div className="text-sm text-muted-foreground">No organizations to show.</div>
      )}
    </div>
  )
}


