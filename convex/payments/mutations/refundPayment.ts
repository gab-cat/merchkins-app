import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, validatePositiveNumber, logAction, requireOrganizationPermission } from "../../helpers";
import { internal } from "../../_generated/api";

export const refundPaymentArgs = {
  paymentId: v.id("payments"),
  refundAmount: v.number(),
  reason: v.optional(v.string()),
} as const;

export const refundPaymentHandler = async (
  ctx: MutationCtx,
  args: { paymentId: Id<"payments">; refundAmount: number; reason?: string },
) => {
  const currentUser = await requireAuthentication(ctx);

  const existing = await ctx.db.get(args.paymentId);
  if (!existing || existing.isDeleted) {
    throw new Error("Payment not found");
  }

  if (existing.organizationId) {
    await requireOrganizationPermission(
      ctx,
      existing.organizationId,
      "MANAGE_PAYMENTS",
      "update",
    );
  } else if (!currentUser.isAdmin && !currentUser.isStaff) {
    throw new Error("Permission denied");
  }

  validatePositiveNumber(args.refundAmount, "Refund amount");
  if (args.refundAmount > existing.amount) {
    throw new Error("Refund amount exceeds payment amount");
  }

  const now = Date.now();
  const newStatus = args.refundAmount === existing.amount ? "REFUNDED" : "REFUND_PENDING";

  await ctx.db.patch(args.paymentId, {
    paymentStatus: newStatus,
    statusHistory: [
      ...existing.statusHistory,
      {
        status: newStatus,
        changedBy: currentUser._id,
        changedByName:
          `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || currentUser.email,
        reason: args.reason ?? "Refund initiated",
        changedAt: now,
      },
    ],
    updatedAt: now,
  });

  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: existing.orderId,
    actorId: currentUser._id,
    actorName:
      `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() ||
      currentUser.email,
  });

  await logAction(
    ctx,
    "refund_payment",
    "DATA_CHANGE",
    "HIGH",
    `Refund ${args.refundAmount} ${existing.currency} for payment ${String(args.paymentId)}`,
    currentUser._id,
    existing.organizationId ?? undefined,
    { paymentId: args.paymentId, orderId: existing.orderId, refundAmount: args.refundAmount },
  );

  return args.paymentId;
};


