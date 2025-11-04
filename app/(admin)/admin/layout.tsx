import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminGuard } from '@/src/features/admin/components/admin-guard';
import { AdminNav } from '@/src/features/admin/components/admin-nav';

export const metadata: Metadata = {
  title: 'Admin | Merchkins',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-3 py-4">
      <AdminGuard />
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-3">
          <AdminNav />
        </aside>
        <section className="col-span-12 lg:col-span-9">{children}</section>
      </div>
    </div>
  );
}
