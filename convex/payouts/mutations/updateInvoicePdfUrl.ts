import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Update invoice PDF URL (internal mutation called after R2 upload)
 */
export const updateInvoicePdfUrlArgs = {
  invoiceId: v.id('payoutInvoices'),
  pdfStorageKey: v.string(),
  invoiceUrl: v.string(),
};

export const updateInvoicePdfUrlHandler = async (
  ctx: MutationCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
    pdfStorageKey: string;
    invoiceUrl: string;
  }
) => {
  const now = Date.now();

  // Get the invoice
  const invoice = await ctx.db.get(args.invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  // Update the invoice with PDF info
  await ctx.db.patch(args.invoiceId, {
    pdfStorageKey: args.pdfStorageKey,
    invoiceUrl: args.invoiceUrl,
    updatedAt: now,
  });

  return {
    success: true,
    invoiceId: args.invoiceId,
    invoiceUrl: args.invoiceUrl,
  };
};
