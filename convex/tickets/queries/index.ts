import { query, mutation } from '../../_generated/server';
import { getTicketsHandler, getTicketsArgs } from './getTickets';
import { getTicketByIdHandler, getTicketByIdArgs } from './getTicketById';
import { getTicketUpdatesHandler, getTicketUpdatesArgs } from './getTicketUpdates';
import { getTicketAnalyticsHandler, getTicketAnalyticsArgs } from './getTicketAnalytics';
import { getUnreadCountHandler, getUnreadCountArgs } from './getUnreadCount';
import { getOpenCountHandler, getOpenCountArgs } from './getOpenCount';

export const getTickets = query({
  args: getTicketsArgs,
  handler: getTicketsHandler,
});

export const getTicketById = query({
  args: getTicketByIdArgs,
  handler: getTicketByIdHandler,
});

export const getTicketUpdates = query({
  args: getTicketUpdatesArgs,
  handler: getTicketUpdatesHandler,
});

export const getTicketAnalytics = query({
  args: getTicketAnalyticsArgs,
  handler: getTicketAnalyticsHandler,
});

export const getUnreadCount = query({
  args: getUnreadCountArgs,
  handler: getUnreadCountHandler,
});

export const getOpenCount = query({
  args: getOpenCountArgs,
  handler: getOpenCountHandler,
});
