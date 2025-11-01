import { ActionCtx } from "../../_generated/server";
import { Infer, v } from "convex/values";
import { internal, api } from "../../_generated/api";
import { checkInvoiceExpiry } from "../../payments/actions/xenditService";
import { Doc } from "../../_generated/dataModel";

export const refreshXenditInvoiceArgs = v.object({
  orderId: v.id("orders"),
});

export const refreshXenditInvoiceReturns = v.object({
  invoiceUrl: v.string(),
  isExpired: v.boolean(),
});

export const refreshXenditInvoiceHandler = async (ctx: ActionCtx, args: Infer<typeof refreshXenditInvoiceArgs>): Promise<Infer<typeof refreshXenditInvoiceReturns>> => {
  // Get current user from action context
  const userId = await ctx.auth.getUserIdentity();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Get current user data
  const currentUser = await ctx.runQuery(api.users.queries.index.getCurrentUser, {
    clerkId: userId.subject,
  });
  if (!currentUser) {
    throw new Error("User not found");
  }

  // Get order data
  const order: Doc<"orders"> | null = await ctx.runQuery(api.orders.queries.index.getOrderById, {
    orderId: args.orderId,
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.isDeleted) {
    throw new Error("Order not found");
  }

  // Check permissions - user can refresh their own order, staff/admin can refresh any
  if (
    currentUser._id !== order.customerId &&
    !currentUser.isStaff &&
    !currentUser.isAdmin
  ) {
    throw new Error("You can only refresh payment links for your own orders");
  }

  if (order.isDeleted) {
    throw new Error("Order not found");
  }

  // Check permissions - user can refresh their own order, staff/admin can refresh any
  if (
    currentUser._id !== order.customerId &&
    !currentUser.isStaff &&
    !currentUser.isAdmin
  ) {
    throw new Error("You can only refresh payment links for your own orders");
  }

  // Check if invoice exists and is expired
  if (!order.xenditInvoiceCreatedAt) {
    throw new Error("No payment invoice found for this order");
  }

  // Check if invoice is expired
  const isExpired = checkInvoiceExpiry(order.xenditInvoiceCreatedAt);
  if (!isExpired) {
    // Return existing invoice URL if not expired
    return {
      invoiceUrl: order.xenditInvoiceUrl || "",
      isExpired: false,
    };
  }

  // Create new invoice
  try {
    const newInvoice = await ctx.runAction(internal.payments.actions.xenditService.createXenditInvoice, {
      orderId: args.orderId,
      amount: order.totalAmount,
      customerEmail: order.customerInfo.email,
      externalId: order.orderNumber || `order-${args.orderId}`,
    });

    // Update order with new invoice details using a mutation
    await ctx.runMutation(internal.orders.mutations.index.updateOrderXenditInvoice, {
      orderId: args.orderId,
      xenditInvoiceId: newInvoice.invoiceId,
      xenditInvoiceUrl: newInvoice.invoiceUrl,
      xenditInvoiceExpiryDate: newInvoice.expiryDate,
    });

    return {
      invoiceUrl: newInvoice.invoiceUrl,
      isExpired: true,
    };
  } catch (error) {
    console.error("Failed to refresh Xendit invoice:", error);
    throw new Error("Failed to refresh payment link. Please try again.");
  }
};
