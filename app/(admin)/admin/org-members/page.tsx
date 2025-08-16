import React from 'react'
import { AdminGuard } from '@/src/features/admin/components/admin-guard'
import { OrgMembersManager } from '@/src/features/organizations/components/org-members-manager'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Doc } from '@/convex/_generated/dataModel'

type Organization = Doc<"organizations">

// Type for organizations with membership info returned by getOrganizationsByUser
type OrganizationWithMembership = Organization & {
  membershipInfo?: {
    role?: 'ADMIN' | 'STAFF' | 'MEMBER'
    joinedAt?: number
    permissions?: Array<{
      permissionCode: string
      canCreate: boolean
      canRead: boolean
      canUpdate: boolean
      canDelete: boolean
    }>
  }
}

export default async function Page ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams || {}
  const rawOrg = params['org']
  const orgSlug = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg

  const client = new ConvexHttpClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string,
  )

  // Fallback: if no org is specified, choose a sensible default and redirect
  if (!orgSlug) {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      redirect('/organizations')
    }
    const currentUser = await client.query(
      api.users.queries.index.getCurrentUser,
      { clerkId },
    )
    if (!currentUser?._id) {
      redirect('/organizations')
    }
    const orgs = await client.query(
      api.organizations.queries.index.getOrganizationsByUser,
      { userId: currentUser._id },
    ) as OrganizationWithMembership[]
    
    const preferred = (orgs || []).find(
      (o: OrganizationWithMembership) => o?.membershipInfo?.role === 'ADMIN' || o?.membershipInfo?.role === 'STAFF',
    ) || (orgs || [])[0]
    if (preferred?.slug) {
      redirect(`/admin/org-members?org=${preferred.slug}`)
    }
    redirect('/organizations')
  }

  const organization = await client.query(
    api.organizations.queries.index.getOrganizationBySlug,
    { slug: orgSlug as string },
  )

  if (!organization) return notFound()

  return (
    <div className="space-y-6">
      <AdminGuard />
      <h1 className="text-2xl font-semibold">Organization Members</h1>
      <OrgMembersManager organizationId={organization._id} />
    </div>
  )
}


