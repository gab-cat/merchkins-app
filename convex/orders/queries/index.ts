import { query } from '../../_generated/server';

import { getOrdersArgs, getOrdersHandler } from './getOrders';
import { getOrdersPageArgs, getOrdersPageHandler } from './getOrdersPage';
import { getOrderByIdArgs, getOrderByIdHandler } from './getOrderById';
import { getOrderAnalyticsArgs, getOrderAnalyticsHandler } from './getOrderAnalytics';
import { searchOrdersArgs, searchOrdersHandler } from './searchOrders';

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

export const getOrderAnalytics = query({
  args: getOrderAnalyticsArgs,
  handler: getOrderAnalyticsHandler,
});

export const searchOrders = query({
  args: searchOrdersArgs,
  handler: searchOrdersHandler,
});
