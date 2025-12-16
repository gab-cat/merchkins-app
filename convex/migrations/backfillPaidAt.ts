import { internalMutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';

// Internal mutation to backfill paidAt field for orders that don't have it set
export const backfillPaidAtBatch = internalMutation({
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

    // Get orders with paymentStatus = PAID but no paidAt set
    let orders: any[];
    let hasMore = false;
    let nextCursor: string | undefined;

    if (cursor) {
      const result = (await ctx.db
        .query('orders')
        .withIndex('by_payment_status', (q) => q.eq('paymentStatus', 'PAID'))
        .order('asc')
        .paginate({ numItems: limit, cursor })) as any;
      orders = result.page;
      hasMore = result.hasMore;
      nextCursor = result.continueCursor;
    } else {
      orders = await ctx.db
        .query('orders')
        .withIndex('by_payment_status', (q) => q.eq('paymentStatus', 'PAID'))
        .order('asc')
        .take(limit);
      hasMore = orders.length === limit;
    }

    for (const order of orders) {
      processed++;

      // Skip if paidAt is already set
      if (order.paidAt) {
        continue;
      }

      // Try to get payment record to get actual paymentDate
      const payment = await ctx.db
        .query('payments')
        .withIndex('by_order', (q) => q.eq('orderId', order._id))
        .filter((q) => q.eq(q.field('paymentStatus'), 'VERIFIED'))
        .order('desc')
        .first();

      let paidAtValue: number;

      if (payment) {
        // Use paymentDate from payment record (most accurate)
        paidAtValue = payment.paymentDate;
        report.push(`orders/${order._id}: Set paidAt from payment record (${new Date(paidAtValue).toISOString()})`);
      } else {
        // Fallback: use orderDate if no payment record found
        paidAtValue = order.orderDate;
        report.push(`orders/${order._id}: Set paidAt from orderDate (fallback, ${new Date(paidAtValue).toISOString()})`);
      }

      if (!dryRun) {
        await ctx.db.patch(order._id, {
          paidAt: paidAtValue,
          updatedAt: Date.now(),
        });
      }
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
export const runBackfillPaidAt = internalMutation({
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
      const result = await ctx.runMutation(internal.migrations.backfillPaidAt.backfillPaidAtBatch, {
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
      message: dryRun ? `Dry run completed: ${totalUpdated} orders would be updated` : `Migration completed: ${totalUpdated} orders updated`,
      totalProcessed,
      totalUpdated,
      batches,
    };
  },
});

// Public query to check migration status
export const checkPaidAtMigrationStatus = query({
  args: {},
  returns: v.object({
    totalPaidOrders: v.number(),
    ordersNeedingMigration: v.number(),
    ordersWithPaidAt: v.number(),
  }),
  handler: async (ctx) => {
    const allPaidOrders = await ctx.db
      .query('orders')
      .withIndex('by_payment_status', (q) => q.eq('paymentStatus', 'PAID'))
      .collect();
    const needingMigration = allPaidOrders.filter((order) => !order.paidAt).length;
    const withPaidAt = allPaidOrders.filter((order) => !!order.paidAt).length;

    return {
      totalPaidOrders: allPaidOrders.length,
      ordersNeedingMigration: needingMigration,
      ordersWithPaidAt: withPaidAt,
    };
  },
});
