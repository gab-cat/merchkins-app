import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, validateStringLength, sanitizeString, logAction } from '../../helpers';
import { internal } from '../../_generated/api';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';
import { refundReasonValues } from '../../models/refundRequests';

export const createRefundRequestArgs = {
  orderId: v.id('orders'),
  reason: refundReasonValues,
  customerMessage: v.optional(v.string()),
} as const;

export const createRefundRequestHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    reason:
      | 'WRONG_SIZE'
      | 'WRONG_ITEM'
      | 'WRONG_PAYMENT'
      | 'DEFECTIVE_ITEM'
      | 'NOT_AS_DESCRIBED'
      | 'CHANGED_MIND'
      | 'DUPLICATE_ORDER'
      | 'DELIVERY_ISSUE'
      | 'OTHER';
    customerMessage?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  // Validate customer owns the order
  if (order.customerId !== currentUser._id) {
    throw new Error('You can only request refunds for your own orders');
  }

  // Validate order status
  if (order.status === 'DELIVERED') {
    throw new Error('Cannot request refund for delivered orders');
  }
  if (order.status === 'CANCELLED') {
    throw new Error('Order is already cancelled');
  }

  // Validate payment status - must be PAID
  if (order.paymentStatus !== 'PAID') {
    throw new Error('Refund requests are only available for paid orders. Unpaid orders can be cancelled directly.');
  }

  // Validate 24-hour window from payment
  const payment = await ctx.db
    .query('payments')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .filter((q) => q.eq(q.field('paymentStatus'), 'VERIFIED'))
    .order('desc')
    .first();

  if (!payment) {
    throw new Error('Payment record not found');
  }

  const paymentDate = payment.paymentDate || payment.createdAt;
  const hoursSincePayment = (Date.now() - paymentDate) / (1000 * 60 * 60);

  if (hoursSincePayment > 24) {
    throw new Error('Refund requests must be submitted within 24 hours of payment');
  }

  // Check if refund request already exists
  const existingRequest = await ctx.db
    .query('refundRequests')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .filter((q) => q.eq(q.field('status'), 'PENDING'))
    .first();

  if (existingRequest) {
    throw new Error('A pending refund request already exists for this order');
  }

  // Validate and sanitize optional message
  let sanitizedMessage: string | undefined;
  if (args.customerMessage && args.customerMessage.trim()) {
    validateStringLength(args.customerMessage, 'Customer message', 0, 2000);
    sanitizedMessage = sanitizeString(args.customerMessage);
  }

  // Get organization info
  if (!order.organizationId) {
    throw new Error('Order must belong to an organization');
  }

  const organization = await ctx.db.get(order.organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  const now = Date.now();

  // Create refund request
  const refundRequestId = await ctx.db.insert('refundRequests', {
    isDeleted: false,
    orderId: args.orderId,
    requestedById: currentUser._id,
    organizationId: order.organizationId,
    status: 'PENDING',
    reason: args.reason,
    customerMessage: sanitizedMessage,
    refundAmount: order.totalAmount,
    orderInfo: {
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
    },
    customerInfo: {
      firstName: order.customerInfo.firstName,
      lastName: order.customerInfo.lastName,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      imageUrl: order.customerInfo.imageUrl,
    },
    organizationInfo: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      logoUrl: organization.logoUrl,
    },
    createdAt: now,
    updatedAt: now,
  });

  // Create in-app notification for org admins
  await ctx.runMutation(internal.refundRequests.mutations.index.createRefundNotification, {
    refundRequestId,
    organizationId: order.organizationId,
    orderNumber: order.orderNumber,
    customerName: `${order.customerInfo.firstName ?? ''} ${order.customerInfo.lastName ?? ''}`.trim() || order.customerInfo.email,
  });

  // Create order log
  await createSystemOrderLog(ctx, {
    orderId: args.orderId,
    logType: 'PAYMENT_UPDATE',
    reason: 'Refund request submitted',
    message: 'Customer submitted a refund request',
    userMessage: sanitizedMessage,
    previousValue: order.paymentStatus,
    newValue: order.paymentStatus, // Payment status remains PAID until refund is approved
    isPublic: true,
    actorId: currentUser._id,
  });

  // Schedule email notification to org admins (mutations can't call actions directly)
  await ctx.scheduler.runAfter(0, internal.refundRequests.actions.index.sendRefundRequestEmail, {
    refundRequestId,
    type: 'REQUEST_RECEIVED',
  });

  await logAction(
    ctx,
    'create_refund_request',
    'DATA_CHANGE',
    'MEDIUM',
    `Refund request created for order ${order.orderNumber ?? String(args.orderId)}`,
    currentUser._id,
    order.organizationId,
    { refundRequestId, orderId: args.orderId }
  );

  return refundRequestId;
};
