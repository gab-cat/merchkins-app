import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Update invoice email sent timestamp (internal use)
 */
export const updateInvoiceEmailSentArgs = {
  invoiceId: v.id('payoutInvoices'),
  type: v.union(v.literal('invoice'), v.literal('payment')),
};

export const updateInvoiceEmailSentHandler = async (
  ctx: MutationCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
    type: 'invoice' | 'payment';
  }
) => {
  const now = Date.now();
  const invoice = await ctx.db.get(args.invoiceId);

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (args.type === 'invoice') {
    await ctx.db.patch(args.invoiceId, {
      invoiceEmailSentAt: now,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(args.invoiceId, {
      paymentEmailSentAt: now,
      updatedAt: now,
    });
  }

  return { success: true };
};
