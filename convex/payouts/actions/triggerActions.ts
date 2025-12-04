import { action, internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';

/**
 * Helper function to get the previous Wednesday-Tuesday period
 * Returns timestamps for:
 * - periodStart: Previous Wednesday 00:00:00 UTC
 * - periodEnd: Previous Tuesday 23:59:59 UTC
 */
function getPreviousWeekPeriod(): { periodStart: number; periodEnd: number } {
  const now = new Date();

  // Find the most recent Wednesday (start of current period)
  // If today is Wednesday, go back to last Wednesday
  const currentDay = now.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  // Calculate days since the Wednesday before the one that just ended
  // We want the Wednesday from the period that just ended (previous week)
  let daysToLastWednesday: number;

  if (currentDay === 3) {
    // Today is Wednesday - previous period started last Wednesday (7 days ago)
    daysToLastWednesday = 7;
  } else if (currentDay > 3) {
    // After Wednesday (Thu, Fri, Sat)
    // Previous period's Wednesday is (currentDay - 3 + 7) days ago
    daysToLastWednesday = currentDay - 3 + 7;
  } else {
    // Before Wednesday (Sun, Mon, Tue)
    // Previous period's Wednesday is (7 - 3 + currentDay + 7) days ago
    // Simplified: (currentDay + 4 + 7) = currentDay + 11
    daysToLastWednesday = currentDay + 4 + 7;
  }

  // Period start: Previous Wednesday 00:00:00 UTC
  const periodStartDate = new Date(now);
  periodStartDate.setUTCDate(now.getUTCDate() - daysToLastWednesday);
  periodStartDate.setUTCHours(0, 0, 0, 0);

  // Period end: Tuesday 23:59:59 UTC (6 days after Wednesday)
  const periodEndDate = new Date(periodStartDate);
  periodEndDate.setUTCDate(periodStartDate.getUTCDate() + 6);
  periodEndDate.setUTCHours(23, 59, 59, 999);

  return {
    periodStart: periodStartDate.getTime(),
    periodEnd: periodEndDate.getTime(),
  };
}

/**
 * Internal action to trigger weekly payout generation (called by cron)
 */
export const triggerWeeklyPayoutGeneration = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; invoicesCreated: number; periodStart: number; periodEnd: number }> => {
    // Calculate the previous week's period
    const { periodStart, periodEnd } = getPreviousWeekPeriod();

    console.log(`Generating payout invoices for period: ${new Date(periodStart).toISOString()} to ${new Date(periodEnd).toISOString()}`);

    // Call the mutation to generate invoices
    const result = await ctx.runMutation(internal.payouts.mutations.index.generatePayoutInvoices, {
      periodStart,
      periodEnd,
    });

    return result;
  },
});

/**
 * Manual trigger action for testing/super-admin - allows specifying custom dates
 */
export const triggerPayoutGenerationManual = action({
  args: {
    periodStart: v.number(),
    periodEnd: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; invoicesCreated: number; periodStart: number; periodEnd: number }> => {
    console.log(
      `Manually generating payout invoices for period: ${new Date(args.periodStart).toISOString()} to ${new Date(args.periodEnd).toISOString()}`
    );

    // Call the mutation to generate invoices
    const result = await ctx.runMutation(internal.payouts.mutations.index.generatePayoutInvoices, {
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
    });

    return result;
  },
});
