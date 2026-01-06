import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Public query to get payment metadata for a specific order.
 * This is used on the public order detail page to display payment information
 * without requiring admin MANAGE_PAYMENTS permission.
 *
 * Only returns the payment metadata (Paymongo webhook data) needed for display.
 */
export const getOrderPaymentPublicArgs = {
  orderId: v.id('orders'),
};

export const getOrderPaymentPublicReturns = v.union(
  v.object({
    _id: v.id('payments'),
    paymentStatus: v.string(),
    paymentProvider: v.optional(v.string()),
    metadata: v.optional(v.any()),
    paymentDate: v.optional(v.number()),
  }),
  v.null()
);

export const getOrderPaymentPublicHandler = async (
  ctx: QueryCtx,
  args: { orderId: Id<'orders'> }
): Promise<{
  _id: Id<'payments'>;
  paymentStatus: string;
  paymentProvider?: string;
  metadata?: unknown;
  paymentDate?: number;
} | null> => {
  // No authentication required - this is a public query
  // We only return limited payment info (no sensitive data)

  // First verify the order exists
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) {
    return null;
  }

  // Get the payment for this order
  const payment = await ctx.db
    .query('payments')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  if (!payment) {
    return null;
  }

  // Return only the necessary fields for public display
  return {
    _id: payment._id,
    paymentStatus: payment.paymentStatus,
    paymentProvider: payment.paymentProvider,
    metadata: payment.metadata,
    paymentDate: payment.paymentDate,
  };
};
