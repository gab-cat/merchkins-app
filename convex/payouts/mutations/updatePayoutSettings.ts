import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Update payout settings (singleton record).
 * Only super-admins can do this.
 */
export const updatePayoutSettingsArgs = {
  defaultPlatformFeePercentage: v.optional(v.number()),
  cutoffDayOfWeek: v.optional(v.number()), // 0-6 (Sunday-Saturday)
  payoutDayOfWeek: v.optional(v.number()), // 0-6 (Sunday-Saturday)
  sendInvoiceEmails: v.optional(v.boolean()),
  sendPaymentEmails: v.optional(v.boolean()),
  minimumPayoutAmount: v.optional(v.number()),
  updatedByUserId: v.id('users'),
};

export const updatePayoutSettingsHandler = async (
  ctx: MutationCtx,
  args: {
    defaultPlatformFeePercentage?: number;
    cutoffDayOfWeek?: number;
    payoutDayOfWeek?: number;
    sendInvoiceEmails?: boolean;
    sendPaymentEmails?: boolean;
    minimumPayoutAmount?: number;
    updatedByUserId: Id<'users'>;
  }
) => {
  const now = Date.now();

  // Validate percentage if provided
  if (args.defaultPlatformFeePercentage !== undefined && (args.defaultPlatformFeePercentage < 0 || args.defaultPlatformFeePercentage > 100)) {
    throw new Error('Default platform fee percentage must be between 0 and 100');
  }

  // Validate day of week values
  if (args.cutoffDayOfWeek !== undefined && (args.cutoffDayOfWeek < 0 || args.cutoffDayOfWeek > 6)) {
    throw new Error('Cut-off day must be between 0 (Sunday) and 6 (Saturday)');
  }

  if (args.payoutDayOfWeek !== undefined && (args.payoutDayOfWeek < 0 || args.payoutDayOfWeek > 6)) {
    throw new Error('Payout day must be between 0 (Sunday) and 6 (Saturday)');
  }

  // Get existing settings
  const existingSettings = await ctx.db.query('payoutSettings').first();

  if (existingSettings) {
    // Update existing settings
    await ctx.db.patch(existingSettings._id, {
      ...(args.defaultPlatformFeePercentage !== undefined && {
        defaultPlatformFeePercentage: args.defaultPlatformFeePercentage,
      }),
      ...(args.cutoffDayOfWeek !== undefined && {
        cutoffDayOfWeek: args.cutoffDayOfWeek,
      }),
      ...(args.payoutDayOfWeek !== undefined && {
        payoutDayOfWeek: args.payoutDayOfWeek,
      }),
      ...(args.sendInvoiceEmails !== undefined && {
        sendInvoiceEmails: args.sendInvoiceEmails,
      }),
      ...(args.sendPaymentEmails !== undefined && {
        sendPaymentEmails: args.sendPaymentEmails,
      }),
      ...(args.minimumPayoutAmount !== undefined && {
        minimumPayoutAmount: args.minimumPayoutAmount,
      }),
      updatedAt: now,
      updatedById: args.updatedByUserId,
    });

    return {
      success: true,
      settingsId: existingSettings._id,
      isNew: false,
    };
  } else {
    // Create new settings record
    const settingsId = await ctx.db.insert('payoutSettings', {
      defaultPlatformFeePercentage: args.defaultPlatformFeePercentage ?? 15,
      cutoffDayOfWeek: args.cutoffDayOfWeek ?? 3, // Wednesday
      payoutDayOfWeek: args.payoutDayOfWeek ?? 5, // Friday
      sendInvoiceEmails: args.sendInvoiceEmails ?? true,
      sendPaymentEmails: args.sendPaymentEmails ?? true,
      minimumPayoutAmount: args.minimumPayoutAmount ?? 0,
      updatedAt: now,
      updatedById: args.updatedByUserId,
    });

    return {
      success: true,
      settingsId,
      isNew: true,
    };
  }
};
