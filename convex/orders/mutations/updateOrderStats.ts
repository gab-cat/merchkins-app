import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Internal stats updater for orders (e.g., payment updates)
export const updateOrderStatsArgs = {
  orderId: v.id('orders'),
  paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
  actorId: v.optional(v.id('users')),
  actorName: v.optional(v.string()),
};

export const updateOrderStatsHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    actorId?: Id<'users'>;
    actorName?: string;
  }
) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) {
    return; // No-op if order removed
  }

  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (args.paymentStatus) {
    updates.paymentStatus = args.paymentStatus;
  }

  // Optionally update order status with history (requires actor info)
  if (args.status && args.status !== order.status) {
    if (!args.actorId || !args.actorName) {
      throw new Error('actorId and actorName are required to update order status');
    }
    updates.status = args.status;
    const history = [
      {
        status: args.status,
        changedBy: args.actorId,
        changedByName: args.actorName,
        reason: `Status changed from ${order.status} to ${args.status}`,
        changedAt: Date.now(),
      },
      ...order.recentStatusHistory,
    ].slice(0, 5);
    updates.recentStatusHistory = history;
  }

  await ctx.db.patch(args.orderId, updates);
  return { success: true };
};
