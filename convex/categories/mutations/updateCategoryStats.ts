import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Update category stats (internal use for product/order changes)
export const updateCategoryStatsArgs = {
  categoryId: v.id('categories'),
  productCountDelta: v.optional(v.number()),
  activeProductCountDelta: v.optional(v.number()),
  orderCountDelta: v.optional(v.number()),
  revenueDelta: v.optional(v.number()),
};

export const updateCategoryStatsHandler = async (
  ctx: MutationCtx,
  args: {
    categoryId: Id<'categories'>;
    productCountDelta?: number;
    activeProductCountDelta?: number;
    orderCountDelta?: number;
    revenueDelta?: number;
  }
) => {
  const category = await ctx.db.get(args.categoryId);
  if (!category || category.isDeleted) {
    return; // Category no longer exists, ignore stats update
  }

  const updates: Partial<typeof category> = {
    updatedAt: Date.now(),
  };

  if (args.productCountDelta !== undefined) {
    updates.productCount = Math.max(0, category.productCount + args.productCountDelta);
  }

  if (args.activeProductCountDelta !== undefined) {
    updates.activeProductCount = Math.max(0, category.activeProductCount + args.activeProductCountDelta);
  }

  if (args.orderCountDelta !== undefined) {
    updates.totalOrderCount = Math.max(0, category.totalOrderCount + args.orderCountDelta);
  }

  if (args.revenueDelta !== undefined) {
    updates.totalRevenue = Math.max(0, category.totalRevenue + args.revenueDelta);
  }

  await ctx.db.patch(args.categoryId, updates);

  // Update parent category stats recursively
  if (category.parentCategoryId) {
    await updateCategoryStatsHandler(ctx, {
      categoryId: category.parentCategoryId,
      productCountDelta: args.productCountDelta,
      activeProductCountDelta: args.activeProductCountDelta,
      orderCountDelta: args.orderCountDelta,
      revenueDelta: args.revenueDelta,
    });
  }
};
