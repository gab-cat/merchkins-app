import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { logAction } from '../../helpers';
import { Doc } from '../../_generated/dataModel';

export const handleCheckoutSessionExpiryArgs = {
  checkoutId: v.optional(v.string()), // If provided, handle specific session; otherwise handle all expired
};

export const handleCheckoutSessionExpiryHandler = async (ctx: MutationCtx, args: { checkoutId?: string }) => {
  // Get the system admin user for system operations
  const systemUser = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', 'seed_admin'))
    .first();

  if (!systemUser) {
    console.error('System admin user not found');
    throw new Error('System admin user not found');
  }

  const now = Date.now();
  let sessionsToProcess;

  if (args.checkoutId) {
    // Handle specific session
    const session = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId!))
      .first();

    if (!session || session.status !== 'PENDING') {
      return { processed: false, reason: 'Session not found or not pending' };
    }

    if (!session.xenditInvoiceExpiryDate || session.xenditInvoiceExpiryDate > now) {
      return { processed: false, reason: 'Session invoice not expired' };
    }

    sessionsToProcess = [session];
  } else {
    // Handle all expired sessions
    const allPendingSessions = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_status', (q) => q.eq('status', 'PENDING'))
      .collect();

    sessionsToProcess = allPendingSessions.filter((session) => session.xenditInvoiceExpiryDate && session.xenditInvoiceExpiryDate < now);
  }

  let processedCount = 0;

  for (const session of sessionsToProcess) {
    // Update session status to EXPIRED
    await ctx.db.patch(session._id, {
      status: 'EXPIRED',
      updatedAt: now,
    });

    // Get all orders in the session
    const orders = await Promise.all(session.orderIds.map((orderId) => ctx.db.get(orderId)));

    const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

    // Cancel all orders in the session
    for (const order of validOrders) {
      // Only cancel if still pending
      if (order.status === 'PENDING' && order.paymentStatus === 'PENDING') {
        const statusUpdate = {
          status: 'CANCELLED' as const,
          changedBy: systemUser._id,
          changedByName: 'System',
          reason: 'Payment invoice expired',
          changedAt: now,
        };

        const currentHistory = order.recentStatusHistory || [];
        const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)]; // Keep last 5 entries

        await ctx.db.patch(order._id, {
          status: 'CANCELLED',
          cancellationReason: 'PAYMENT_FAILED',
          recentStatusHistory: updatedHistory as Doc<'orders'>['recentStatusHistory'],
          updatedAt: now,
        });

        // Log cancellation
        await logAction(
          ctx,
          'order_cancelled',
          'SYSTEM_EVENT',
          'MEDIUM',
          `Order ${order.orderNumber} cancelled due to expired payment invoice`,
          undefined, // System action
          order.organizationId,
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            reason: 'PAYMENT_FAILED',
            checkoutId: session.checkoutId,
          }
        );
      }
    }

    processedCount++;
  }

  return {
    processed: true,
    sessionsProcessed: processedCount,
  };
};
