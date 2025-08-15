"use client"

import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { AdminGuard } from '@/src/features/admin/components/admin-guard'
import { UserProfile } from '@/src/features/users/components/user-profile'

export default function AdminMemberProfilePage () {
  const params = useParams() as { id: string }
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string }),
  )

  // Note: AdminGuard will redirect if user lacks access to the org context.
  return (
    <div className="space-y-6">
      <AdminGuard />
      <h1 className="text-2xl font-semibold">Member Profile</h1>
      <UserProfile
        userId={params.id as unknown as Id<'users'>}
        organizationId={organization?._id as Id<'organizations'>}
      />
    </div>
  )
}


