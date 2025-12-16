'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex-helpers/react/cache';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/src/components/admin';
import { Package } from 'lucide-react';
import { BatchList } from '@/src/features/admin/components/batches/batch-list';

export default function BatchesPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org') || null;

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  if (organization === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Batches"
          description="Manage order batches"
          icon={<Package className="h-5 w-5" />}
          breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Batches' }]}
        />
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-2 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Batches"
          description="Manage order batches"
          icon={<Package className="h-5 w-5" />}
          breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Batches' }]}
        />
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground">Please select an organization to view batches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Order Batches"
        description="Create and manage batches to organize orders by date ranges"
        icon={<Package className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Batches' }]}
      />

      <BatchList organizationId={organization._id} />
    </div>
  );
}
