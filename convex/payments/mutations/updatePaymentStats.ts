import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";

// Internal recalculation of order payment status based on active payments
export const updatePaymentStatsArgs = {
  orderId: v.id("orders"),
} as const;

export const updatePaymentStatsHandler = async (
  ctx: MutationCtx,
  args: { orderId: Id<"orders"> },
) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) return { success: false };

  const payments = await ctx.db
    .query("payments")
    .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();

  let verifiedTotal = 0;
  let refundedTotal = 0;
  for (const p of payments) {
    if (p.paymentStatus === "VERIFIED") verifiedTotal += p.amount;
    if (p.paymentStatus === "REFUNDED") refundedTotal += p.amount;
  }

  let newPaymentStatus: "PENDING" | "DOWNPAYMENT" | "PAID" | "REFUNDED" = order.paymentStatus;
  if (refundedTotal >= order.totalAmount && payments.length > 0) {
    newPaymentStatus = "REFUNDED";
  } else if (verifiedTotal >= order.totalAmount) {
    newPaymentStatus = "PAID";
  } else if (verifiedTotal > 0) {
    newPaymentStatus = "DOWNPAYMENT";
  } else {
    newPaymentStatus = "PENDING";
  }

  await ctx.runMutation(internal.orders.mutations.index.updateOrderStats, {
    orderId: order._id,
    paymentStatus: newPaymentStatus,
  });

  return { success: true, paymentStatus: newPaymentStatus };
};


