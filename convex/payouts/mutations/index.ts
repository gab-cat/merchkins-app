import { mutation, internalMutation } from '../../_generated/server';

import { generatePayoutInvoicesArgs, generatePayoutInvoicesHandler } from './generatePayoutInvoices';
import { markInvoicePaidArgs, markInvoicePaidHandler } from './markInvoicePaid';
import { revertPayoutStatusArgs, revertPayoutStatusHandler } from './revertPayoutStatus';
import { updateOrgPlatformFeeArgs, updateOrgPlatformFeeHandler } from './updateOrgPlatformFee';
import { updatePayoutSettingsArgs, updatePayoutSettingsHandler } from './updatePayoutSettings';
import { updateOrgBankDetailsArgs, updateOrgBankDetailsHandler } from './updateOrgBankDetails';
import { updateInvoiceEmailSentArgs, updateInvoiceEmailSentHandler } from './updateInvoiceEmailSent';
import { updateInvoicePdfUrlArgs, updateInvoicePdfUrlHandler } from './updateInvoicePdfUrl';

// Internal mutations
export const generatePayoutInvoices = internalMutation({
  args: generatePayoutInvoicesArgs,
  handler: generatePayoutInvoicesHandler,
});

export const updateInvoiceEmailSent = internalMutation({
  args: updateInvoiceEmailSentArgs,
  handler: updateInvoiceEmailSentHandler,
});

export const updateInvoicePdfUrl = internalMutation({
  args: updateInvoicePdfUrlArgs,
  handler: updateInvoicePdfUrlHandler,
});

// Public mutations (require authentication in frontend)
export const markInvoicePaid = mutation({
  args: markInvoicePaidArgs,
  handler: markInvoicePaidHandler,
});

export const revertPayoutStatus = mutation({
  args: revertPayoutStatusArgs,
  handler: revertPayoutStatusHandler,
});

export const updateOrgPlatformFee = mutation({
  args: updateOrgPlatformFeeArgs,
  handler: updateOrgPlatformFeeHandler,
});

export const updatePayoutSettings = mutation({
  args: updatePayoutSettingsArgs,
  handler: updatePayoutSettingsHandler,
});

export const updateOrgBankDetails = mutation({
  args: updateOrgBankDetailsArgs,
  handler: updateOrgBankDetailsHandler,
});
