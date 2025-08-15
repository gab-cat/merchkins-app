"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { R2Image } from '@/src/components/ui/r2-image'
import { Input } from '@/components/ui/input'

interface OrganizationsPageProps {
  clerkId: string
}

export function OrganizationsPage ({ clerkId }: OrganizationsPageProps) {
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, { clerkId })
  const orgs = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id ? { userId: currentUser._id } : ('skip' as unknown as { userId: string })
  )
  const loading = currentUser === undefined || orgs === undefined

  // Explore: search public/private organizations
  const [search, setSearch] = useState('')
  const [orgType, setOrgType] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL')
  const searchResult = useQuery(
    api.organizations.queries.index.searchOrganizations,
    search.trim().length >= 2
      ? {
          searchTerm: search.trim(),
          limit: 24,
          ...(orgType !== 'ALL' ? { organizationType: orgType } : {}),
        }
      : ('skip' as unknown as { searchTerm: string }),
  )
  const joinPublic = useMutation(api.organizations.mutations.index.joinPublicOrganization)
  const requestJoin = useMutation(api.organizations.mutations.index.requestToJoinOrganization)

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-6">
        <Card>
          <CardHeader>
            <CardTitle>My organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-16 w-full rounded bg-secondary animate-pulse" />
              <div className="h-16 w-full rounded bg-secondary animate-pulse" />
              <div className="h-16 w-full rounded bg-secondary animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <div
          className="mt-6 rounded-xl border bg-card p-6 text-center shadow-sm"
          data-testid="orgs-cta"
        >
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Want your own organization?
          </h2>
          <p className="mt-2 text-muted-foreground">
            We can help set up a branded store for your organization.
          </p>
          <Button asChild size="lg" className="mt-4">
            <a href="mailto:business@merchkins.com">Email business@merchkins.com</a>
          </Button>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-3 py-16 text-center">
        <p className="text-muted-foreground">Please sign in to view organizations.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My organizations</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {orgs && orgs.length > 0 ? (
              <ul className="divide-y">
                {orgs.map((org) => {
                  const role = org.membershipInfo?.role as 'ADMIN' | 'STAFF' | 'MEMBER' | undefined
                  const elevated = role === 'ADMIN' || role === 'STAFF'
                  return (
                    <li key={org._id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 overflow-hidden rounded border bg-secondary flex-shrink-0">
                          <R2Image fileKey={org.logo} alt={`${org.name} logo`} width={40} height={40} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate">{org.name}</div>
                            {role && (
                              <Badge variant={role === 'MEMBER' ? 'secondary' : 'default'} className="text-[10px]">
                                {role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">/{org.slug}</div>
                          {org.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground max-w-prose">{org.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Link href={`/o/${org.slug}`}>
                          <Button size="sm">Open store</Button>
                        </Link>
                        {elevated && (
                          <Link href={`/admin/org-settings?org=${org.slug}`}>
                            <Button size="sm" variant="outline">Manage</Button>
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">You are not a member of any organizations yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Explore organizations */}
        <Card>
          <CardHeader>
            <CardTitle>Explore organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="mb-4 flex flex-wrap items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public and private organizations"
                aria-label="Search organizations"
                className="w-full md:w-80"
              />
              <div className="flex items-center gap-2 text-sm">
                <label className="text-muted-foreground">Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as 'ALL' | 'PUBLIC' | 'PRIVATE')}
                  className="h-9 rounded-md border bg-background px-2"
                  aria-label="Organization type filter"
                >
                  <option value="ALL">All</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </form>

            {search.trim().length < 2 ? (
              <div className="text-sm text-muted-foreground">Enter at least 2 characters to search.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {(searchResult ?? []).map((org: any) => (
                  <div key={org._id} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground truncate">/{org.slug}</div>
                      </div>
                      <Badge variant="secondary">{org.organizationType}</Badge>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm text-muted-foreground min-h-[2.5rem]">
                      {org.description || '—'}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{org.memberCount} members</span>
                      {org.organizationType === 'PUBLIC' ? (
                        <Button size="sm" onClick={async () => {
                          await joinPublic({ organizationId: org._id })
                        }}>Join</Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await requestJoin({ organizationId: org._id })
                        }}>Request</Button>
                      )}
                    </div>
                  </div>
                ))}
                {Array.isArray(searchResult) && searchResult.length === 0 && (
                  <div className="col-span-full text-sm text-muted-foreground">No organizations found.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <div
          className="rounded-xl border bg-card p-6 text-center shadow-sm"
          data-testid="orgs-cta"
        >
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Want your own organization?
          </h2>
          <p className="mt-2 text-muted-foreground">
            We can help set up a branded store for your organization.
          </p>
          <Button asChild size="lg" className="mt-4">
            <a href="mailto:business@merchkins.com">Email business@merchkins.com</a>
          </Button>
        </div>
      </div>
    </div>
  )
}


