'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FloatingActionBar } from './storefront-floating-action-bar';
import { OrgChatwoot } from './chatwoot/org-chatwoot';
import { StorefrontAccessGuard } from './storefront-access-guard';

interface StorefrontClientWrapperProps {
  orgSlug: string;
  children: React.ReactNode;
}

export function StorefrontClientWrapper({ orgSlug, children }: StorefrontClientWrapperProps) {
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  // Show loading while fetching org
  if (organization === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // Handle org not found
  if (!organization || organization.isDeleted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Organization not found</p>
      </div>
    );
  }

  return (
    <StorefrontAccessGuard
      organizationId={organization._id}
      organizationName={organization.name}
      organizationLogo={organization.logo}
      organizationBanner={organization.bannerImage}
      organizationSlug={organization.slug}
    >
      {children}
      <FloatingActionBar orgSlug={orgSlug} />
      <OrgChatwoot orgSlug={orgSlug} />
    </StorefrontAccessGuard>
  );
}
