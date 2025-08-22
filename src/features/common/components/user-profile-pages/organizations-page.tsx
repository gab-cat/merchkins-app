"use client"

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, ExternalLink } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'
import Link from 'next/link'

function RoleBadge({ role }: { role: string }) {
  const color = role === 'ADMIN' ? 'default' : role === 'STAFF' ? 'secondary' : 'outline'
  return <Badge variant={color as 'default' | 'secondary' | 'outline'}>{role}</Badge>
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
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  // Handle case where currentUser is null (user not found in database)
  if (!currentUser) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">Unable to load your profile information</p>
        <Button asChild>
          <Link href="/organizations">Go to Organizations</Link>
        </Button>
      </div>
    )
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
        <p className="text-muted-foreground mb-4">Join or create an organization to get started</p>
        <Button asChild>
          <Link href="/organizations">Browse Organizations</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Organizations</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/organizations">View All</Link>
        </Button>
      </div>
      
      <div className="space-y-2">
        {orgs.slice(0, 5).map((org) => {
          const role = org.membershipInfo?.role as 'ADMIN' | 'STAFF' | 'MEMBER' | undefined
          return (
            <Card key={org._id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {org.organizationType === 'PUBLIC' ? 'Public' : 'Private'}
                        {org.slug && (
                          <span>• {org.slug}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {role && <RoleBadge role={role} />}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/o/${org.slug}`}>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
