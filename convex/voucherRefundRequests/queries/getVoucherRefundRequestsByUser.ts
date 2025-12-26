import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getVoucherRefundRequestsByUserArgs = {
  userId: v.id('users'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPROVED'), v.literal('REJECTED'))),
};

export const voucherRefundRequestValidator = v.object({
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
});

export const getVoucherRefundRequestsByUserReturns = v.array(voucherRefundRequestValidator);

export const getVoucherRefundRequestsByUserHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }
) => {
  let dbQuery = ctx.db
    .query('voucherRefundRequests')
    .withIndex('by_requestedBy', (q) => q.eq('requestedById', args.userId))
    .filter((q) => q.eq(q.field('isDeleted'), false));

  if (args.status) {
    dbQuery = dbQuery.filter((q) => q.eq(q.field('status'), args.status));
  }

  const requests = await dbQuery.order('desc').collect();

  return requests;
};
