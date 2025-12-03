import React, { Suspense } from 'react';
import { AdminGuard } from '@/src/features/admin/components/admin-guard';
import { OrgMembersManager } from '@/src/features/organizations/components/org-members-manager';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Doc } from '@/convex/_generated/dataModel';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Organization = Doc<'organizations'>;

// Type for organizations with membership info returned by getOrganizationsByUser
type OrganizationWithMembership = Organization & {
  membershipInfo?: {
    role?: 'ADMIN' | 'STAFF' | 'MEMBER';
    joinedAt?: number;
    permissions?: Array<{
      permissionCode: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>;
  };
};

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

export default async function Page({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = (await searchParams) || {};
  const rawOrg = params['org'];
  const orgSlug = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;

  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

  // Fallback: if no org is specified, choose a sensible default and redirect
  if (!orgSlug) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      redirect('/organizations');
    }
    const currentUser = await client.query(api.users.queries.index.getCurrentUser, { clerkId });
    if (!currentUser?._id) {
      redirect('/organizations');
    }
    const orgs = (await client.query(api.organizations.queries.index.getOrganizationsByUser, {
      userId: currentUser._id,
    })) as OrganizationWithMembership[];

    const preferred =
      (orgs || []).find((o: OrganizationWithMembership) => o?.membershipInfo?.role === 'ADMIN' || o?.membershipInfo?.role === 'STAFF') ||
      (orgs || [])[0];
    if (preferred?.slug) {
      redirect(`/admin/org-members?org=${preferred.slug}`);
    }
    redirect('/organizations');
  }

  const organization = await client.query(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug as string });

  if (!organization) return notFound();

  return (
    <div className="font-admin-body space-y-6">
      <AdminGuard />

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold font-admin-heading tracking-tight">Organization Members</h1>
            <p className="text-sm text-muted-foreground">Manage members of {organization.name}</p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
          <a href={`/admin/overview?org=${orgSlug}`} className="hover:text-foreground transition-colors">
            Admin
          </a>
          <span>/</span>
          <span className="text-foreground">Members</span>
        </nav>
      </div>

      <Suspense fallback={<MembersSkeleton />}>
        <OrgMembersManager organizationId={organization._id} orgSlug={orgSlug as string} />
      </Suspense>
    </div>
  );
}
