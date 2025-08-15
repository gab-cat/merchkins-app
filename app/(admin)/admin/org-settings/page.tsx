import { AdminGuard } from '@/src/features/admin/components/admin-guard'
import { OrgSettingsForm } from '@/src/features/organizations/components/org-settings-form'
import { api } from '@/convex/_generated/api'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminAnnouncementsList } from '@/src/features/organizations/components/admin-announcements-list'
import { fetchQuery } from 'convex/nextjs'

export default async function Page ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = (await searchParams) || {}
  const rawOrg = params['org']
  const orgSlug = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg

  // Fallback: if no org is specified, choose default from memberships and redirect
  if (!orgSlug) {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      redirect('/organizations')
    }
    const currentUser = await fetchQuery(
      api.users.queries.index.getCurrentUser,
      { clerkId },
    )
    if (!currentUser?._id) {
      redirect('/organizations')
    }
    const orgs = await fetchQuery(
      api.organizations.queries.index.getOrganizationsByUser,
      { userId: currentUser._id },
    )
    const preferred = (orgs || []).find(
      (o: { membershipInfo?: { role?: string } }) =>
        o?.membershipInfo?.role === 'ADMIN' || o?.membershipInfo?.role === 'STAFF',
    ) || (orgs || [])[0]
    if (preferred?.slug) {
      redirect(`/admin/org-settings?org=${preferred.slug}`)
    }
    redirect('/organizations')
  }

  const organization = await fetchQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    { slug: orgSlug as string },
  )

  if (!organization) return notFound()

  return (
    <div className="space-y-6">
      <AdminGuard />
      <h1 className="text-2xl font-semibold">Organization Settings</h1>
      <OrgSettingsForm organization={organization} />
      <AnnouncementsPanel />
    </div>
  )
}

function AnnouncementsPanel () {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Super-admin announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <AdminAnnouncementsList />
      </CardContent>
    </Card>
  )
}


