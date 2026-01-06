import { query } from '../../_generated/server';

import { getPaymentByIdArgs, getPaymentByIdHandler } from './getPaymentById';
import { getPaymentsArgs, getPaymentsHandler } from './getPayments';
import { searchPaymentsArgs, searchPaymentsHandler } from './searchPayments';
import { getPaymentAnalyticsArgs, getPaymentAnalyticsHandler } from './getPaymentAnalytics';
import { getOrderPaymentPublicArgs, getOrderPaymentPublicHandler, getOrderPaymentPublicReturns } from './getOrderPaymentPublic';

export const getPaymentById = query({
  args: getPaymentByIdArgs,
  handler: getPaymentByIdHandler,
});

export const getPayments = query({
  args: getPaymentsArgs,
  handler: getPaymentsHandler,
});

export const searchPayments = query({
  args: searchPaymentsArgs,
  handler: searchPaymentsHandler,
});

export const getPaymentAnalytics = query({
  args: getPaymentAnalyticsArgs,
  handler: getPaymentAnalyticsHandler,
});

// Public query for order payment metadata (no auth required)
export const getOrderPaymentPublic = query({
  args: getOrderPaymentPublicArgs,
  returns: getOrderPaymentPublicReturns,
  handler: getOrderPaymentPublicHandler,
});
