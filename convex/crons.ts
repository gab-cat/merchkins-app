import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

/**
 * Weekly Payout Invoice Generation
 *
 * Schedule: Every Wednesday at 00:05 UTC
 * Purpose: Generate payout invoices for all organizations for the previous week
 *
 * Cut-off period: Wednesday 00:00 UTC (previous week) to Tuesday 23:59:59 UTC
 * Example: If cron runs on Wed Dec 11, 2024 at 00:05
 *   - periodStart: Wed Dec 4, 2024 00:00:00 UTC
 *   - periodEnd: Tue Dec 10, 2024 23:59:59 UTC
 *
 * The action calculates the correct period dates automatically.
 */
crons.cron(
  'generate-weekly-payout-invoices',
  // Run at 00:05 UTC every Wednesday (day 3)
  // Minute Hour DayOfMonth Month DayOfWeek
  '5 0 * * 3',
  internal.payouts.actions.index.triggerWeeklyPayoutGeneration,
  {}
);

export default crons;
