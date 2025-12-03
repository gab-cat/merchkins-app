'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { JoinOrganizationDialog } from '@/src/features/organizations/components/join-organization-dialog';

export default function JoinOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const [dialogOpen, setDialogOpen] = useState(true);

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, { slug: orgSlug });

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Redirect back to organization page when dialog closes
      router.push(`/o/${orgSlug}`);
    }
  };

  const handleJoined = () => {
    // Redirect to organization search page after joining
    router.push(`/o/${orgSlug}/search`);
  };

  if (!organization) {
    return null; // Loading state handled by Convex
  }

  return (
    <JoinOrganizationDialog
      open={dialogOpen}
      onOpenChange={handleDialogClose}
      organizationId={organization._id}
      organizationName={organization.name}
      organizationLogoUrl={organization.logo}
      organizationBannerUrl={organization.bannerImage}
      organizationSlug={organization.slug}
      onJoined={handleJoined}
    />
  );
}


