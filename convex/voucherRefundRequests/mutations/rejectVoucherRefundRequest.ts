import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateStringLength, sanitizeString, logAction, validatePositiveFiniteNumber } from '../../helpers';

export const rejectVoucherRefundRequestArgs = {
  voucherRefundRequestId: v.id('voucherRefundRequests'),
  adminMessage: v.string(),
} as const;

export const rejectVoucherRefundRequestHandler = async (
  ctx: MutationCtx,
  args: {
    voucherRefundRequestId: Id<'voucherRefundRequests'>;
    adminMessage: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Only super-admin can reject voucher refund requests
  if (!currentUser.isAdmin) {
    throw new Error('Permission denied. Only super-admins can reject voucher refund requests.');
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
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;

  // Update voucher refund request
  await ctx.db.patch(args.voucherRefundRequestId, {
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

  // Reset voucher monetaryRefundRequestedAt to allow future requests
  await ctx.db.patch(request.voucherId, {
    monetaryRefundRequestedAt: undefined,
    updatedAt: now,
  });

  await logAction(
    ctx,
    'reject_voucher_refund_request',
    'DATA_CHANGE',
    'MEDIUM',
    `Voucher refund request rejected for voucher ${request.voucherInfo.code}`,
    currentUser._id,
    undefined,
    { voucherRefundRequestId: args.voucherRefundRequestId, voucherId: request.voucherId }
  );

  return args.voucherRefundRequestId;
};

