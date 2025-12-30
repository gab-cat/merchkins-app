'use client';

import { Suspense } from 'react';
import { AdminGuard } from '@/src/features/admin/components/admin-guard';
import { OrgSettingsForm } from '@/src/features/organizations/components/org-settings-form';
import { api } from '@/convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminAnnouncementsList } from '@/src/features/organizations/components/admin-announcements-list';
import { Settings, Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/src/components/admin/page-header';

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

export default function Page() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  if (organization === undefined) {
    return (
      <div className="font-admin-body space-y-6">
        <SettingsSkeleton />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="font-admin-body space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-admin-body space-y-6">
      <AdminGuard />

      <PageHeader
        title="Organization Settings"
        description={`Configure settings for ${organization.name}`}
        icon={<Settings className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: `/admin/overview${suffix}` }, { label: 'Settings' }]}
      />

      <Suspense fallback={<SettingsSkeleton />}>
        <OrgSettingsForm organization={organization} />
      </Suspense>
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
