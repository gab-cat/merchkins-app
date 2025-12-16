'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex-helpers/react/cache';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/src/components/admin';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, Archive, Edit } from 'lucide-react';
import Link from 'next/link';
import { BatchOrderTable } from '@/src/features/admin/components/batches/batch-order-table';
import { BatchBulkActions } from '@/src/features/admin/components/batches/batch-bulk-actions';
import { BatchForm } from '@/src/features/admin/components/batches/batch-form';
import { BatchBadge } from '@/src/features/admin/components/batches/batch-badge';
import type { Id } from '@/convex/_generated/dataModel';

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = params.id as Id<'orderBatches'>;
  const orgSlug = searchParams.get('org') || null;

  const batch = useQuery(api.orderBatches.index.getBatchById, { batchId });
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [editingBatch, setEditingBatch] = useState(false);

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedOrders(new Set(ids));
  }, []);

  if (batch === undefined || organization === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Batch Details"
          description="View and manage batch orders"
          icon={<Package className="h-5 w-5" />}
          breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Batches', href: '/admin/batches' }, { label: 'Details' }]}
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

  if (!batch || !organization) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Batch Not Found"
          description="The batch you're looking for doesn't exist"
          icon={<Package className="h-5 w-5" />}
          breadcrumbs={[
            { label: 'Admin', href: '/admin/overview' },
            { label: 'Batches', href: '/admin/batches' },
          ]}
        />
        <div className="py-12 text-center border rounded-lg">
          <p className="text-muted-foreground mb-4">Batch not found</p>
          <Link href="/admin/batches">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin-body">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/admin/batches">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <BatchBadge name={batch.name} isArchived={batch.isDeleted} size="lg" />
            {!batch.isActive && <span className="text-sm text-muted-foreground">(Inactive)</span>}
          </div>
          {batch.description && <p className="text-sm text-muted-foreground ml-12">{batch.description}</p>}
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-12">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditingBatch(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Batch
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
        {[
          { label: 'Total Orders', value: batch.stats.total, color: 'text-foreground' },
          { label: 'Pending', value: batch.stats.pending, color: 'text-amber-600' },
          { label: 'Processing', value: batch.stats.processing, color: 'text-blue-600' },
          { label: 'Ready', value: batch.stats.ready, color: 'text-emerald-600' },
          { label: 'Delivered', value: batch.stats.delivered, color: 'text-emerald-700' },
        ].map((stat, index) => (
          <div key={stat.label} className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold font-admin-heading ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <BatchBulkActions batchId={batchId} selectedOrderIds={Array.from(selectedOrders)} onSuccess={() => setSelectedOrders(new Set())} />
      )}

      {/* Orders Table */}
      <BatchOrderTable batchId={batchId} onSelectionChange={handleSelectionChange} />

      {/* Edit Batch Dialog */}
      {editingBatch && (
        <BatchForm
          open={editingBatch}
          onOpenChange={setEditingBatch}
          organizationId={organization._id}
          batchId={batchId}
          initialData={{
            name: batch.name,
            description: batch.description,
            startDate: batch.startDate,
            endDate: batch.endDate,
            isActive: batch.isActive,
          }}
          onSuccess={() => {
            setEditingBatch(false);
          }}
        />
      )}
    </div>
  );
}
