import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, logAction, requireOrganizationPermission } from '../../helpers';

export const deleteOrderArgs = {
  orderId: v.id('orders'),
};

export const deleteOrderHandler = async (ctx: MutationCtx, args: { orderId: Id<'orders'> }) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'delete');
  } else if (!currentUser.isAdmin && currentUser._id !== order.customerId) {
    throw new Error('Permission denied');
  }

  await ctx.db.patch(order._id, {
    isDeleted: true,
    updatedAt: Date.now(),
  });

  await logAction(
    ctx,
    'delete_order',
    'DATA_CHANGE',
    'HIGH',
    `Deleted order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    order.organizationId ?? undefined,
    { orderId: order._id }
  );

  return order._id;
};
