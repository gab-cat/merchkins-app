import { query, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getVoucherRefundRequestByIdArgs = v.object({
  voucherRefundRequestId: v.id('voucherRefundRequests'),
});

export const getVoucherRefundRequestByIdReturns = v.union(
  v.object({
    _id: v.id('voucherRefundRequests'),
    _creationTime: v.number(),
    isDeleted: v.boolean(),
    voucherId: v.id('vouchers'),
    requestedById: v.id('users'),
    status: v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED')),
    requestedAmount: v.number(),
    adminMessage: v.optional(v.string()),
    reviewedById: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    voucherInfo: v.object({
      code: v.string(),
      name: v.string(),
      discountValue: v.number(),
      cancellationInitiator: v.optional(v.string()),
      createdAt: v.number(),
      monetaryRefundEligibleAt: v.optional(v.number()),
    }),
    customerInfo: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      phone: v.string(),
      imageUrl: v.optional(v.string()),
    }),
    sourceOrderInfo: v.optional(
      v.object({
        orderId: v.id('orders'),
        orderNumber: v.optional(v.string()),
        totalAmount: v.number(),
      })
    ),
    reviewerInfo: v.optional(
      v.object({
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.string(),
        imageUrl: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    voucher: v.union(v.any(), v.null()),
  }),
  v.null()
);

export const getVoucherRefundRequestByIdHandler = async (
  ctx: QueryCtx,
  args: {
    voucherRefundRequestId: Id<'voucherRefundRequests'>;
  }
) => {
  const request = await ctx.db.get(args.voucherRefundRequestId);

  if (!request || request.isDeleted) {
    return null;
  }

  // Get voucher details
  const voucher = await ctx.db.get(request.voucherId);

  return {
    ...request,
    voucher,
  };
};

export default query({
  args: getVoucherRefundRequestByIdArgs,
  returns: getVoucherRefundRequestByIdReturns,
  handler: getVoucherRefundRequestByIdHandler,
});
