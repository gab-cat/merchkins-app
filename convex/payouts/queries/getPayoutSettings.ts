import { QueryCtx } from '../../_generated/server';

export const getPayoutSettingsArgs = {};

export const getPayoutSettingsHandler = async (ctx: QueryCtx) => {
  // Get the singleton settings record
  const settings = await ctx.db.query('payoutSettings').first();

  // Return default settings if none exist
  if (!settings) {
    return {
      defaultPlatformFeePercentage: 15,
      cutoffDayOfWeek: 3, // Wednesday
      payoutDayOfWeek: 5, // Friday
      sendInvoiceEmails: true,
      sendPaymentEmails: true,
      minimumPayoutAmount: 0,
      lastCronRunAt: null,
      lastCronRunStatus: null,
      lastCronRunInvoicesGenerated: null,
    };
  }

  return settings;
};
