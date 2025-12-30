import { internalMutation, query } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { Id } from '../_generated/dataModel';
import { calculateMonetaryRefundEligibleAt } from '../helpers/utils';

/**
 * Internal mutation to migrate voucher schema changes:
 * - Rename initiatedBy → cancellationInitiator
 * - Convert lowercase values ('customer', 'seller') to uppercase ('CUSTOMER', 'SELLER')
 * - Remove monetaryRefundStatus field
 * - Infer monetaryRefundRequestedAt from refund request timestamps or monetaryRefundStatus
 * - Calculate monetaryRefundEligibleAt for seller-initiated vouchers (createdAt + 14 days)
 */
export const migrateVoucherSchemaBatch = internalMutation({
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

    let vouchers: any[];
    let hasMore = false;
    let nextCursor: string | undefined;

    // Query all vouchers (we need to check each one for old fields)
    if (cursor) {
      const result = (await ctx.db.query('vouchers').order('asc').paginate({ numItems: limit, cursor })) as any;
      vouchers = result.page;
      hasMore = result.hasMore;
      nextCursor = result.continueCursor;
    } else {
      vouchers = await ctx.db.query('vouchers').order('asc').take(limit);
      hasMore = vouchers.length === limit;
    }

    for (const voucher of vouchers) {
      processed++;

      const updates: {
        cancellationInitiator?: 'CUSTOMER' | 'SELLER';
        monetaryRefundEligibleAt?: number;
        monetaryRefundRequestedAt?: number;
        updatedAt: number;
      } = {
        updatedAt: Date.now(),
      };

      let needsUpdate = false;

      // Check for old initiatedBy field or lowercase cancellationInitiator
      const oldInitiatedBy = (voucher as any).initiatedBy;
      const currentCancellationInitiator = voucher.cancellationInitiator;

      if (
        oldInitiatedBy ||
        (currentCancellationInitiator &&
          typeof currentCancellationInitiator === 'string' &&
          currentCancellationInitiator.toLowerCase() === currentCancellationInitiator)
      ) {
        // Map old field or lowercase value to new uppercase field
        const value = oldInitiatedBy || currentCancellationInitiator;
        if (value === 'customer' || value === 'CUSTOMER') {
          updates.cancellationInitiator = 'CUSTOMER';
          needsUpdate = true;
          report.push(`vouchers/${voucher._id}: Migrated initiatedBy '${value}' → cancellationInitiator 'CUSTOMER'`);
        } else if (value === 'seller' || value === 'SELLER') {
          updates.cancellationInitiator = 'SELLER';
          needsUpdate = true;
          report.push(`vouchers/${voucher._id}: Migrated initiatedBy '${value}' → cancellationInitiator 'SELLER'`);
        }
      }

      // Check for old monetaryRefundStatus field
      const oldMonetaryRefundStatus = (voucher as any).monetaryRefundStatus;
      if (oldMonetaryRefundStatus) {
        // Infer monetaryRefundRequestedAt from status if it indicates a request was made
        // Status values might be: 'requested', 'pending', 'approved', 'rejected', etc.
        if (oldMonetaryRefundStatus && typeof oldMonetaryRefundStatus === 'string') {
          const statusLower = oldMonetaryRefundStatus.toLowerCase();
          if (
            statusLower.includes('request') ||
            statusLower.includes('pending') ||
            statusLower.includes('approved') ||
            statusLower.includes('rejected')
          ) {
            // Try to get timestamp from voucher refund request
            const refundRequest = await ctx.db
              .query('voucherRefundRequests')
              .withIndex('by_voucher', (q) => q.eq('voucherId', voucher._id))
              .filter((q) => q.eq(q.field('isDeleted'), false))
              .order('desc')
              .first();

            if (refundRequest) {
              updates.monetaryRefundRequestedAt = refundRequest.createdAt;
              report.push(
                `vouchers/${voucher._id}: Set monetaryRefundRequestedAt from refund request (${new Date(refundRequest.createdAt).toISOString()})`
              );
            } else {
              // Fallback: use voucher updatedAt if status indicates request was made
              updates.monetaryRefundRequestedAt = voucher.updatedAt;
              report.push(
                `vouchers/${voucher._id}: Set monetaryRefundRequestedAt from updatedAt (fallback, ${new Date(voucher.updatedAt).toISOString()})`
              );
            }
            needsUpdate = true;
          }
        }
        // Note: Old monetaryRefundStatus field will remain in database but won't be accessible via schema
        needsUpdate = true;
      }

      // Calculate monetaryRefundEligibleAt for seller-initiated vouchers if missing
      const cancellationInitiator = updates.cancellationInitiator || voucher.cancellationInitiator;
      if (cancellationInitiator === 'SELLER' && !voucher.monetaryRefundEligibleAt) {
        updates.monetaryRefundEligibleAt = calculateMonetaryRefundEligibleAt('SELLER', voucher.createdAt);
        needsUpdate = true;
        if (updates.monetaryRefundEligibleAt) {
          report.push(`vouchers/${voucher._id}: Calculated monetaryRefundEligibleAt (${new Date(updates.monetaryRefundEligibleAt).toISOString()})`);
        }
      }

      // Note: Old fields (initiatedBy, monetaryRefundStatus) will remain in database
      // but won't be accessible via the schema - they'll be ignored by the type system

      if (needsUpdate && !dryRun) {
        // Remove undefined values before patching
        const cleanUpdates: any = { updatedAt: updates.updatedAt };
        if (updates.cancellationInitiator !== undefined) {
          cleanUpdates.cancellationInitiator = updates.cancellationInitiator;
        }
        if (updates.monetaryRefundEligibleAt !== undefined) {
          cleanUpdates.monetaryRefundEligibleAt = updates.monetaryRefundEligibleAt;
        }
        if (updates.monetaryRefundRequestedAt !== undefined) {
          cleanUpdates.monetaryRefundRequestedAt = updates.monetaryRefundRequestedAt;
        }

        await ctx.db.patch(voucher._id, cleanUpdates);
        updated++;
      } else if (needsUpdate) {
        updated++;
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

/**
 * Public mutation to trigger the migration process
 */
export const runMigrateVoucherSchema = internalMutation({
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
      const result = await ctx.runMutation(internal.migrations.migrateVoucherSchema.migrateVoucherSchemaBatch, {
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
      message: dryRun ? `Dry run completed: ${totalUpdated} vouchers would be updated` : `Migration completed: ${totalUpdated} vouchers updated`,
      totalProcessed,
      totalUpdated,
      batches,
    };
  },
});

/**
 * Query to check migration status and flag unmigrated rows
 */
export const checkVoucherSchemaMigrationStatus = query({
  args: {},
  returns: v.object({
    totalVouchers: v.number(),
    vouchersNeedingMigration: v.number(),
    vouchersWithOldInitiatedBy: v.number(),
    vouchersWithLowercaseCancellationInitiator: v.number(),
    vouchersWithOldMonetaryRefundStatus: v.number(),
    vouchersMissingMonetaryRefundEligibleAt: v.number(),
    unmigratedVoucherIds: v.array(v.id('vouchers')),
  }),
  handler: async (ctx) => {
    const allVouchers = await ctx.db.query('vouchers').collect();
    const unmigratedIds: Id<'vouchers'>[] = [];
    let withOldInitiatedBy = 0;
    let withLowercaseCancellationInitiator = 0;
    let withOldMonetaryRefundStatus = 0;
    let missingMonetaryRefundEligibleAt = 0;

    for (const voucher of allVouchers) {
      let needsMigration = false;
      const voucherAny = voucher as any;

      // Check for old initiatedBy field
      if (voucherAny.initiatedBy !== undefined) {
        withOldInitiatedBy++;
        needsMigration = true;
      }

      // Check for lowercase cancellationInitiator
      if (
        voucher.cancellationInitiator &&
        typeof voucher.cancellationInitiator === 'string' &&
        voucher.cancellationInitiator.toLowerCase() === voucher.cancellationInitiator &&
        voucher.cancellationInitiator !== 'CUSTOMER' &&
        voucher.cancellationInitiator !== 'SELLER'
      ) {
        withLowercaseCancellationInitiator++;
        needsMigration = true;
      }

      // Check for old monetaryRefundStatus field
      if (voucherAny.monetaryRefundStatus !== undefined) {
        withOldMonetaryRefundStatus++;
        needsMigration = true;
      }

      // Check for missing monetaryRefundEligibleAt on seller-initiated vouchers
      if (voucher.cancellationInitiator === 'SELLER' && !voucher.monetaryRefundEligibleAt) {
        missingMonetaryRefundEligibleAt++;
        needsMigration = true;
      }

      if (needsMigration) {
        unmigratedIds.push(voucher._id);
      }
    }

    return {
      totalVouchers: allVouchers.length,
      vouchersNeedingMigration: unmigratedIds.length,
      vouchersWithOldInitiatedBy: withOldInitiatedBy,
      vouchersWithLowercaseCancellationInitiator: withLowercaseCancellationInitiator,
      vouchersWithOldMonetaryRefundStatus: withOldMonetaryRefundStatus,
      vouchersMissingMonetaryRefundEligibleAt: missingMonetaryRefundEligibleAt,
      unmigratedVoucherIds: unmigratedIds,
    };
  },
});
