import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateStringLength, sanitizeString, logAction, requireOrganizationPermission } from '../../helpers';
import { internal } from '../../_generated/api';

export const rejectRefundRequestArgs = {
  refundRequestId: v.id('refundRequests'),
  adminMessage: v.string(),
} as const;

export const rejectRefundRequestHandler = async (ctx: MutationCtx, args: { refundRequestId: Id<'refundRequests'>; adminMessage: string }) => {
  const currentUser = await requireAuthentication(ctx);

  const refundRequest = await ctx.db.get(args.refundRequestId);
  if (!refundRequest || refundRequest.isDeleted) {
    throw new Error('Refund request not found');
  }

  if (refundRequest.status !== 'PENDING') {
    throw new Error(`Refund request is already ${refundRequest.status.toLowerCase()}`);
  }

  // Validate permissions - org admin or super admin
  if (refundRequest.organizationId) {
    await requireOrganizationPermission(ctx, refundRequest.organizationId, 'MANAGE_ORDERS', 'update');
  } else if (!currentUser.isAdmin) {
    throw new Error('Permission denied');
  }

  // Validate admin message
  validateStringLength(args.adminMessage, 'Admin message', 10, 1000);
  const sanitizedMessage = sanitizeString(args.adminMessage);

  const now = Date.now();
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;

  // Update refund request
  await ctx.db.patch(args.refundRequestId, {
    status: 'REJECTED',
    adminMessage: sanitizedMessage,
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

  // Create order log
  await ctx.runMutation(internal.orders.mutations.index.createOrderLogInternal, {
    orderId: refundRequest.orderId,
    logType: 'PAYMENT_UPDATE',
    reason: 'Refund request rejected',
    message: `Refund request rejected by ${actorName}`,
    userMessage: sanitizedMessage,
    previousValue: 'PENDING',
    newValue: 'REJECTED',
    isPublic: true,
  });

  // Schedule email to customer (mutations can't call actions directly)
  await ctx.scheduler.runAfter(0, internal.refundRequests.actions.index.sendRefundRequestEmail, {
    refundRequestId: args.refundRequestId,
    type: 'REJECTED',
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
    'reject_refund_request',
    'DATA_CHANGE',
    'MEDIUM',
    `Refund request rejected for order ${refundRequest.orderInfo.orderNumber ?? String(refundRequest.orderId)}`,
    currentUser._id,
    refundRequest.organizationId,
    { refundRequestId: args.refundRequestId }
  );

  return args.refundRequestId;
};
