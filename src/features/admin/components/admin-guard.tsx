'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';

export function AdminGuard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org') || null;
  const { userId } = useAuth();

  const user = useQuery(api.users.queries.index.getCurrentUser, userId ? { clerkId: userId } : 'skip');

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const organizationsByUser = useQuery(api.organizations.queries.index.getOrganizationsByUser, user?._id ? { userId: user._id } : 'skip');

  useEffect(() => {
    if (user === undefined) return;

    // If an org is specified, wait for org and memberships to load
    if (orgSlug && (organization === undefined || organizationsByUser === undefined)) return;

    if (user === null) {
      router.replace('/sign-in');
      return;
    }

    // When an org is provided, require system admin or admin role in that org
    if (orgSlug) {
      if (!organization) {
        router.replace('/organizations');
        return;
      }
      if (user.isAdmin) return;
      type OrgWithMembership = {
        _id: string;
        slug: string;
        membershipInfo?: { role?: 'ADMIN' | 'STAFF' | 'MEMBER' };
      };
      const membership = (organizationsByUser as OrgWithMembership[] | undefined)?.find((o) => o.slug === organization.slug);
      const role = membership?.membershipInfo?.role;
      const isOrgAdminOrStaff = role === 'ADMIN' || role === 'STAFF';
      if (!isOrgAdminOrStaff) {
        router.replace('/');
      }
      return;
    }

    // No org specified: fallback to system admin or staff access
    if (!user.isAdmin && !user.isStaff) {
      router.replace('/');
    }
  }, [user, router, orgSlug, organization, organizationsByUser]);

  return null;
}
