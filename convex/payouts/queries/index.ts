import { query } from '../../_generated/server';

import { getPayoutInvoicesArgs, getPayoutInvoicesHandler } from './getPayoutInvoices';
import { getPayoutInvoiceByIdArgs, getPayoutInvoiceByIdHandler } from './getPayoutInvoiceById';
import { getAuthorizedPayoutInvoiceArgs, getAuthorizedPayoutInvoiceHandler } from './getAuthorizedPayoutInvoice';
import { getPayoutSummaryArgs, getPayoutSummaryHandler } from './getPayoutSummary';
import { getPayoutSettingsArgs, getPayoutSettingsHandler } from './getPayoutSettings';

export const getPayoutInvoices = query({
  args: getPayoutInvoicesArgs,
  handler: getPayoutInvoicesHandler,
});

export const getPayoutInvoiceById = query({
  args: getPayoutInvoiceByIdArgs,
  handler: getPayoutInvoiceByIdHandler,
});

export const getAuthorizedPayoutInvoice = query({
  args: getAuthorizedPayoutInvoiceArgs,
  handler: getAuthorizedPayoutInvoiceHandler,
});

export const getPayoutSummary = query({
  args: getPayoutSummaryArgs,
  handler: getPayoutSummaryHandler,
});

export const getPayoutSettings = query({
  args: getPayoutSettingsArgs,
  handler: getPayoutSettingsHandler,
});
