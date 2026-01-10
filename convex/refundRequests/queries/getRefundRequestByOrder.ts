import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

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

  // Check if user owns the order or has administrative permission
  if (order.customerId !== currentUser._id) {
    if (order.organizationId) {
      await requireOrganizationPermission(ctx, order.organizationId as Id<'organizations'>, PERMISSION_CODES.MANAGE_REFUNDS, 'read');
    } else if (!currentUser.isAdmin) {
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
