import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Revert a payout invoice status from PAID back to PENDING.
 * Only super-admins can do this.
 * Clears payment information and adds to status history.
 */
export const revertPayoutStatusArgs = {
  invoiceId: v.id('payoutInvoices'),
  reason: v.string(), // Required reason for reverting
  revertedByUserId: v.id('users'),
};

export const revertPayoutStatusHandler = async (
  ctx: MutationCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
    reason: string;
    revertedByUserId: Id<'users'>;
  }
) => {
  const now = Date.now();

  // Validate reason is not empty
  if (!args.reason.trim()) {
    throw new Error('Reason is required for reverting a payment');
  }

  // Get the invoice
  const invoice = await ctx.db.get(args.invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status !== 'PAID') {
    throw new Error('Only PAID invoices can be reverted to PENDING');
  }

  // Get the super-admin user info
  const user = await ctx.db.get(args.revertedByUserId);
  if (!user) {
    throw new Error('User not found');
  }

  // Update the invoice - clear payment fields and revert status
  await ctx.db.patch(args.invoiceId, {
    status: 'PENDING',
    paidAt: undefined,
    paidById: undefined,
    paidByInfo: undefined,
    paymentReference: undefined,
    paymentNotes: undefined,
    paymentEmailSentAt: undefined,
    statusHistory: [
      ...invoice.statusHistory,
      {
        status: 'PENDING',
        changedBy: args.revertedByUserId,
        changedByName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        reason: args.reason.trim(),
        changedAt: now,
      },
    ],
    updatedAt: now,
  });

  return {
    success: true,
    invoiceId: args.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    organizationName: invoice.organizationInfo.name,
    previousStatus: 'PAID',
    newStatus: 'PENDING',
  };
};
