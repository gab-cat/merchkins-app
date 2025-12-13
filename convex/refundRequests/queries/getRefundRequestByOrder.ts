import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers';

export const getRefundRequestByOrderArgs = {
  orderId: v.id('orders'),
} as const;

export const getRefundRequestByOrderHandler = async (ctx: QueryCtx, args: { orderId: Id<'orders'> }) => {
  const currentUser = await requireAuthentication(ctx);

  // Get the order to check ownership
  const order = await ctx.db.get(args.orderId);
  if (!order) {
    return null;
  }

  // Check if user owns the order or is admin/staff
  if (order.customerId !== currentUser._id && !currentUser.isAdmin && !currentUser.isStaff) {
    // Check if user is org admin
    if (order.organizationId) {
      const member = await ctx.db
        .query('organizationMembers')
        .withIndex('by_user_organization', (q) => q.eq('userId', currentUser._id).eq('organizationId', order.organizationId as Id<'organizations'>))
        .filter((q) => q.eq(q.field('role'), 'ADMIN'))
        .first();
      if (!member) {
        throw new Error('Permission denied');
      }
    } else {
      throw new Error('Permission denied');
    }
  }

  // Get the most recent non-deleted refund request for this order
  const refundRequest = await ctx.db
    .query('refundRequests')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .order('desc')
    .first();

  return refundRequest;
};
