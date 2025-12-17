import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const bulkUpdateBatchOrdersArgs = {
  batchId: v.id('orderBatches'),
  filters: v.object({
    status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
    paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  }),
  updates: v.object({
    status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
    paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  }),
  userMessage: v.optional(v.string()),
};

export const bulkUpdateBatchOrdersHandler = async (
  ctx: MutationCtx,
  args: {
    batchId: Id<'orderBatches'>;
    filters: {
      status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    };
    updates: {
      status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
      paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    };
    userMessage?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'update');

  // Get all orders in batch
  // Note: We query by organization and filter in memory since batchIds is an array
  const allOrgOrders = await ctx.db
    .query('orders')
    .withIndex('by_organization', (q) => q.eq('organizationId', batch.organizationId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Filter to only orders that include this batch in their batchIds
  const allBatchOrders = allOrgOrders.filter((order) => order.batchIds && order.batchIds.includes(args.batchId));

  // Filter orders based on provided filters
  let filteredOrders = allBatchOrders;
  if (args.filters.status) {
    filteredOrders = filteredOrders.filter((o) => o.status === args.filters.status);
  }
  if (args.filters.paymentStatus) {
    filteredOrders = filteredOrders.filter((o) => o.paymentStatus === args.filters.paymentStatus);
  }

  const now = Date.now();
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;
  let updatedCount = 0;

  for (const order of filteredOrders) {
    const orderUpdates: Record<string, unknown> = {
      updatedAt: now,
    };
    const statusHistory = [...order.recentStatusHistory];

    // Update status if provided
    if (args.updates.status && args.updates.status !== order.status) {
      // Basic allowed transitions check
      const allowedNext: Record<string, Set<string>> = {
        PENDING: new Set(['PROCESSING', 'CANCELLED']),
        PROCESSING: new Set(['READY', 'CANCELLED']),
        READY: new Set(['DELIVERED', 'CANCELLED']),
        DELIVERED: new Set([]),
        CANCELLED: new Set([]),
      };

      const terminalStates = new Set(['DELIVERED', 'CANCELLED']);
      if (terminalStates.has(order.status) && !currentUser.isAdmin) {
        continue; // Skip orders in terminal states unless admin
      }

      if (!allowedNext[order.status]?.has(args.updates.status)) {
        continue; // Skip invalid transitions
      }

      orderUpdates.status = args.updates.status;
      statusHistory.unshift({
        status: args.updates.status,
        changedBy: currentUser._id,
        changedByName: actorName,
        reason: `Batch update: Status changed from ${order.status} to ${args.updates.status}`,
        changedAt: now,
      });
      orderUpdates.recentStatusHistory = statusHistory.slice(0, 5);
    }

    // Update payment status if provided
    if (args.updates.paymentStatus && args.updates.paymentStatus !== order.paymentStatus) {
      // Simple guardrails: cannot go from REFUNDED to PAID
      if (order.paymentStatus === 'REFUNDED' && args.updates.paymentStatus === 'PAID') {
        continue; // Skip invalid transitions
      }
      orderUpdates.paymentStatus = args.updates.paymentStatus;
      // Set paidAt when payment status changes to PAID (if not already set)
      if (args.updates.paymentStatus === 'PAID' && !order.paidAt) {
        orderUpdates.paidAt = Date.now();
      }
    }

    // Only update if there are actual changes
    if (Object.keys(orderUpdates).length > 1) {
      await ctx.db.patch(order._id, orderUpdates);
      updatedCount++;

      // Create order log
      const logMessage =
        args.userMessage ||
        `Batch update: ${args.updates.status ? `Status → ${args.updates.status}` : ''} ${args.updates.paymentStatus ? `Payment → ${args.updates.paymentStatus}` : ''}`.trim();
      // Create order log manually to set isSystemLog: false (so it appears as a user action)
      const customerName =
        `${order.customerInfo?.firstName ?? ''} ${order.customerInfo?.lastName ?? ''}`.trim() || order.customerInfo?.email || 'Unknown';

      await ctx.db.insert('orderLogs', {
        orderId: order._id,
        createdById: currentUser._id,
        isSystemLog: false,
        creatorInfo: {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
        },
        orderInfo: {
          orderNumber: order.orderNumber,
          customerName,
          status: (args.updates.status as string) ?? order.status,
          totalAmount: order.totalAmount,
        },
        logType: args.updates.status ? 'STATUS_CHANGE' : 'PAYMENT_UPDATE',
        reason: logMessage,
        message: logMessage,
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });

      // Schedule email notifications
      // 1. Status update email (READY or DELIVERED)
      if (args.updates.status && (args.updates.status === 'READY' || args.updates.status === 'DELIVERED')) {
        await ctx.scheduler.runAfter(0, internal.orders.actions.sendOrderStatusEmail.sendOrderStatusEmail, {
          orderId: order._id,
          newStatus: args.updates.status,
        });
      }

      // 2. Payment confirmation email (PAID)
      if (args.updates.paymentStatus === 'PAID') {
        await ctx.scheduler.runAfter(0, internal.payments.actions.sendPaymentConfirmationEmail.sendPaymentConfirmationEmail, {
          orderId: order._id,
          paymentAmount: order.totalAmount,
          transactionId: 'Manual Update', // Placeholder for manual batch updates
        });
      }
    }
  }

  // Log action
  await logAction(
    ctx,
    'bulk_update_batch_orders',
    'DATA_CHANGE',
    'MEDIUM',
    `Bulk updated ${updatedCount} order(s) in batch "${batch.name}"`,
    currentUser._id,
    batch.organizationId,
    {
      batchId: args.batchId,
      filters: args.filters,
      updates: args.updates,
      updatedCount,
    }
  );

  return {
    batchId: args.batchId,
    updatedCount,
  };
};
