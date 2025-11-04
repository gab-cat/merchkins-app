import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminOverviewContent } from '@/src/features/admin/components/admin-overview-content';

export const metadata: Metadata = {
  title: 'Admin Overview | Merchkins',
};

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<div className="py-12">Loading...</div>}>
      <AdminOverviewContent />
    </Suspense>
  );
}
