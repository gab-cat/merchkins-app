import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import { requireAuthentication, validateOrderExists, logAction } from '../../helpers';
import { createSystemOrderLog } from './createOrderLog';

export const confirmOrderReceivedArgs = {
  orderId: v.id('orders'),
};

/**
 * Customer confirms they have received their order (READY -> DELIVERED)
 * This mutation can only be called by the customer who placed the order
 */
export const confirmOrderReceivedHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Validate customer ownership
  if (order.customerId !== currentUser._id) {
    throw new Error('Only the customer who placed this order can confirm receipt');
  }

  // Validate order is in READY status
  if (order.status !== 'READY') {
    throw new Error('Order must be ready for pickup before confirming receipt');
  }

  const now = Date.now();
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;

  // Update status history
  const statusHistory = [...order.recentStatusHistory];
  statusHistory.unshift({
    status: 'DELIVERED',
    changedBy: currentUser._id,
    changedByName: actorName,
    reason: 'Customer confirmed order received',
    changedAt: now,
  });

  // Update order status to DELIVERED
  await ctx.db.patch(order._id, {
    status: 'DELIVERED',
    recentStatusHistory: statusHistory.slice(0, 5),
    updatedAt: now,
  });

  // Create order log
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'STATUS_CHANGE',
    reason: 'Order marked as delivered',
    message: `${actorName} confirmed receipt of the order`,
    previousValue: 'READY',
    newValue: 'DELIVERED',
    isPublic: true,
    actorId: currentUser._id,
  });

  // Schedule delivered notification email
  await ctx.scheduler.runAfter(0, internal.orders.actions.sendOrderStatusEmail.sendOrderStatusEmail, {
    orderId: order._id,
    newStatus: 'DELIVERED',
  });
  console.log('Delivered notification email scheduled for order:', order.orderNumber);

  // Log action
  await logAction(
    ctx,
    'confirm_order_received',
    'USER_ACTION',
    'LOW',
    `Customer confirmed receipt of order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    order.organizationId ?? undefined,
    {
      orderId: order._id,
      orderNumber: order.orderNumber,
    }
  );

  return order._id;
};
