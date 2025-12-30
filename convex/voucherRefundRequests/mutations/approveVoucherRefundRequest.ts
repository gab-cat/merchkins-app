import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateStringLength, sanitizeString, logAction, validatePositiveFiniteNumber } from '../../helpers';

export const approveVoucherRefundRequestArgs = {
  voucherRefundRequestId: v.id('voucherRefundRequests'),
  adminMessage: v.string(),
} as const;

export const approveVoucherRefundRequestHandler = async (
  ctx: MutationCtx,
  args: {
    voucherRefundRequestId: Id<'voucherRefundRequests'>;
    adminMessage: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Only super-admin can approve voucher refund requests
  if (!currentUser.isAdmin) {
    throw new Error('Permission denied. Only super-admins can approve voucher refund requests.');
  }

  const request = await ctx.db.get(args.voucherRefundRequestId);
  if (!request || request.isDeleted) {
    throw new Error('Voucher refund request not found');
  }

  if (request.status !== 'PENDING') {
    throw new Error(`Voucher refund request is already ${request.status.toLowerCase()}`);
  }

  // Validate requestedAmount is a positive finite number (defensive check for data integrity)
  validatePositiveFiniteNumber(request.requestedAmount, 'Requested amount');

  // Validate admin message
  validateStringLength(args.adminMessage, 'Admin message', 10, 1000);
  const sanitizedMessage = sanitizeString(args.adminMessage);

  const now = Date.now();

  // Get voucher
  const voucher = await ctx.db.get(request.voucherId);
  if (!voucher || voucher.isDeleted) {
    throw new Error('Voucher not found');
  }

  // Validate voucher hasn't been used
  if (voucher.usedCount > 0) {
    throw new Error('Cannot approve monetary refund for a voucher that has already been used');
  }

  // Update voucher refund request
  await ctx.db.patch(args.voucherRefundRequestId, {
    status: 'APPROVED',
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

  // Mark voucher as inactive (refunded)
  await ctx.db.patch(request.voucherId, {
    isActive: false,
    updatedAt: now,
  });

  // TODO: Process actual monetary refund (reverse payment)
  // This would involve:
  // 1. Finding the original payment
  // 2. Processing refund through payment gateway
  // 3. Updating payment records
  // For now, we just mark the voucher as refunded

  await logAction(
    ctx,
    'approve_voucher_refund_request',
    'DATA_CHANGE',
    'HIGH',
    `Voucher refund request approved for voucher ${request.voucherInfo.code}`,
    currentUser._id,
    undefined,
    { voucherRefundRequestId: args.voucherRefundRequestId, voucherId: request.voucherId }
  );

  return args.voucherRefundRequestId;
};
