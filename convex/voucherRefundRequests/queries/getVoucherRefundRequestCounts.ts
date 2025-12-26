import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getVoucherRefundRequestCountsReturns = v.object({
  total: v.number(),
  pending: v.number(),
  approved: v.number(),
  rejected: v.number(),
});

export const getVoucherRefundRequestCountsHandler = async (ctx: QueryCtx) => {
  // Get all non-deleted requests
  const allRequests = await ctx.db
    .query('voucherRefundRequests')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Count by status
  const counts = {
    total: allRequests.length,
    pending: allRequests.filter((r) => r.status === 'PENDING').length,
    approved: allRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: allRequests.filter((r) => r.status === 'REJECTED').length,
  };

  return counts;
};

export const getVoucherRefundRequestCounts = query({
  args: {},
  returns: getVoucherRefundRequestCountsReturns,
  handler: getVoucherRefundRequestCountsHandler,
});

