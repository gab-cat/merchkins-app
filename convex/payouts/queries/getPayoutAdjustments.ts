import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getPayoutAdjustmentsArgs = {
  organizationId: v.id('organizations'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('APPLIED'))),
  limit: v.optional(v.number()),
};

export const getPayoutAdjustmentsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<'organizations'>;
    status?: 'PENDING' | 'APPLIED';
    limit?: number;
  }
) => {
  let query;

  // Use the most selective index based on provided filters
  if (args.status) {
    query = ctx.db
      .query('payoutAdjustments')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', args.organizationId).eq('status', args.status as 'PENDING' | 'APPLIED'));
  } else {
    query = ctx.db.query('payoutAdjustments').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId));
  }

  const adjustments = await query.collect();

  // Sort by createdAt descending (most recent first)
  adjustments.sort((a, b) => b.createdAt - a.createdAt);

  // Apply limit if provided
  const limit = args.limit || 100;
  const limited = adjustments.slice(0, limit);

  // Enrich with order and invoice details
  const enriched = await Promise.all(
    limited.map(async (adjustment) => {
      const order = adjustment.orderId ? await ctx.db.get(adjustment.orderId) : null;
      const originalInvoice = await ctx.db.get(adjustment.originalInvoiceId);
      const appliedInvoice = adjustment.adjustmentInvoiceId ? await ctx.db.get(adjustment.adjustmentInvoiceId) : null;

      return {
        ...adjustment,
        order: order
          ? {
              orderNumber: order.orderNumber || `ORD-${order._id.slice(-8)}`,
              customerName: `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() || order.customerInfo.email,
            }
          : null,
        originalInvoice: originalInvoice
          ? {
              invoiceNumber: originalInvoice.invoiceNumber,
            }
          : null,
        appliedInvoice: appliedInvoice
          ? {
              invoiceNumber: appliedInvoice.invoiceNumber,
            }
          : null,
      };
    })
  );

  return {
    adjustments: enriched,
    total: adjustments.length,
    limit,
    hasMore: adjustments.length > limit,
  };
};
