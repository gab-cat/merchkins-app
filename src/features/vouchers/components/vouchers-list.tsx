'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { VoucherCard } from './voucher-card';
import { Gift, Loader2 } from 'lucide-react';

export function VouchersList() {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const vouchers = useQuery(api.vouchers.queries.index.getVouchersByUser, currentUser?._id ? { userId: currentUser._id, includeUsed: true } : 'skip');

  // Loading state: queries are still in flight
  if (clerkId && currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please sign in to view your vouchers.</p>
      </div>
    );
  }

  // Vouchers still loading after user is confirmed
  if (vouchers === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const vouchersList = vouchers;
  const activeVouchers = vouchersList.filter((v) => v.computedStatus === 'active');
  const usedVouchers = vouchersList.filter((v) => v.computedStatus === 'used');
  const otherVouchers = vouchersList.filter((v) => v.computedStatus !== 'active' && v.computedStatus !== 'used');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Gift className="h-8 w-8 text-emerald-600" />
          My Vouchers
        </h1>
        <p className="text-slate-600">View and manage your platform vouchers</p>
      </div>

      {vouchersList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Gift className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">You don't have any vouchers yet.</p>
          <p className="text-sm text-slate-500">Vouchers will appear here when you receive refunds or promotional codes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeVouchers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Vouchers ({activeVouchers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeVouchers.map((voucher) => (
                  <VoucherCard key={voucher._id} voucher={voucher} />
                ))}
              </div>
            </div>
          )}

          {usedVouchers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Used Vouchers ({usedVouchers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usedVouchers.map((voucher) => (
                  <VoucherCard key={voucher._id} voucher={voucher} />
                ))}
              </div>
            </div>
          )}

          {otherVouchers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Other ({otherVouchers.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherVouchers.map((voucher) => (
                  <VoucherCard key={voucher._id} voucher={voucher} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
