import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Update organization bank details for payouts.
 * Can be done by org admins or super-admins.
 */
export const updateOrgBankDetailsArgs = {
  organizationId: v.id('organizations'),
  bankName: v.string(),
  accountName: v.string(),
  accountNumber: v.string(),
  bankCode: v.optional(v.string()),
  notificationEmail: v.optional(v.string()),
};

export const updateOrgBankDetailsHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    bankName: string;
    accountName: string;
    accountNumber: string;
    bankCode?: string;
    notificationEmail?: string;
  }
) => {
  const now = Date.now();

  // Get the organization
  const org = await ctx.db.get(args.organizationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // Update the organization's bank details
  await ctx.db.patch(args.organizationId, {
    payoutBankDetails: {
      bankName: args.bankName,
      accountName: args.accountName,
      accountNumber: args.accountNumber,
      bankCode: args.bankCode,
      notificationEmail: args.notificationEmail?.trim() || undefined,
    },
    updatedAt: now,
  });

  return {
    success: true,
    organizationId: args.organizationId,
    organizationName: org.name,
  };
};
