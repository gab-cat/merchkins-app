import { query, internalQuery } from '../../_generated/server';

import { getOrdersArgs, getOrdersHandler } from './getOrders';
import { getOrdersPageArgs, getOrdersPageHandler } from './getOrdersPage';
import { getOrderByIdArgs, getOrderByIdHandler } from './getOrderById';
import { getOrderAnalyticsArgs, getOrderAnalyticsHandler } from './getOrderAnalytics';
import { searchOrdersArgs, searchOrdersHandler } from './searchOrders';
import { getDashboardAnalyticsArgs, getDashboardAnalyticsHandler } from './getDashboardAnalytics';
import { getOrderLogsArgs, getOrderLogsHandler } from './getOrderLogs';
import { getOrdersByCheckoutSessionArgs, getOrdersByCheckoutSessionHandler } from './getOrdersByCheckoutSession';

export const getOrders = query({
  args: getOrdersArgs,
  handler: getOrdersHandler,
});

export const getOrdersPage = query({
  args: getOrdersPageArgs,
  handler: getOrdersPageHandler,
});

export const getOrderById = query({
  args: getOrderByIdArgs,
  handler: getOrderByIdHandler,
});

// Internal version for use by actions (no auth required)
export const getOrderByIdInternal = internalQuery({
  args: getOrderByIdArgs,
  handler: getOrderByIdHandler,
});

export const getOrderAnalytics = query({
  args: getOrderAnalyticsArgs,
  handler: getOrderAnalyticsHandler,
});

export const searchOrders = query({
  args: searchOrdersArgs,
  handler: searchOrdersHandler,
});

export const getDashboardAnalytics = query({
  args: getDashboardAnalyticsArgs,
  handler: getDashboardAnalyticsHandler,
});

export const getOrderLogs = query({
  args: getOrderLogsArgs,
  handler: getOrderLogsHandler,
});

export const getOrdersByCheckoutSession = query({
  args: getOrdersByCheckoutSessionArgs,
  handler: getOrdersByCheckoutSessionHandler,
});
