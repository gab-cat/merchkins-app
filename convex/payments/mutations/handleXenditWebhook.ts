import { MutationCtx } from "../../_generated/server";
import { logAction } from "../../helpers";
import { internal } from "../../_generated/api";
import type { XenditWebhookEvent } from "../../../types/xendit";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";

export const handleXenditWebhookArgs = {
  webhookEvent: v.any(), // Allow any webhook data from Xendit
};


export const handleXenditWebhookHandler = async (
  ctx: MutationCtx,
  args: { webhookEvent: XenditWebhookEvent },
) => {
  const webhookEvent = args.webhookEvent;
  // Only process successful payments
  if (webhookEvent.status !== "PAID") {
    console.log(`Ignoring webhook event with status: ${webhookEvent.status}`);
    return { processed: false, reason: "Not a successful payment" };
  }

  // Find the order by external_id (should match order number)
  const orderNumber = webhookEvent.external_id;
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
    .filter((q) => q.eq(q.field("orderNumber"), orderNumber))
    .first();

  if (!orders) {
    console.error(`Order not found for external_id: ${orderNumber}`);
    throw new Error("Order not found");
  }

  const order = orders;

  // Check if payment already exists for this order and transaction
  const existingPayment = await ctx.db
    .query("payments")
    .withIndex("by_order", (q) => q.eq("orderId", order._id))
    .filter((q) =>
      q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("transactionId"), webhookEvent.id),
        q.eq(q.field("paymentProvider"), "XENDIT"),
      ),
    )
    .first();

  if (existingPayment) {
    console.log(`Payment already processed for transaction: ${webhookEvent.id}`);
    return { processed: true, reason: "Payment already exists" };
  }

  // Create payment record
  const now = Date.now();
  const paymentAmount = webhookEvent.paid_amount || webhookEvent.amount;
  const processingFee = webhookEvent.fees_paid_amount || 0;
  const netAmount = Math.max(0, paymentAmount - processingFee);

  const paymentDoc = {
    isDeleted: false,
    organizationId: order.organizationId,
    orderId: order._id,
    userId: order.customerId,
    processedById: undefined, // System processed
    paymentDate: now,
    amount: paymentAmount,
    processingFee: processingFee || undefined,
    netAmount,
    paymentMethod: "XENDIT" as const,
    paymentSite: "OFFSITE" as const,
    paymentStatus: "VERIFIED" as const,
    referenceNo: `XENDIT-${webhookEvent.id}`,
    currency: webhookEvent.currency,
    transactionId: webhookEvent.id,
    paymentProvider: "XENDIT",
    xenditInvoiceId: webhookEvent.id,
    metadata: webhookEvent as unknown as Record<string, unknown>,

    // Embedded order info
    orderInfo: {
      orderNumber: order.orderNumber,
      customerName: order.customerInfo.firstName
        ? `${order.customerInfo.firstName} ${order.customerInfo.lastName || ""}`.trim()
        : order.customerInfo.email,
      customerEmail: order.customerInfo.email,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      status: order.status,
    },

    // Embedded user info
    userInfo: {
      firstName: order.customerInfo.firstName,
      lastName: order.customerInfo.lastName,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      imageUrl: order.customerInfo.imageUrl,
    },

    verificationDate: now,
    reconciliationStatus: "MATCHED" as const,

    statusHistory: [
      {
        status: "VERIFIED",
        changedBy: undefined, // System
        changedByName: "Xendit Payment System",
        reason: "Payment verified via webhook",
        changedAt: now,
      },
    ],

    createdAt: now,
    updatedAt: now,
  };

  const paymentId = await ctx.db.insert("payments", paymentDoc);

  // Update order status to CONFIRMED and payment status to PAID
  await ctx.db.patch(order._id, {
    status: "PROCESSING", // Move to processing as payment is confirmed
    paymentStatus: "PAID",
    updatedAt: now,
  });

  // Update order status history
  const statusUpdate = {
    status: "PROCESSING",
    changedBy: undefined, // System
    changedByName: "Xendit Payment System",
    reason: "Payment confirmed via webhook",
    changedAt: now,
  };

  // Get current recentStatusHistory and add new entry
  const currentHistory = order.recentStatusHistory || [];
  const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)]; // Keep last 5 entries

  await ctx.db.patch(order._id, {
    recentStatusHistory: updatedHistory as Doc<"orders">["recentStatusHistory"], // Type assertion needed due to Convex schema limitations
    updatedAt: now,
  });

  // Recalculate order payment stats
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: order._id,
    actorId: undefined, // System
    actorName: "Xendit Payment System",
  });

  // Log the payment event
  await logAction(
    ctx,
    "xendit_payment_received",
    "SYSTEM_EVENT",
    "HIGH",
    `Payment of ${paymentAmount} ${webhookEvent.currency} received via Xendit for order ${orderNumber}`,
    undefined, // System action
    order.organizationId,
    {
      paymentId,
      orderId: order._id,
      amount: paymentAmount,
      transactionId: webhookEvent.id,
      provider: "XENDIT",
    },
  );

  console.log(`Successfully processed Xendit payment for order ${orderNumber}`);
  return {
    processed: true,
    paymentId,
    orderId: order._id,
  };
};
