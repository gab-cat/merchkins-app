import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getPayoutInvoiceByIdArgs = {
  invoiceId: v.id('payoutInvoices'),
};

export const getPayoutInvoiceByIdHandler = async (
  ctx: QueryCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
  }
) => {
  const invoice = await ctx.db.get(args.invoiceId);

  if (!invoice) {
    return null;
  }

  // Get the organization for additional details
  const organization = await ctx.db.get(invoice.organizationId);

  return {
    ...invoice,
    organization,
  };
};
