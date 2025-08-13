import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  validateStringLength,
  validatePositiveNumber,
  logAction,
  requireOrganizationPermission,
} from "../../helpers";
import { internal } from "../../_generated/api";

export const updatePaymentArgs = {
  paymentId: v.id("payments"),
  // Updatable fields
  amount: v.optional(v.number()),
  processingFee: v.optional(v.number()),
  paymentStatus: v.optional(
    v.union(
      v.literal("VERIFIED"),
      v.literal("PENDING"),
      v.literal("DECLINED"),
      v.literal("PROCESSING"),
      v.literal("FAILED"),
      v.literal("REFUND_PENDING"),
      v.literal("REFUNDED"),
      v.literal("CANCELLED"),
    ),
  ),
  referenceNo: v.optional(v.string()),
  memo: v.optional(v.string()),
  transactionId: v.optional(v.string()),
  metadata: v.optional(v.any()),
} as const;

export const updatePaymentHandler = async (
  ctx: MutationCtx,
  args: {
    paymentId: Id<"payments">;
    amount?: number;
    processingFee?: number;
    paymentStatus?:
      | "VERIFIED"
      | "PENDING"
      | "DECLINED"
      | "PROCESSING"
      | "FAILED"
      | "REFUND_PENDING"
      | "REFUNDED"
      | "CANCELLED";
    referenceNo?: string;
    memo?: string;
    transactionId?: string;
    metadata?: unknown;
  },
) => {
  const currentUser = await requireAuthentication(ctx);

  const existing = await ctx.db.get(args.paymentId);
  if (!existing || existing.isDeleted) {
    throw new Error("Payment not found");
  }

  // Permissions: org-scoped payments require MANAGE_PAYMENTS update; otherwise staff/admin or owner of payment
  if (existing.organizationId) {
    await requireOrganizationPermission(
      ctx,
      existing.organizationId,
      "MANAGE_PAYMENTS",
      "update",
    );
  } else if (
    currentUser._id !== existing.userId &&
    !currentUser.isStaff &&
    !currentUser.isAdmin
  ) {
    throw new Error("Permission denied");
  }

  const updates: Record<string, unknown> = { updatedAt: Date.now() };

  if (args.amount !== undefined) {
    validatePositiveNumber(args.amount, "Payment amount");
    const fee = args.processingFee ?? (existing.processingFee || 0);
    updates.amount = args.amount;
    updates.netAmount = Math.max(0, args.amount - fee);
  }
  if (args.processingFee !== undefined) {
    if (args.processingFee < 0) throw new Error("Processing fee cannot be negative");
    const amt = args.amount ?? existing.amount;
    updates.processingFee = args.processingFee;
    updates.netAmount = Math.max(0, amt - args.processingFee);
  }
  if (args.paymentStatus) {
    updates.paymentStatus = args.paymentStatus;
    updates.statusHistory = [
      ...existing.statusHistory,
      {
        status: args.paymentStatus,
        changedBy: currentUser._id,
        changedByName:
          `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || currentUser.email,
        reason: "Payment status updated",
        changedAt: Date.now(),
      },
    ];
    if (args.paymentStatus === "VERIFIED") {
      updates.verificationDate = Date.now();
    }
  }
  if (args.referenceNo !== undefined) {
    validateStringLength(args.referenceNo, "Reference number", 3, 128);
    // Duplicate check in scope (organization or order)
    if (args.referenceNo !== existing.referenceNo) {
      const dup = await ctx.db
        .query("payments")
        .withIndex("by_reference", (q) => q.eq("referenceNo", args.referenceNo!))
        .filter((q) =>
          q.and(
            q.eq(q.field("isDeleted"), false),
            existing.organizationId
              ? q.eq(q.field("organizationId"), existing.organizationId)
              : q.eq(q.field("orderId"), existing.orderId),
          ),
        )
        .first();
      if (dup && dup._id !== existing._id) {
        throw new Error("Duplicate reference number for this scope");
      }
    }
    updates.referenceNo = args.referenceNo;
  }
  if (args.memo !== undefined) {
    updates.memo = args.memo;
  }
  if (args.transactionId !== undefined) {
    if (args.transactionId && args.transactionId !== existing.transactionId) {
      const dupTxn = await ctx.db
        .query("payments")
        .withIndex("by_order", (q) => q.eq("orderId", existing.orderId))
        .filter((q) =>
          q.and(
            q.eq(q.field("isDeleted"), false),
            q.eq(q.field("transactionId"), args.transactionId!),
          ),
        )
        .first();
      if (dupTxn && dupTxn._id !== existing._id) {
        throw new Error("Duplicate transaction ID for this order");
      }
    }
    updates.transactionId = args.transactionId || undefined;
  }
  if (args.metadata !== undefined) {
    updates.metadata = args.metadata;
  }

  await ctx.db.patch(args.paymentId, updates);

  // Update related order stats
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: existing.orderId,
  });

  await logAction(
    ctx,
    "update_payment",
    "DATA_CHANGE",
    "LOW",
    `Updated payment ${String(args.paymentId)} for order ${existing.orderInfo.orderNumber ?? String(existing.orderId)}`,
    currentUser._id,
    existing.organizationId ?? undefined,
  );

  return args.paymentId;
};


