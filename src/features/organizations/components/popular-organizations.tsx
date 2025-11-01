"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold">Popular organizations</h2>
        <Link className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200" href="/organizations">
          View all
        </Link>
      </div>
      <div
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        data-testid="popular-organizations-grid"
      >
        {loading
          ? new Array(limit).fill(null).map((_, i) => (
              <Card
                key={`skeleton-org-${i}`}
                className="overflow-hidden rounded-xl border bg-card shadow-sm animate-pulse"
              >
                <div className="relative h-20 w-full bg-secondary skeleton" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-20 rounded bg-secondary" />
                      <div className="h-3 w-16 rounded bg-secondary" />
                    </div>
                  </div>
                  <div className="h-3 w-full rounded bg-secondary" />
                </div>
              </Card>
            ))
          : organizations.map((org) => (
              <Card
                key={org.id}
                className="overflow-hidden gap-0 rounded-xl py-0 border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
              >
                {/* Banner */}
                <div className="relative h-20 w-full overflow-hidden">
                  {org.bannerImageUrl ? (
                    <Image
                      src={org.bannerImageUrl as string}
                      alt={`${org.name} banner`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : org.bannerImage ? (
                    isKey(org.bannerImage) ? (
                      <R2Image
                        fileKey={org.bannerImage as string}
                        alt={`${org.name} banner`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={org.bannerImage as string}
                        alt={`${org.name} banner`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-muted to-muted/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white shadow-md flex-shrink-0">
                      {org.logoUrl ? (
                        <Image
                          src={org.logoUrl as string}
                          alt={`${org.name} logo`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : org.logo ? (
                        isKey(org.logo) ? (
                          <R2Image
                            fileKey={org.logo as string}
                            alt={`${org.name} logo`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Image
                            src={org.logo as string}
                            alt={`${org.name} logo`}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        )
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {org.name?.charAt(0) || 'O'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="truncate text-sm font-bold">
                          <Link href={`/o/${org.slug}`} aria-label={`Open ${org.name}`} className="hover:text-primary transition-colors">
                            {org.name}
                          </Link>
                        </CardTitle>
                        <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0.5 font-medium">
                          {org.organizationType}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {org.memberCount} members • {org.totalOrderCount} orders
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-2 text-xs text-muted-foreground flex-1">
                      {org.description || 'No description available'}
                    </span>

                    {!org.isMember && (
                      org.organizationType === 'PUBLIC' ? (
                        <Button
                          size="sm"
                          data-testid={`join-org-${org.id}`}
                          aria-label={`Join ${org.name}`}
                          onClick={() => handleJoin(org.id, org.organizationType)}
                          className="shrink-0 h-7 px-2 text-xs hover:scale-105 transition-all duration-200"
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
                          className="shrink-0 h-7 px-2 text-xs hover:scale-105 transition-all duration-200"
                        >
                          Request
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled title="Invite only" className="shrink-0 h-7 px-2 text-xs">
                          Invite only
                        </Button>
                      )
                    )}

                    {org.isMember && (
                      <Button size="sm" variant="secondary" asChild className="shrink-0 h-7 px-2 text-xs hover:scale-105 transition-all duration-200">
                        <Link href={`/o/${org.slug}`} aria-label={`Open ${org.name}`}>
                          Open
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
      </div>
      {!loading && organizations.length === 0 && (
        <div className="text-sm text-muted-foreground">No organizations to show.</div>
      )}
    </div>
  )
}


