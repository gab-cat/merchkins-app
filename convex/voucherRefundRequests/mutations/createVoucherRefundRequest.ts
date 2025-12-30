import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, validatePositiveFiniteNumber, validateMonetaryRefundEligibility } from '../../helpers';

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

  // Validate 14-day eligibility using helper function
  const eligibility = validateMonetaryRefundEligibility(
    voucher.cancellationInitiator,
    voucher.monetaryRefundEligibleAt,
    voucher.usedCount,
    voucher.createdAt
  );

  if (!eligibility.isEligible) {
    throw new Error(eligibility.error || 'This voucher is not eligible for monetary refund');
  }

  const now = Date.now();

  // Check if refund request already exists using the by_voucher_status index for efficiency
  const existingRequest = await ctx.db
    .query('voucherRefundRequests')
    .withIndex('by_voucher_status', (q) => q.eq('voucherId', args.voucherId).eq('status', 'PENDING'))
    .filter((q) => q.eq(q.field('isDeleted'), false))
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
  let sourceOrderInfo:
    | {
        orderId: Id<'orders'>;
        orderNumber?: string;
        totalAmount: number;
      }
    | undefined;

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
  // Note: We wrap this in try-catch to handle potential race conditions
  let requestId: Id<'voucherRefundRequests'>;
  try {
    requestId = await ctx.db.insert('voucherRefundRequests', {
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

    // Post-insert verification: Check if we created a duplicate due to race condition
    // This ensures atomicity even if two concurrent requests both passed the initial check
    const allPendingRequests = await ctx.db
      .query('voucherRefundRequests')
      .withIndex('by_voucher_status', (q) => q.eq('voucherId', args.voucherId).eq('status', 'PENDING'))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    // If there are multiple pending requests, we have a race condition
    if (allPendingRequests.length > 1) {
      // Find our request (the one we just created)
      const ourRequest = allPendingRequests.find((r) => r._id === requestId);

      if (!ourRequest) {
        // Our request was already deleted by another concurrent request
        throw new Error('A pending monetary refund request already exists for this voucher');
      }

      // Find the first request (earliest createdAt, or earliest _id as tiebreaker)
      const firstRequest = allPendingRequests.reduce((earliest, current) => {
        if (current.createdAt < earliest.createdAt) {
          return current;
        }
        if (current.createdAt === earliest.createdAt) {
          // Use _id as tiebreaker for requests created at the exact same timestamp
          return current._id < earliest._id ? current : earliest;
        }
        return earliest;
      });

      // If we're not the first one, delete our duplicate and throw error
      if (ourRequest._id !== firstRequest._id) {
        await ctx.db.patch(requestId, {
          isDeleted: true,
          updatedAt: Date.now(),
        });
        throw new Error('A pending monetary refund request already exists for this voucher');
      }
      // If we are the first one, continue - the other concurrent request will delete itself
    }
  } catch (error) {
    // Re-throw if it's our duplicate detection error
    if (error instanceof Error && error.message.includes('A pending monetary refund request already exists')) {
      throw error;
    }
    // For any other error during insert, re-throw
    throw error;
  }

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
