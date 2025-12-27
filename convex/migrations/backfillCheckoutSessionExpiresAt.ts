import { internalMutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { CHECKOUT_SESSION_EXPIRY_MS } from '../helpers/utils';

// Internal mutation to backfill expiresAt field for checkoutSessions that don't have it set
export const backfillExpiresAtBatch = internalMutation({
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

    // Get all checkoutSessions
    let sessions: any[];
    let hasMore = false;
    let nextCursor: string | undefined;

    const result = await ctx.db
      .query('checkoutSessions')
      .order('asc')
      .paginate({ numItems: limit, cursor: cursor || null });
    sessions = result.page;
    hasMore = !result.isDone;
    nextCursor = result.continueCursor;

    const now = Date.now();

    for (const session of sessions) {
      processed++;

      // Check if any fields need to be backfilled
      const needsExpiresAt = session.expiresAt === undefined || session.expiresAt === null;
      const needsInvoiceCreated = session.invoiceCreated === undefined || session.invoiceCreated === null;
      const needsInvoiceCreationAttempts = session.invoiceCreationAttempts === undefined || session.invoiceCreationAttempts === null;

      // Skip if all fields are already set
      if (!needsExpiresAt && !needsInvoiceCreated && !needsInvoiceCreationAttempts) {
        continue;
      }

      const updates: any = {};
      const updateMessages: string[] = [];

      // Calculate expiresAt based on createdAt + 24 hours
      // Fallback to updatedAt or current time if createdAt doesn't exist
      if (needsExpiresAt) {
        let expiresAtValue: number;

        if (session.createdAt) {
          expiresAtValue = session.createdAt + CHECKOUT_SESSION_EXPIRY_MS;
          updateMessages.push(`expiresAt from createdAt (${new Date(expiresAtValue).toISOString()})`);
        } else if (session.updatedAt) {
          // Fallback: use updatedAt if createdAt doesn't exist
          expiresAtValue = session.updatedAt + CHECKOUT_SESSION_EXPIRY_MS;
          updateMessages.push(`expiresAt from updatedAt (fallback, ${new Date(expiresAtValue).toISOString()})`);
        } else {
          // Last resort: use current time
          expiresAtValue = now + CHECKOUT_SESSION_EXPIRY_MS;
          updateMessages.push(`expiresAt from current time (last resort, ${new Date(expiresAtValue).toISOString()})`);
        }
        updates.expiresAt = expiresAtValue;
      }

      // Set invoiceCreated to false if missing (default value)
      if (needsInvoiceCreated) {
        updates.invoiceCreated = false;
        updateMessages.push('invoiceCreated to false (default)');
      }

      // Set invoiceCreationAttempts to 0 if missing (default value)
      if (needsInvoiceCreationAttempts) {
        updates.invoiceCreationAttempts = 0;
        updateMessages.push('invoiceCreationAttempts to 0 (default)');
      }

      if (!dryRun) {
        updates.updatedAt = now;
        await ctx.db.patch(session._id, updates);
      }

      report.push(`checkoutSessions/${session._id}: Set ${updateMessages.join(', ')}`);
      updated++;
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
export const runBackfillExpiresAt = internalMutation({
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
      const result = await ctx.runMutation(internal.migrations.backfillCheckoutSessionExpiresAt.backfillExpiresAtBatch, {
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
      message: dryRun
        ? `Dry run completed: ${totalUpdated} checkout sessions would be updated`
        : `Migration completed: ${totalUpdated} checkout sessions updated`,
      totalProcessed,
      totalUpdated,
      batches,
    };
  },
});

// Public query to check migration status
// Uses pagination to avoid OOM for large datasets
export const checkExpiresAtMigrationStatus = query({
  args: {},
  returns: v.object({
    totalSessions: v.number(),
    sessionsNeedingMigration: v.number(),
    sessionsWithExpiresAt: v.number(),
  }),
  handler: async (ctx) => {
    const PAGE_SIZE = 1000; // Process 1000 rows per page to balance memory and performance
    let totalSessions = 0;
    let sessionsNeedingMigration = 0;
    let sessionsWithExpiresAt = 0;
    let cursor: string | null = null;
    let hasMore = true;

    // Paginate through all checkoutSessions to avoid loading entire table into memory
    while (hasMore) {
      const result = await ctx.db.query('checkoutSessions').order('asc').paginate({ numItems: PAGE_SIZE, cursor });

      const page = result.page;
      totalSessions += page.length;

      // Process each session in the current page
      for (const session of page) {
        const needsMigration =
          session.expiresAt === undefined ||
          session.expiresAt === null ||
          session.invoiceCreated === undefined ||
          session.invoiceCreated === null ||
          session.invoiceCreationAttempts === undefined ||
          session.invoiceCreationAttempts === null;

        if (needsMigration) {
          sessionsNeedingMigration++;
        } else {
          sessionsWithExpiresAt++;
        }
      }

      // Check if there are more pages
      hasMore = !result.isDone;
      cursor = result.continueCursor;

      // Memory is freed between iterations as page goes out of scope
    }

    return {
      totalSessions,
      sessionsNeedingMigration,
      sessionsWithExpiresAt,
    };
  },
});
