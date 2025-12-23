import { internalMutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';

// Internal mutation to backfill missing fields in orderLogs
export const backfillOrderLogsBatch = internalMutation({
  args: {
    limit: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
    hasMore: v.boolean(),
    nextCursor: v.optional(v.string()),
    report: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const { limit = 100, dryRun = false, cursor } = args;
    const report: string[] = [];
    let processed = 0;
    let updated = 0;

    let logs: any[];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (cursor) {
      const result = (await ctx.db.query('orderLogs').order('asc').paginate({ numItems: limit, cursor })) as any;
      logs = result.page;
      hasMore = result.hasMore;
      nextCursor = result.continueCursor;
    } else {
      logs = await ctx.db.query('orderLogs').order('asc').take(limit);
      hasMore = logs.length === limit;
    }

    for (const log of logs) {
      processed++;

      const updates: { isSystemLog?: boolean; isPublic?: boolean } = {};

      // Check if isSystemLog is missing
      if (log.isSystemLog === undefined) {
        // Default to true if createdById is missing (system log), false otherwise
        updates.isSystemLog = !log.createdById;
      }

      // Check if isPublic is missing
      if (log.isPublic === undefined) {
        // Default to true (public by default)
        updates.isPublic = true;
      }

      if (Object.keys(updates).length > 0) {
        if (!dryRun) {
          await ctx.db.patch(log._id, {
            ...updates,
            updatedAt: Date.now(),
          });
        }
        updated++;
        report.push(`orderLogs/${log._id}: ${JSON.stringify(updates)}`);
      }
    }

    return {
      processed,
      updated,
      hasMore,
      nextCursor,
      report,
    };
  },
});

// Public mutation to trigger the backfill process
export const runBackfillOrderLogs = internalMutation({
  args: {
    limit: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    message: v.string(),
    totalProcessed: v.number(),
    totalUpdated: v.number(),
    batches: v.number(),
  }),
  handler: async (ctx, args) => {
    const { limit = 100, dryRun = false } = args;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let batches = 0;
    let cursor: string | undefined;

    do {
      const result = await ctx.runMutation(internal.migrations.backfillOrderLogs.backfillOrderLogsBatch, {
        limit,
        dryRun,
        cursor,
      });

      totalProcessed += result.processed;
      totalUpdated += result.updated;
      batches++;
      cursor = result.hasMore ? result.nextCursor : undefined;
    } while (cursor);

    return {
      message: dryRun ? `Dry run completed: ${totalUpdated} records would be updated` : `Migration completed: ${totalUpdated} records updated`,
      totalProcessed,
      totalUpdated,
      batches,
    };
  },
});

// Public query to check migration status
export const checkOrderLogsMigrationStatus = query({
  args: {},
  returns: v.object({
    totalLogs: v.number(),
    recordsNeedingMigration: v.number(),
  }),
  handler: async (ctx) => {
    const all = await ctx.db.query('orderLogs').collect();
    const needingMigration = all.filter((log) => log.isSystemLog === undefined || log.isPublic === undefined).length;

    return {
      totalLogs: all.length,
      recordsNeedingMigration: needingMigration,
    };
  },
});



















