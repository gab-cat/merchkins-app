import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getRefundRequestsByUserArgs = {
  userId: v.optional(v.id('users')),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
  limit: v.optional(v.number()),
} as const;

export const getRefundRequestsByUserHandler = async (
  ctx: QueryCtx,
  args: {
    userId?: Id<'users'>;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    limit?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Users can only see their own requests unless admin
  const targetUserId = args.userId && (currentUser.isAdmin || currentUser.isStaff) ? args.userId : currentUser._id;

  if (targetUserId !== currentUser._id && !currentUser.isAdmin && !currentUser.isStaff) {
    throw new Error('Permission denied');
  }

  let query = ctx.db
    .query('refundRequests')
    .withIndex('by_requestedBy', (q) => q.eq('requestedById', targetUserId))
    .filter((q) => q.eq(q.field('isDeleted'), false));

  if (args.status) {
    query = query.filter((q) => q.eq(q.field('status'), args.status));
  }

  const requests = await query.order('desc').take(args.limit ?? 50);

  return requests;
};
