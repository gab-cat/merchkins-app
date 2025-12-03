import { Suspense } from 'react';
import { AdminGuard } from '@/src/features/admin/components/admin-guard';
import { OrgSettingsForm } from '@/src/features/organizations/components/org-settings-form';
import { api } from '@/convex/_generated/api';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminAnnouncementsList } from '@/src/features/organizations/components/admin-announcements-list';
import { fetchQuery } from 'convex/nextjs';
import { Settings, Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = (await searchParams) || {};
  const rawOrg = params['org'];
  const orgSlug = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

  // Fallback: if no org is specified, choose default from memberships and redirect
  if (!orgSlug) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      redirect('/organizations');
    }
    const currentUser = await fetchQuery(api.users.queries.index.getCurrentUser, { clerkId });
    if (!currentUser?._id) {
      redirect('/organizations');
    }
    const orgs = await fetchQuery(api.organizations.queries.index.getOrganizationsByUser, { userId: currentUser._id });
    const preferred =
      (orgs || []).find((o: { membershipInfo?: { role?: string } }) => o?.membershipInfo?.role === 'ADMIN' || o?.membershipInfo?.role === 'STAFF') ||
      (orgs || [])[0];
    if (preferred?.slug) {
      redirect(`/admin/org-settings?org=${preferred.slug}`);
    }
    redirect('/organizations');
  }

  const organization = await fetchQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug as string });

  if (!organization) return notFound();

  return (
    <div className="font-admin-body space-y-6">
      <AdminGuard />

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold font-admin-heading tracking-tight">Organization Settings</h1>
            <p className="text-sm text-muted-foreground">Configure settings for {organization.name}</p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
          <a href={`/admin/overview?org=${orgSlug}`} className="hover:text-foreground transition-colors">
            Admin
          </a>
          <span>/</span>
          <span className="text-foreground">Settings</span>
        </nav>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <OrgSettingsForm organization={organization} />
      </Suspense>

      <AnnouncementsPanel />
    </div>
  );
}

function AnnouncementsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4" />
          Super-admin Announcements
        </CardTitle>
        <CardDescription>Important announcements from the platform administrators</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminAnnouncementsList />
      </CardContent>
    </Card>
  );
}
