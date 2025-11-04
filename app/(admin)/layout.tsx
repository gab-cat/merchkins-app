import type { Metadata } from 'next';
import { ReactNode } from 'react';
import AdminHeader from '@/src/features/admin/components/admin-header';
import AdminFooter from '@/src/features/admin/components/admin-footer';

export const metadata: Metadata = {
  title: 'Admin — Merchkins',
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 min-h-[90vh]">{children}</div>
      <AdminFooter />
    </>
  );
}
