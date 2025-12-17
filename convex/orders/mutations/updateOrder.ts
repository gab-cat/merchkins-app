import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { internal } from '../../_generated/api';
import {
  requireAuthentication,
  validateOrderExists,
  validateUserExists,
  validateNonNegativeNumber,
  logAction,
  requireOrganizationPermission,
} from '../../helpers';

export const updateOrderArgs = {
  orderId: v.id('orders'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
  paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  cancellationReason: v.optional(v.union(v.literal('OUT_OF_STOCK'), v.literal('CUSTOMER_REQUEST'), v.literal('PAYMENT_FAILED'), v.literal('OTHERS'))),
  processedById: v.optional(v.id('users')),
  estimatedDelivery: v.optional(v.number()),
  customerNotes: v.optional(v.string()),
};

export const updateOrderHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    cancellationReason?: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'PAYMENT_FAILED' | 'OTHERS';
    processedById?: Id<'users'>;
    estimatedDelivery?: number;
    customerNotes?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Permission: org scope uses MANAGE_ORDERS; otherwise only owner/staff/admin
  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'update');
  } else if (!currentUser.isAdmin && !currentUser.isStaff && currentUser._id !== order.customerId) {
    throw new Error('Permission denied');
  }

  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  // Status transitions and history
  const now = Date.now();
  const statusHistory = [...order.recentStatusHistory];
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;

  if (args.status && args.status !== order.status) {
    // Prevent reverting from terminal states unless admin
    const terminalStates = new Set(['DELIVERED', 'CANCELLED']);
    if (terminalStates.has(order.status) && !currentUser.isAdmin) {
      throw new Error('Cannot change status of a finalized order');
    }

    // Basic allowed transitions
    const allowedNext: Record<string, Set<string>> = {
      PENDING: new Set(['PROCESSING', 'CANCELLED']),
      PROCESSING: new Set(['READY', 'CANCELLED']),
      READY: new Set(['DELIVERED', 'CANCELLED']),
      DELIVERED: new Set([]),
      CANCELLED: new Set([]),
    };

    if (!allowedNext[order.status].has(args.status)) {
      throw new Error('Invalid status transition');
    }

    updates.status = args.status;
    statusHistory.unshift({
      status: args.status,
      changedBy: currentUser._id,
      changedByName: actorName,
      reason: `Status changed from ${order.status} to ${args.status}`,
      changedAt: now,
    });
    // Keep last 5 changes
    updates.recentStatusHistory = statusHistory.slice(0, 5);
  }

  if (args.paymentStatus && args.paymentStatus !== order.paymentStatus) {
    // Simple guardrails: cannot go from REFUNDED to PAID
    if (order.paymentStatus === 'REFUNDED' && args.paymentStatus === 'PAID') {
      throw new Error('Invalid payment status transition');
    }
    updates.paymentStatus = args.paymentStatus;
    // Set paidAt when payment status changes to PAID (if not already set)
    if (args.paymentStatus === 'PAID' && !order.paidAt) {
      updates.paidAt = Date.now();
    }
  }

  if (args.cancellationReason) {
    updates.cancellationReason = args.cancellationReason;
  }

  if (args.estimatedDelivery !== undefined) {
    updates.estimatedDelivery = args.estimatedDelivery;
  }

  if (args.customerNotes !== undefined) {
    updates.customerNotes = args.customerNotes;
  }

  if (args.processedById) {
    const processor = await validateUserExists(ctx, args.processedById);
    updates.processedById = processor._id;
    updates.processorInfo = {
      firstName: processor.firstName,
      lastName: processor.lastName,
      email: processor.email,
      imageUrl: processor.imageUrl,
    };
  }

  await ctx.db.patch(args.orderId, updates);

  // Schedule status notification email for READY and DELIVERED statuses (non-blocking)
  if (args.status && (args.status === 'READY' || args.status === 'DELIVERED')) {
    await ctx.scheduler.runAfter(0, internal.orders.actions.sendOrderStatusEmail.sendOrderStatusEmail, {
      orderId: args.orderId,
      newStatus: args.status,
    });
    console.log(`Order status email (${args.status}) scheduled for order:`, args.orderId);
  }

  // If delivered, set deliveredAt-like info in history only (kept in status history)

  await logAction(
    ctx,
    'update_order',
    'DATA_CHANGE',
    'LOW',
    `Updated order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    order.organizationId ?? undefined,
    {
      orderId: order._id,
      updatedFields: Object.keys(updates),
    }
  );

  return args.orderId;
};
