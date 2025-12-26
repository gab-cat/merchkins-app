import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getVoucherRefundRequestsByUserArgs = {
  userId: v.id('users'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
};

export const getVoucherRefundRequestsByUserReturns = v.any();

export const getVoucherRefundRequestsByUserHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }
) => {
  let dbQuery = ctx.db
    .query('voucherRefundRequests')
    .withIndex('by_requestedBy', (q) => q.eq('requestedById', args.userId))
    .filter((q) => q.eq(q.field('isDeleted'), false));

  if (args.status) {
    dbQuery = dbQuery.filter((q) => q.eq(q.field('status'), args.status));
  }

  const requests = await dbQuery.order('desc').collect();

  return requests;
};
