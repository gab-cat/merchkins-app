'use client';

import React, { Suspense } from 'react';
import { AdminGuard } from '@/src/features/admin/components/admin-guard';
import { OrgMembersManager } from '@/src/features/organizations/components/org-members-manager';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/src/components/admin/page-header';

// Loading skeleton
function MembersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
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
        <MembersSkeleton />
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
        title="Organization Members"
        description={`Manage members of ${organization.name}`}
        icon={<Users className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: `/admin/overview${suffix}` }, { label: 'Members' }]}
      />

      <Suspense fallback={<MembersSkeleton />}>
        <OrgMembersManager organizationId={organization._id} _orgSlug={orgSlug || ''} />
      </Suspense>
    </div>
  );
}
