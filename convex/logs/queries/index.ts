import { query } from '../../_generated/server';

import { getLogByIdArgs, getLogByIdHandler } from './logById';
import { getLogsArgs, getLogsHandler } from './logsList';
import { searchLogsArgs, searchLogsHandler } from './logsSearch';
import { getLogAnalyticsArgs, getLogAnalyticsHandler } from './logsAnalytics';

export const getLogById = query({
  args: getLogByIdArgs,
  handler: getLogByIdHandler,
});

export const getLogs = query({
  args: getLogsArgs,
  handler: getLogsHandler,
});

export const searchLogs = query({
  args: searchLogsArgs,
  handler: searchLogsHandler,
});

export const getLogAnalytics = query({
  args: getLogAnalyticsArgs,
  handler: getLogAnalyticsHandler,
});
