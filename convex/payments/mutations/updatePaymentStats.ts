import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';

// Internal recalculation of order payment status based on active payments
export const updatePaymentStatsArgs = {
  orderId: v.id('orders'),
  actorId: v.optional(v.id('users')),
  actorName: v.optional(v.string()),
} as const;

export const updatePaymentStatsHandler = async (ctx: MutationCtx, args: { orderId: Id<'orders'>; actorId?: Id<'users'>; actorName?: string }) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) return { success: false };

  const payments = await ctx.db
    .query('payments')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  let verifiedTotal = 0;
  let refundedTotal = 0;
  for (const p of payments) {
    if (p.paymentStatus === 'VERIFIED') verifiedTotal += p.amount;
    if (p.paymentStatus === 'REFUNDED') refundedTotal += p.amount;
  }

  let newPaymentStatus: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED' = order.paymentStatus;
  if (refundedTotal >= order.totalAmount && payments.length > 0) {
    newPaymentStatus = 'REFUNDED';
  } else if (verifiedTotal >= order.totalAmount) {
    newPaymentStatus = 'PAID';
  } else if (verifiedTotal > 0) {
    newPaymentStatus = 'DOWNPAYMENT';
  } else {
    newPaymentStatus = 'PENDING';
  }

  // Determine if we should auto-progress order status
  // Business rule: when fully paid (PAID) and currently PENDING, move to PROCESSING
  const shouldAutoProgress = newPaymentStatus === 'PAID' && order.status === 'PENDING';

  // Prefer actor from args, then processor, then customer
  const fallbackActorName =
    (order.processorInfo && `${order.processorInfo.firstName ?? ''} ${order.processorInfo.lastName ?? ''}`.trim()) ||
    `${order.customerInfo.firstName ?? ''} ${order.customerInfo.lastName ?? ''}`.trim() ||
    order.customerInfo.email;
  const actorId = args.actorId ?? order.processedById ?? order.customerId;
  const actorName = args.actorName ?? fallbackActorName;

  await ctx.runMutation(internal.orders.mutations.index.updateOrderStats, {
    orderId: order._id,
    paymentStatus: newPaymentStatus,
    status: shouldAutoProgress ? 'PROCESSING' : undefined,
    actorId: shouldAutoProgress ? actorId : undefined,
    actorName: shouldAutoProgress ? actorName : undefined,
  });

  return { success: true, paymentStatus: newPaymentStatus };
};
