import type { Metadata } from 'next';
import { VoucherRefundsList } from '@/src/features/super-admin/components/voucher-refunds-list';

export const metadata: Metadata = {
  title: 'Voucher Refunds — Super Admin | Merchkins',
  description: 'Manage voucher refund requests from customers.',
};

export default function SuperAdminVoucherRefundsPage() {
  return <VoucherRefundsList />;
}

