import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Internal stats updater for orders (e.g., payment updates)
export const updateOrderStatsArgs = {
  orderId: v.id("orders"),
  paymentStatus: v.optional(
    v.union(
      v.literal("PENDING"),
      v.literal("DOWNPAYMENT"),
      v.literal("PAID"),
      v.literal("REFUNDED")
    )
  ),
};

export const updateOrderStatsHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<"orders">;
    paymentStatus?: "PENDING" | "DOWNPAYMENT" | "PAID" | "REFUNDED";
  }
) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) {
    return; // No-op if order removed
  }

  const updates: Record<string, unknown> = { updatedAt: Date.now() };
  if (args.paymentStatus) {
    updates.paymentStatus = args.paymentStatus;
  }

  await ctx.db.patch(args.orderId, updates);
  return { success: true };
};


