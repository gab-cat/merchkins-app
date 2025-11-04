import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, logAction, requireOrganizationPermission } from '../../helpers';

export const restoreOrderArgs = {
  orderId: v.id('orders'),
};

export const restoreOrderHandler = async (ctx: MutationCtx, args: { orderId: Id<'orders'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'create');
  } else if (!currentUser.isAdmin && currentUser._id !== order.customerId) {
    throw new Error('Permission denied');
  }

  await ctx.db.patch(order._id, {
    isDeleted: false,
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    'restore_order',
    'DATA_CHANGE',
    'MEDIUM',
    `Restored order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    order.organizationId ?? undefined,
    { orderId: order._id }
  );

  return order._id;
};
