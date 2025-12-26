import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateStringLength, sanitizeString, logAction, validatePositiveFiniteNumber } from '../../helpers';

export const createVoucherRefundRequestArgs = {
  voucherId: v.id('vouchers'),
} as const;

export const createVoucherRefundRequestHandler = async (
  ctx: MutationCtx,
  args: {
    voucherId: Id<'vouchers'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Get voucher
  const voucher = await ctx.db.get(args.voucherId);
  if (!voucher || voucher.isDeleted) {
    throw new Error('Voucher not found');
  }

  // Validate voucher belongs to current user
  if (voucher.assignedToUserId !== currentUser._id) {
    throw new Error('You can only request refunds for your own vouchers');
  }

  // Validate voucher is REFUND type
  if (voucher.discountType !== 'REFUND') {
    throw new Error('Only refund vouchers are eligible for monetary refund requests');
  }

  // Validate cancellation initiator is SELLER
  if (voucher.cancellationInitiator !== 'SELLER') {
    throw new Error('Only vouchers from seller-initiated cancellations are eligible for monetary refunds');
  }

  // Validate voucher hasn't been used
  if (voucher.usedCount > 0) {
    throw new Error('Cannot request monetary refund for a voucher that has already been used');
  }

  // Validate 14 days have passed since voucher creation
  if (!voucher.monetaryRefundEligibleAt) {
    throw new Error('This voucher is not eligible for monetary refund');
  }

  const now = Date.now();
  if (now < voucher.monetaryRefundEligibleAt) {
    const daysRemaining = Math.ceil((voucher.monetaryRefundEligibleAt - now) / (24 * 60 * 60 * 1000));
    throw new Error(`Monetary refund will be available in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`);
  }

  // Check if refund request already exists
  const existingRequest = await ctx.db
    .query('voucherRefundRequests')
    .withIndex('by_voucher', (q) => q.eq('voucherId', args.voucherId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .filter((q) => q.eq(q.field('status'), 'PENDING'))
    .first();

  if (existingRequest) {
    throw new Error('A pending monetary refund request already exists for this voucher');
  }

  // Get customer info
  const customer = await ctx.db.get(currentUser._id);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // Get order info if available
  let sourceOrderInfo: {
    orderId: Id<'orders'>;
    orderNumber?: string;
    totalAmount: number;
  } | undefined;

  if (voucher.sourceOrderId) {
    const order = await ctx.db.get(voucher.sourceOrderId);
    if (order) {
      sourceOrderInfo = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      };
    }
  }

  // Validate requestedAmount is a positive finite number
  const requestedAmount = voucher.discountValue;
  validatePositiveFiniteNumber(requestedAmount, 'Requested amount');

  // Create voucher refund request
  const requestId = await ctx.db.insert('voucherRefundRequests', {
    isDeleted: false,
    voucherId: args.voucherId,
    requestedById: currentUser._id,
    status: 'PENDING',
    requestedAmount,
    adminMessage: undefined,
    reviewedById: undefined,
    reviewedAt: undefined,
    voucherInfo: {
      code: voucher.code,
      name: voucher.name,
      discountValue: voucher.discountValue,
      cancellationInitiator: voucher.cancellationInitiator,
      createdAt: voucher.createdAt,
      monetaryRefundEligibleAt: voucher.monetaryRefundEligibleAt,
    },
    customerInfo: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      imageUrl: customer.imageUrl,
    },
    sourceOrderInfo,
    reviewerInfo: undefined,
    createdAt: now,
    updatedAt: now,
  });

  // Update voucher to mark refund as requested
  await ctx.db.patch(args.voucherId, {
    monetaryRefundRequestedAt: now,
    updatedAt: now,
  });

  await logAction(
    ctx,
    'create_voucher_refund_request',
    'DATA_CHANGE',
    'MEDIUM',
    `Voucher refund request created for voucher ${voucher.code}`,
    currentUser._id,
    undefined,
    { voucherRefundRequestId: requestId, voucherId: args.voucherId }
  );

  return requestId;
};

