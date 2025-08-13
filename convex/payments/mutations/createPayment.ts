import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import {
  requireAuthentication,
  validateOrderExists,
  validateUserExists,
  validateOrganizationExists,
  validatePositiveNumber,
  validateStringLength,
  logAction,
  requireOrganizationPermission,
} from "../../helpers";
import { internal } from "../../_generated/api";

export const createPaymentArgs = {
  organizationId: v.optional(v.id("organizations")),
  orderId: v.id("orders"),
  userId: v.id("users"),
  processedById: v.optional(v.id("users")),
  paymentDate: v.optional(v.number()),
  amount: v.number(),
  processingFee: v.optional(v.number()),
  paymentMethod: v.union(
    v.literal("CASH"),
    v.literal("BANK_TRANSFER"),
    v.literal("GCASH"),
    v.literal("MAYA"),
    v.literal("OTHERS"),
  ),
  paymentSite: v.union(v.literal("ONSITE"), v.literal("OFFSITE")),
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
  referenceNo: v.string(),
  memo: v.optional(v.string()),
  currency: v.string(),
  transactionId: v.optional(v.string()),
  paymentProvider: v.optional(v.string()),
  metadata: v.optional(v.any()),
} as const;

export const createPaymentHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<"organizations">;
    orderId: Id<"orders">;
    userId: Id<"users">;
    processedById?: Id<"users">;
    paymentDate?: number;
    amount: number;
    processingFee?: number;
    paymentMethod: "CASH" | "BANK_TRANSFER" | "GCASH" | "MAYA" | "OTHERS";
    paymentSite: "ONSITE" | "OFFSITE";
    paymentStatus?:
      | "VERIFIED"
      | "PENDING"
      | "DECLINED"
      | "PROCESSING"
      | "FAILED"
      | "REFUND_PENDING"
      | "REFUNDED"
      | "CANCELLED";
    referenceNo: string;
    memo?: string;
    currency: string;
    transactionId?: string;
    paymentProvider?: string;
    metadata?: unknown;
  },
) => {
  const currentUser = await requireAuthentication(ctx);

  // Basic validations
  validatePositiveNumber(args.amount, "Payment amount");
  if (args.processingFee !== undefined && args.processingFee < 0) {
    throw new Error("Processing fee cannot be negative");
  }
  validateStringLength(args.referenceNo, "Reference number", 3, 128);
  validateStringLength(args.currency, "Currency", 3, 8);

  // Load and verify related entities
  const order = await validateOrderExists(ctx, args.orderId);
  const payer = await validateUserExists(ctx, args.userId);

  if (order.isDeleted) throw new Error("Order not found or inactive");
  if (order.status === "CANCELLED") {
    throw new Error("Cannot record payment for a cancelled order");
  }

  let organizationInfo:
    | { name: string; slug: string; logo?: string }
    | undefined;
  if (args.organizationId) {
    const organization = await validateOrganizationExists(
      ctx,
      args.organizationId,
    );
    organizationInfo = {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    };
    // Permission within organization
    await requireOrganizationPermission(
      ctx,
      args.organizationId,
      "MANAGE_PAYMENTS",
      "create",
    );
  } else {
    // No organization scope: only the order owner, staff, or admin can create
    if (
      currentUser._id !== order.customerId &&
      !currentUser.isStaff &&
      !currentUser.isAdmin
    ) {
      throw new Error("Permission denied");
    }
    // If not staff/admin, enforce payer is the current user and order customer
    if (!currentUser.isStaff && !currentUser.isAdmin) {
      if (args.userId !== currentUser._id || args.userId !== order.customerId) {
        throw new Error("You can only record payments for your own order");
      }
    }
  }

  // Default processedBy to current staff/admin if not provided
  let processorInfo:
    | { firstName?: string; lastName?: string; email: string; imageUrl?: string }
    | undefined;
  if (args.processedById) {
    const processor = await validateUserExists(ctx, args.processedById);
    processorInfo = {
      firstName: processor.firstName,
      lastName: processor.lastName,
      email: processor.email,
      imageUrl: processor.imageUrl,
    };
  } else if (currentUser.isStaff || currentUser.isAdmin) {
    processorInfo = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
    };
  }

  // Check for duplicate reference numbers within same organization or order
  const existingWithRef = await ctx.db
    .query("payments")
    .withIndex("by_reference", (q) => q.eq("referenceNo", args.referenceNo))
    .filter((q) =>
      q.and(
        q.eq(q.field("isDeleted"), false),
        args.organizationId
          ? q.eq(q.field("organizationId"), args.organizationId)
          : q.eq(q.field("orderId"), args.orderId),
      ),
    )
    .first();
  if (existingWithRef) {
    throw new Error("Duplicate reference number for this scope");
  }

  if (args.transactionId) {
    // Best-effort duplicate detection by scanning order payments
    const existingTxn = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("transactionId"), args.transactionId!),
        ),
      )
      .first();
    if (existingTxn) {
      throw new Error("Duplicate transaction ID for this order");
    }
  }

  const now = Date.now();
  const status = args.paymentStatus ?? "PENDING";
  const processingFee = args.processingFee ?? 0;
  const netAmount = Math.max(0, args.amount - processingFee);

  const paymentDoc = {
    isDeleted: false,
    organizationId: args.organizationId,
    orderId: args.orderId,
    userId: payer._id,
    processedById: args.processedById ?? (currentUser.isStaff || currentUser.isAdmin ? currentUser._id : undefined),

    orderInfo: {
      orderNumber: order.orderNumber,
      customerName: `${order.customerInfo.firstName ?? ""} ${order.customerInfo.lastName ?? ""}`.trim() || order.customerInfo.email,
      customerEmail: order.customerInfo.email,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      status: order.status,
    },

    userInfo: {
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      phone: payer.phone,
      imageUrl: payer.imageUrl,
    },

    processorInfo,
    organizationInfo,

    paymentDate: args.paymentDate ?? now,
    amount: args.amount,
    processingFee: processingFee || undefined,
    netAmount,
    paymentMethod: args.paymentMethod,
    paymentSite: args.paymentSite,
    paymentStatus: status,
    referenceNo: args.referenceNo,
    memo: args.memo,
    currency: args.currency,
    transactionId: args.transactionId,
    paymentProvider: args.paymentProvider,
    metadata: args.metadata,

    verificationDate: status === "VERIFIED" ? now : undefined,
    reconciliationStatus: "PENDING" as const,
    statusHistory: [
      {
        status,
        changedBy: currentUser._id,
        changedByName:
          `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || currentUser.email,
        reason: "Payment created",
        changedAt: now,
      },
    ],

    createdAt: now,
    updatedAt: now,
  };

  const paymentId = await ctx.db.insert("payments", paymentDoc);

  // Recalculate order payment status after creating a payment
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: args.orderId,
  });

  await logAction(
    ctx,
    "create_payment",
    "DATA_CHANGE",
    "MEDIUM",
    `Recorded payment of ${args.amount} ${args.currency} for order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    args.organizationId,
    {
      paymentId,
      orderId: args.orderId,
      amount: args.amount,
      method: args.paymentMethod,
      status,
    },
  );

  return paymentId;
};


