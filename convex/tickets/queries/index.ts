import { query } from '../../_generated/server';

import { getTicketByIdArgs, getTicketByIdHandler } from './getTicketById';
import { getTicketsArgs, getTicketsHandler } from './getTickets';
import { getTicketsPageArgs, getTicketsPageHandler } from './getTicketsPage';
import { searchTicketsArgs, searchTicketsHandler } from './searchTickets';
import { getTicketAnalyticsArgs, getTicketAnalyticsHandler } from './getTicketAnalytics';
import { getTicketUpdatesArgs, getTicketUpdatesHandler } from './getTicketUpdates';
import { getUnreadCountArgs, getUnreadCountHandler } from './getUnreadCount';

export const getTicketById = query({ args: getTicketByIdArgs, handler: getTicketByIdHandler });
export const getTickets = query({ args: getTicketsArgs, handler: getTicketsHandler });
export const getTicketsPage = query({ args: getTicketsPageArgs, handler: getTicketsPageHandler });
export const searchTickets = query({ args: searchTicketsArgs, handler: searchTicketsHandler });
export const getTicketAnalytics = query({ args: getTicketAnalyticsArgs, handler: getTicketAnalyticsHandler });
export const getTicketUpdates = query({ args: getTicketUpdatesArgs, handler: getTicketUpdatesHandler });
export const getUnreadCount = query({ args: getUnreadCountArgs, handler: getUnreadCountHandler });
