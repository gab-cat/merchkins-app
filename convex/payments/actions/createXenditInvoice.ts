"use node";

import { action, ActionCtx } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { api } from "../../_generated/api";

/**
 * Public action wrapper for creating Xendit invoices
 * This allows clients to create payment invoices for orders
 */
export const createXenditInvoice = action({
  args: {
    orderId: v.id("orders"),
    amount: v.number(),
    customerEmail: v.string(),
    externalId: v.string(),
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx: ActionCtx, args): Promise<{ invoiceId: string; invoiceUrl: string; expiryDate: number }> => {
    // Get current user
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
    const order = await ctx.runQuery(api.orders.queries.index.getOrderById, {
      orderId: args.orderId,
    });
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.isDeleted) {
      throw new Error("Order not found");
    }

    // Check permissions - user can create invoices for their own orders, staff/admin can create for any
    if (
      currentUser._id !== order.customerId &&
      !currentUser.isStaff &&
      !currentUser.isAdmin
    ) {
      throw new Error("You can only create payment links for your own orders");
    }

    // Call the internal action
    return await ctx.runAction(internal.payments.actions.xenditService.createXenditInvoice, {
      orderId: args.orderId,
      amount: args.amount,
      customerEmail: args.customerEmail,
      externalId: args.externalId,
    });
  },
});

