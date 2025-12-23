import { QueryCtx } from '../../_generated/server';
import { ConvexError, v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers/auth';
import { isOrganizationMember } from '../../helpers/organizations';

export const getAuthorizedPayoutInvoiceArgs = {
  invoiceId: v.id('payoutInvoices'),
};

/**
 * Get payout invoice by ID with authorization check.
 * User must be:
 * - A member/admin of the invoice's organization, OR
 * - A super-admin (isAdmin === true)
 */
export const getAuthorizedPayoutInvoiceHandler = async (
  ctx: QueryCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
  }
) => {
  // Require authentication
  const user = await requireAuthentication(ctx);

  // Get the invoice
  const invoice = await ctx.db.get(args.invoiceId);

  if (!invoice) {
    return null;
  }

  // Super-admins can access any invoice
  if (user.isAdmin) {
    // Get the organization for additional details
    const organization = await ctx.db.get(invoice.organizationId);

    return {
      ...invoice,
      organization,
    };
  }

  // Check if user is a member of the invoice's organization
  const isMember = await isOrganizationMember(ctx, user._id, invoice.organizationId);

  if (!isMember) {
    // User is not authorized to view this invoice
    throw new ConvexError('Access denied: not authorized to view this invoice');
  }

  // Get the organization for additional details
  const organization = await ctx.db.get(invoice.organizationId);

  return {
    ...invoice,
    organization,
  };
};








