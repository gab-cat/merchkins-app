import type { Metadata } from 'next';
import { VouchersList } from '@/src/features/vouchers/components/vouchers-list';

export const metadata: Metadata = {
  title: 'My Vouchers — Merchkins',
  description: 'View and manage your vouchers on Merchkins.',
};

export default function VouchersPage() {
  return (
    <div className="container mx-auto px-3 py-6">
      <VouchersList />
    </div>
  );
}

