import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAdmin } from '../../helpers/auth';

/**
 * Mark a payout invoice as paid.
 * Only super-admins can do this.
 * Triggers email notification to organization admins.
 */
export const markInvoicePaidArgs = {
  invoiceId: v.id('payoutInvoices'),
  paymentReference: v.optional(v.string()),
  paymentNotes: v.optional(v.string()),
  // Super-admin user info (passed from client after auth)
  paidByUserId: v.id('users'),
};

export const markInvoicePaidHandler = async (
  ctx: MutationCtx,
  args: {
    invoiceId: Id<'payoutInvoices'>;
    paymentReference?: string;
    paymentNotes?: string;
    paidByUserId: Id<'users'>;
  }
) => {
  const now = Date.now();

  // Require authenticated admin user
  const authenticatedUser = await requireAdmin(ctx);

  // Verify that the paidByUserId matches the authenticated user
  if (authenticatedUser._id !== args.paidByUserId) {
    throw new Error('Access denied: paidByUserId must match authenticated user');
  }

  // Get the invoice
  const invoice = await ctx.db.get(args.invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'PAID') {
    throw new Error('Invoice is already marked as paid');
  }

  if (invoice.status === 'CANCELLED') {
    throw new Error('Cannot mark a cancelled invoice as paid');
  }

  // Use the authenticated user (already verified as admin)
  const user = authenticatedUser;

  // Update the invoice
  await ctx.db.patch(args.invoiceId, {
    status: 'PAID',
    paidAt: now,
    paidById: args.paidByUserId,
    paidByInfo: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    paymentReference: args.paymentReference,
    paymentNotes: args.paymentNotes,
    statusHistory: [
      ...invoice.statusHistory,
      {
        status: 'PAID',
        changedBy: args.paidByUserId,
        changedByName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        reason: args.paymentNotes || 'Marked as paid by super-admin',
        changedAt: now,
      },
    ],
    updatedAt: now,
  });

  // Get organization admins for email notification
  const orgAdmins = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organization_role', (q) => q.eq('organizationId', invoice.organizationId).eq('role', 'ADMIN'))
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  return {
    success: true,
    invoiceId: args.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    netAmount: invoice.netAmount,
    organizationName: invoice.organizationInfo.name,
    adminEmails: orgAdmins.map((admin) => admin.userInfo.email),
  };
};
