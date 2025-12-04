import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  requireAuthentication,
  validateOrderExists,
  validateUserExists,
  logAction,
  requireOrganizationPermission,
  sanitizeString,
} from '../../helpers';
import { createSystemOrderLog } from './createOrderLog';

export const updateOrderWithNoteArgs = {
  orderId: v.id('orders'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
  paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  cancellationReason: v.optional(v.union(v.literal('OUT_OF_STOCK'), v.literal('CUSTOMER_REQUEST'), v.literal('PAYMENT_FAILED'), v.literal('OTHERS'))),
  processedById: v.optional(v.id('users')),
  estimatedDelivery: v.optional(v.number()),
  customerNotes: v.optional(v.string()),
  // Required user note for status/payment changes
  userNote: v.string(),
  isPublic: v.optional(v.boolean()),
};

export const updateOrderWithNoteHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    cancellationReason?: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'PAYMENT_FAILED' | 'OTHERS';
    processedById?: Id<'users'>;
    estimatedDelivery?: number;
    customerNotes?: string;
    userNote: string;
    isPublic?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Validate user note is not empty
  const userNote = sanitizeString(args.userNote).trim();
  if (!userNote) {
    throw new Error('A note is required when updating order status or payment status');
  }

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

  // Track what changed for logging
  let statusChanged = false;
  let paymentStatusChanged = false;
  let previousStatus: string | undefined;
  let newStatus: string | undefined;
  let previousPaymentStatus: string | undefined;
  let newPaymentStatus: string | undefined;

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

    previousStatus = order.status;
    newStatus = args.status;
    statusChanged = true;

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
    previousPaymentStatus = order.paymentStatus;
    newPaymentStatus = args.paymentStatus;
    paymentStatusChanged = true;
    updates.paymentStatus = args.paymentStatus;
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

  // Create order log(s) for the changes
  if (statusChanged) {
    const logType = newStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'STATUS_CHANGE';
    await createSystemOrderLog(ctx, {
      orderId: args.orderId,
      logType,
      reason: `Order status changed from ${previousStatus} to ${newStatus}`,
      message: `Status updated by ${actorName}`,
      userMessage: userNote,
      previousValue: previousStatus,
      newValue: newStatus,
      isPublic: args.isPublic ?? true,
      actorId: currentUser._id,
    });
  }

  if (paymentStatusChanged) {
    await createSystemOrderLog(ctx, {
      orderId: args.orderId,
      logType: 'PAYMENT_UPDATE',
      reason: `Payment status changed from ${previousPaymentStatus} to ${newPaymentStatus}`,
      message: `Payment status updated by ${actorName}`,
      userMessage: userNote,
      previousValue: previousPaymentStatus,
      newValue: newPaymentStatus,
      isPublic: args.isPublic ?? true,
      actorId: currentUser._id,
    });
  }

  // If neither status nor payment changed but we have a note, create a general note
  if (!statusChanged && !paymentStatusChanged) {
    await createSystemOrderLog(ctx, {
      orderId: args.orderId,
      logType: 'NOTE_ADDED',
      reason: 'Manual note added',
      message: `Note added by ${actorName}`,
      userMessage: userNote,
      isPublic: args.isPublic ?? true,
      actorId: currentUser._id,
    });
  }

  await logAction(
    ctx,
    'update_order_with_note',
    'DATA_CHANGE',
    'LOW',
    `Updated order ${order.orderNumber ?? String(order._id)} with note`,
    currentUser._id,
    order.organizationId ?? undefined,
    {
      orderId: order._id,
      updatedFields: Object.keys(updates),
      statusChanged,
      paymentStatusChanged,
    }
  );

  return args.orderId;
};
