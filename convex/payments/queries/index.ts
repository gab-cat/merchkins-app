import { query } from "../../_generated/server";

import { getPaymentByIdArgs, getPaymentByIdHandler } from "./getPaymentById";
import { getPaymentsArgs, getPaymentsHandler } from "./getPayments";
import { searchPaymentsArgs, searchPaymentsHandler } from "./searchPayments";
import { getPaymentAnalyticsArgs, getPaymentAnalyticsHandler } from "./getPaymentAnalytics";

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


