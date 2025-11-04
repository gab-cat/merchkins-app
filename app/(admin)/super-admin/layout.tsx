import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { SuperAdminGuard } from '@/src/features/super-admin/components/super-admin-guard';
import { SuperAdminNav } from '@/src/features/super-admin/components/super-admin-nav';

export const metadata: Metadata = {
  title: 'Super Admin | Merchkins',
};

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-3 py-4">
      <SuperAdminGuard />
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-3">
          <SuperAdminNav />
        </aside>
        <section className="col-span-12 lg:col-span-9">{children}</section>
      </div>
    </div>
  );
}
