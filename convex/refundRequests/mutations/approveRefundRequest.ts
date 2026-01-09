import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import {
  requireAuthentication,
  validateStringLength,
  sanitizeString,
  logAction,
  requireOrganizationPermission,
  PERMISSION_CODES,
} from '../../helpers';
import { internal } from '../../_generated/api';

export const approveRefundRequestArgs = {
  refundRequestId: v.id('refundRequests'),
  adminMessage: v.string(),
} as const;

export const approveRefundRequestHandler = async (ctx: MutationCtx, args: { refundRequestId: Id<'refundRequests'>; adminMessage: string }) => {
  const currentUser = await requireAuthentication(ctx);

  const refundRequest = await ctx.db.get(args.refundRequestId);
  if (!refundRequest || refundRequest.isDeleted) {
    throw new Error('Refund request not found');
  }

  if (refundRequest.status !== 'PENDING') {
    throw new Error(`Refund request is already ${refundRequest.status.toLowerCase()}`);
  }

  // Validate permissions - org member with MANAGE_REFUNDS or super admin
  if (refundRequest.organizationId) {
    await requireOrganizationPermission(ctx, refundRequest.organizationId, PERMISSION_CODES.MANAGE_REFUNDS, 'update');
  } else if (!currentUser.isAdmin) {
    throw new Error('Permission denied');
  }

  // Validate admin message
  validateStringLength(args.adminMessage, 'Admin message', 10, 1000);
  const sanitizedMessage = sanitizeString(args.adminMessage);

  const now = Date.now();
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;

  // Verify order still exists and can be cancelled
  const order = await ctx.db.get(refundRequest.orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.status === 'DELIVERED') {
    throw new Error('Cannot approve refund for a delivered order');
  }

  // Create REFUND voucher (customer-initiated cancellation)
  const voucherId = await ctx.runMutation(internal.refundRequests.mutations.index.createRefundVoucher, {
    refundRequestId: args.refundRequestId,
    orderId: refundRequest.orderId,
    amount: refundRequest.refundAmount,
    assignedToUserId: refundRequest.requestedById,
    createdById: currentUser._id,
    cancellationInitiator: 'CUSTOMER',
  });

  // Update refund request
  await ctx.db.patch(args.refundRequestId, {
    status: 'APPROVED',
    adminMessage: sanitizedMessage,
    voucherId,
    reviewedById: currentUser._id,
    reviewedAt: now,
    reviewerInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
    },
    updatedAt: now,
  });

  // Cancel the order and restore stock (this also updates order status to CANCELLED)
  // Note: cancelOrderInternal is idempotent - if order is already CANCELLED, it returns early
  await ctx.runMutation(internal.orders.mutations.index.cancelOrderInternal, {
    orderId: refundRequest.orderId,
    reason: 'CUSTOMER_REQUEST',
    message: `Order cancelled due to approved refund request`,
    actorId: currentUser._id,
    actorName: actorName,
  });

  // Update order payment status to REFUNDED (order status is already CANCELLED from cancelOrderInternal)
  await ctx.db.patch(refundRequest.orderId, {
    paymentStatus: 'REFUNDED',
    updatedAt: now,
  });

  // NOTE: We do NOT create a payout adjustment here anymore because cancelOrderInternal
  // handles it if the order was paid and has a payoutInvoiceId.
  // This prevents duplicate adjustments.

  // Mark all associated payments as REFUNDED
  try {
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', refundRequest.orderId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    for (const payment of payments) {
      // Only update if not already REFUNDED
      if (payment.paymentStatus !== 'REFUNDED') {
        await ctx.db.patch(payment._id, {
          paymentStatus: 'REFUNDED',
          statusHistory: [
            ...payment.statusHistory,
            {
              status: 'REFUNDED',
              changedBy: currentUser._id,
              changedByName: actorName,
              reason: 'Refund request approved',
              changedAt: now,
            },
          ],
          updatedAt: now,
        });
      }
    }
  } catch {
    // Best-effort payment update; do not block refund approval on payment update failure
  }

  // Create order log for payment status change
  await ctx.runMutation(internal.orders.mutations.index.createOrderLogInternal, {
    orderId: refundRequest.orderId,
    logType: 'PAYMENT_UPDATE',
    reason: 'Refund approved',
    message: `Refund request approved by ${actorName}`,
    userMessage: sanitizedMessage,
    previousValue: refundRequest.orderInfo.paymentStatus,
    newValue: 'REFUNDED',
    isPublic: true,
  });

  // Schedule email to customer (mutations can't call actions directly)
  await ctx.scheduler.runAfter(0, internal.refundRequests.actions.index.sendRefundRequestEmail, {
    refundRequestId: args.refundRequestId,
    type: 'APPROVED',
  });

  // Create in-app notification for customer
  await ctx.runMutation(internal.refundRequests.mutations.index.createRefundNotification, {
    refundRequestId: args.refundRequestId,
    organizationId: refundRequest.organizationId,
    orderNumber: refundRequest.orderInfo.orderNumber,
    customerName: refundRequest.customerInfo.email,
    isForCustomer: true,
  });

  await logAction(
    ctx,
    'approve_refund_request',
    'DATA_CHANGE',
    'HIGH',
    `Refund request approved for order ${refundRequest.orderInfo.orderNumber ?? String(refundRequest.orderId)}`,
    currentUser._id,
    refundRequest.organizationId,
    { refundRequestId: args.refundRequestId, voucherId }
  );

  return args.refundRequestId;
};
