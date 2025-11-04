import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Super Admin | Merchkins',
};

export default async function SuperAdminPage() {
  redirect('/super-admin/overview');
}
