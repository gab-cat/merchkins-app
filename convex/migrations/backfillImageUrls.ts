import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { buildPublicUrl } from "../helpers";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

// Internal mutation to backfill image URLs for a single batch of records
export const backfillImageUrlsBatch = internalMutation({
  args: {
    table: v.string(), // "organizations", "organizationMembers", etc.
    limit: v.optional(v.number()), // How many records to process in this batch
    dryRun: v.optional(v.boolean()), // If true, don't make changes, just report what would be done
    cursor: v.optional(v.string()), // For pagination
  },
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
    hasMore: v.boolean(),
    nextCursor: v.optional(v.string()),
    report: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const { table, limit = 100, dryRun = false, cursor } = args;
    const report: string[] = [];
    let processed = 0;
    let updated = 0;

    switch (table) {
      case "organizations": {
        let orgs: any[];
        let hasMore = false;
        let nextCursor: string | undefined;

        if (cursor) {
          const result = await ctx.db.query("organizations").order("asc").paginate({ numItems: limit, cursor }) as any;
          orgs = result.page;
          hasMore = result.hasMore;
          nextCursor = result.continueCursor;
        } else {
          orgs = await ctx.db.query("organizations").order("asc").take(limit);
          hasMore = orgs.length === limit; // Simple heuristic for hasMore
        }

        for (const org of orgs) {
          processed++;

          const updates: { logoUrl?: string; bannerImageUrl?: string } = {};

          if (org.logo && !org.logoUrl) {
            updates.logoUrl = buildPublicUrl(org.logo) || undefined;
          }

          if (org.bannerImage && !org.bannerImageUrl) {
            updates.bannerImageUrl = buildPublicUrl(org.bannerImage) || undefined;
          }

          if (Object.keys(updates).length > 0) {
            if (!dryRun) {
              await ctx.db.patch(org._id, {
                ...updates,
                updatedAt: Date.now(),
              });
            }
            updated++;
            report.push(`organizations/${org._id}: ${JSON.stringify(updates)}`);
          }
        }

        return {
          processed,
          updated,
          hasMore,
          nextCursor,
          report,
        };
      }

      case "organizationMembers": {
        let members: any[];
        let hasMore = false;
        let nextCursor: string | undefined;

        if (cursor) {
          const result = await ctx.db.query("organizationMembers").order("asc").paginate({ numItems: limit, cursor }) as any;
          members = result.page;
          hasMore = result.hasMore;
          nextCursor = result.continueCursor;
        } else {
          members = await ctx.db.query("organizationMembers").order("asc").take(limit);
          hasMore = members.length === limit;
        }

        for (const member of members) {
          processed++;

          if (member.organizationInfo?.logo && !member.organizationInfo.logoUrl) {
            const updates = {
              organizationInfo: {
                ...member.organizationInfo,
                logoUrl: buildPublicUrl(member.organizationInfo.logo) || undefined,
              },
            };

            if (!dryRun) {
              await ctx.db.patch(member._id, {
                ...updates,
                updatedAt: Date.now(),
              });
            }
            updated++;
            report.push(`organizationMembers/${member._id}: logoUrl`);
          }
        }

        return {
          processed,
          updated,
          hasMore,
          nextCursor,
          report,
        };
      }

      case "organizationInviteLinks": {
        let invites: any[];
        let hasMore = false;
        let nextCursor: string | undefined;

        if (cursor) {
          const result = await ctx.db.query("organizationInviteLinks").order("asc").paginate({ numItems: limit, cursor }) as any;
          invites = result.page;
          hasMore = result.hasMore;
          nextCursor = result.continueCursor;
        } else {
          invites = await ctx.db.query("organizationInviteLinks").order("asc").take(limit);
          hasMore = invites.length === limit;
        }

        for (const invite of invites) {
          processed++;

          if (invite.organizationInfo?.logo && !invite.organizationInfo.logoUrl) {
            const updates = {
              organizationInfo: {
                ...invite.organizationInfo,
                logoUrl: buildPublicUrl(invite.organizationInfo.logo) || undefined,
              },
            };

            if (!dryRun) {
              await ctx.db.patch(invite._id, {
                ...updates,
                updatedAt: Date.now(),
              });
            }
            updated++;
            report.push(`organizationInviteLinks/${invite._id}: logoUrl`);
          }
        }

        return {
          processed,
          updated,
          hasMore,
          nextCursor,
          report,
        };
      }

      case "categories": {
        let categories: any[];
        let hasMore = false;
        let nextCursor: string | undefined;

        if (cursor) {
          const result = await ctx.db.query("categories").order("asc").paginate({ numItems: limit, cursor }) as any;
          categories = result.page;
          hasMore = result.hasMore;
          nextCursor = result.continueCursor;
        } else {
          categories = await ctx.db.query("categories").order("asc").take(limit);
          hasMore = categories.length === limit;
        }

        for (const category of categories) {
          processed++;

          if (category.organizationInfo?.logo && !category.organizationInfo.logoUrl) {
            const updates = {
              organizationInfo: {
                ...category.organizationInfo,
                logoUrl: buildPublicUrl(category.organizationInfo.logo) || undefined,
              },
            };

            if (!dryRun) {
              await ctx.db.patch(category._id, {
                ...updates,
                updatedAt: Date.now(),
              });
            }
            updated++;
            report.push(`categories/${category._id}: logoUrl`);
          }
        }

        return {
          processed,
          updated,
          hasMore,
          nextCursor,
          report,
        };
      }

      case "products": {
        let products: any[];
        let hasMore = false;
        let nextCursor: string | undefined;

        if (cursor) {
          const result = await ctx.db.query("products").order("asc").paginate({ numItems: limit, cursor }) as any;
          products = result.page;
          hasMore = result.hasMore;
          nextCursor = result.continueCursor;
        } else {
          products = await ctx.db.query("products").order("asc").take(limit);
          hasMore = products.length === limit;
        }

        for (const product of products) {
          processed++;

          if (product.organizationInfo?.logo && !product.organizationInfo.logoUrl) {
            const updates = {
              organizationInfo: {
                ...product.organizationInfo,
                logoUrl: buildPublicUrl(product.organizationInfo.logo) || undefined,
              },
            };

            if (!dryRun) {
              await ctx.db.patch(product._id, {
                ...updates,
                updatedAt: Date.now(),
              });
            }
            updated++;
            report.push(`products/${product._id}: logoUrl`);
          }
        }

        return {
          processed,
          updated,
          hasMore,
          nextCursor,
          report,
        };
      }

      default:
        throw new Error(`Unsupported table: ${table}`);
    }
  },
});

// Public mutation to trigger the backfill process
export const runBackfillImageUrls = internalMutation({
  args: {
    table: v.string(),
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
    const { table, limit = 100, dryRun = false } = args;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let batches = 0;
    let cursor: string | undefined;

    do {
      const result = await ctx.runMutation(internal.migrations.backfillImageUrls.backfillImageUrlsBatch, {
        table,
        limit,
        dryRun,
        cursor,
      });

      totalProcessed += result.processed;
      totalUpdated += result.updated;
      batches++;
      cursor = result.hasMore ? result.nextCursor : undefined;

      // Safety limit to prevent infinite loops
      if (batches > 1000) {
        throw new Error("Too many batches processed, possible infinite loop");
      }
    } while (cursor);

    return {
      message: dryRun
        ? `Dry run completed: ${totalUpdated} records would be updated`
        : `Migration completed: ${totalUpdated} records updated`,
      totalProcessed,
      totalUpdated,
      batches,
    };
  },
});

// Public query to check migration status
export const getBackfillStatus = internalQuery({
  args: {
    table: v.string(),
  },
  returns: v.object({
    totalRecords: v.number(),
    recordsWithUrls: v.number(),
    recordsNeedingMigration: v.number(),
  }),
  handler: async (ctx, args) => {
    const { table } = args;

    switch (table) {
      case "organizations": {
        const all = await ctx.db.query("organizations").collect();
        const withUrls = all.filter(org => org.logoUrl || org.bannerImageUrl).length;
        const needingMigration = all.filter(org =>
          (org.logo && !org.logoUrl) || (org.bannerImage && !org.bannerImageUrl)
        ).length;

        return {
          totalRecords: all.length,
          recordsWithUrls: withUrls,
          recordsNeedingMigration: needingMigration,
        };
      }

      case "organizationMembers": {
        const all = await ctx.db.query("organizationMembers").collect();
        const withUrls = all.filter(member => member.organizationInfo?.logoUrl).length;
        const needingMigration = all.filter(member =>
          member.organizationInfo?.logo && !member.organizationInfo.logoUrl
        ).length;

        return {
          totalRecords: all.length,
          recordsWithUrls: withUrls,
          recordsNeedingMigration: needingMigration,
        };
      }

      case "organizationInviteLinks": {
        const all = await ctx.db.query("organizationInviteLinks").collect();
        const withUrls = all.filter(invite => invite.organizationInfo?.logoUrl).length;
        const needingMigration = all.filter(invite =>
          invite.organizationInfo?.logo && !invite.organizationInfo.logoUrl
        ).length;

        return {
          totalRecords: all.length,
          recordsWithUrls: withUrls,
          recordsNeedingMigration: needingMigration,
        };
      }

      case "categories": {
        const all = await ctx.db.query("categories").collect();
        const withUrls = all.filter(category => category.organizationInfo?.logoUrl).length;
        const needingMigration = all.filter(category =>
          category.organizationInfo?.logo && !category.organizationInfo.logoUrl
        ).length;

        return {
          totalRecords: all.length,
          recordsWithUrls: withUrls,
          recordsNeedingMigration: needingMigration,
        };
      }

      case "products": {
        const all = await ctx.db.query("products").collect();
        const withUrls = all.filter(product => product.organizationInfo?.logoUrl).length;
        const needingMigration = all.filter(product =>
          product.organizationInfo?.logo && !product.organizationInfo.logoUrl
        ).length;

        return {
          totalRecords: all.length,
          recordsWithUrls: withUrls,
          recordsNeedingMigration: needingMigration,
        };
      }

      default:
        throw new Error(`Unsupported table: ${table}`);
    }
  },
});
