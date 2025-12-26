import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getVoucherRefundRequestsArgs = {
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
};

export const getVoucherRefundRequestsHandler = async (
  ctx: QueryCtx,
  args: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }
) => {
  let dbQuery = ctx.db.query('voucherRefundRequests').filter((q) => q.eq(q.field('isDeleted'), false));

  if (args.status) {
    dbQuery = dbQuery.filter((q) => q.eq(q.field('status'), args.status));
  }

  const requests = await dbQuery.order('desc').collect();

  return requests;
};

export const getVoucherRefundRequests = query({
  args: getVoucherRefundRequestsArgs,
  handler: getVoucherRefundRequestsHandler,
});
