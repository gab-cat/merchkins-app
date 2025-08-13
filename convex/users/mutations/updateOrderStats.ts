import { MutationCtx, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Update user order statistics (called internally when orders are created/updated)
export const updateOrderStatsArgs = {
  userId: v.id("users"),
  orderValue: v.optional(v.number()),
  incrementOrders: v.optional(v.boolean()),
};

export const updateOrderStatsHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    orderValue?: number;
    incrementOrders?: boolean;
  }
) => {
  const { userId, orderValue = 0, incrementOrders = false } = args;
  
  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }
  
  const updates = {
    updatedAt: Date.now(),
    lastOrderAt: Date.now(),
  } as Record<string, unknown>;
  
  if (incrementOrders) {
    updates.totalOrders = (user.totalOrders || 0) + 1;
  }
  
  if (orderValue > 0) {
    updates.totalSpent = (user.totalSpent || 0) + orderValue;
  }
  
  // Update user stats
  await ctx.db.patch(userId, updates);
  
  return { success: true };
};

// Note: This function uses internalMutation, not regular mutation
export const updateOrderStats = internalMutation({
  args: updateOrderStatsArgs,
  handler: updateOrderStatsHandler,
});
