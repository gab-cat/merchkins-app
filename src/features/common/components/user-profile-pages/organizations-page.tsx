"use client"

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
//
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SettingsHeader } from './settings'
import { R2Image } from '@/src/components/ui/r2-image'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

function RoleBadge({ role }: { role: string }) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { variant: 'default' as const, icon: '👑', color: 'bg-purple-100 text-purple-800' }
      case 'STAFF':
        return { variant: 'secondary' as const, icon: '👤', color: 'bg-blue-100 text-blue-800' }
      case 'MEMBER':
        return { variant: 'outline' as const, icon: '🫂', color: 'bg-green-100 text-green-800' }
      default:
        return { variant: 'outline' as const, icon: '❓', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const config = getRoleConfig(role)
  return (
    <Badge variant={config.variant} className={`text-xs px-2 py-1 font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {role}
    </Badge>
  )
}

export function OrganizationsPage() {
  const { userId: clerkId } = useAuth()
  
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }),
  )

  const orgs = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id
      ? { userId: currentUser._id }
      : 'skip',
  )

  const loading = currentUser === undefined || orgs === undefined

  // Add error handling for when clerkId is not available
  if (!clerkId) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Authentication required</h3>
        <p className="text-muted-foreground mb-4">Please sign in to view your organizations</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          {new Array(3).fill(null).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-lg border p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-6 w-16 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle case where currentUser is null (user not found in database)
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-6">Unable to load your profile information</p>
        <Button asChild>
          <Link href="/organizations">Go to Organizations</Link>
        </Button>
      </div>
    )
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
        <p className="text-muted-foreground mb-6">Join or create an organization to get started</p>
        <Button asChild>
          <Link href="/organizations">Browse Organizations</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsHeader title="Your Organizations" />
      <div className="space-y-3">
        {orgs.slice(0, 5).map((org) => {
          const role = org.membershipInfo?.role as 'ADMIN' | 'STAFF' | 'MEMBER' | undefined
          return (
            <div key={org._id} className="rounded-lg border bg-card p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {org.logo ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-background">
                      <R2Image fileKey={org.logo ?? null} alt={org.name ?? 'Organization'} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold ring-2 ring-background">
                      {org.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold truncate">{org.name}</p>
                    {role && <RoleBadge role={role} />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${org.organizationType === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {org.organizationType === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                    </span>
                    {org.slug && <span>• @{org.slug}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {org.slug && (
                    <>
                      <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                        <Link href={`/o/${org.slug}`}>Storefront</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                        <Link href={`/admin?org=${org.slug}`}>Manage</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
