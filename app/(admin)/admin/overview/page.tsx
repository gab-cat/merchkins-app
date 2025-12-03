import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminOverviewContentNew } from '@/src/features/admin/components/admin-overview-content-new';

export const metadata: Metadata = {
  title: 'Admin Overview | Merchkins',
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
      </div>
      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border p-4">
          <div className="h-4 w-32 rounded bg-muted animate-pulse mb-4" />
          <div className="h-[280px] rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-xl border p-4">
          <div className="h-4 w-28 rounded bg-muted animate-pulse mb-4" />
          <div className="h-[280px] rounded bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminOverviewContentNew />
    </Suspense>
  );
}
