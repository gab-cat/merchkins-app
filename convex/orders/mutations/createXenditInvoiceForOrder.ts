import { mutation, MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers";

/**
 * Public mutation wrapper for updating order Xendit invoice details
 * This allows clients to update order invoice information after creating a payment link
 */
export const createXenditInvoiceForOrderArgs = {
  orderId: v.id("orders"),
  xenditInvoiceId: v.string(),
  xenditInvoiceUrl: v.string(),
  xenditInvoiceExpiryDate: v.number(),
};

export const createXenditInvoiceForOrderHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<"orders">;
    xenditInvoiceId: string;
    xenditInvoiceUrl: string;
    xenditInvoiceExpiryDate: number;
  },
) => {
  // Get current user
  const currentUser = await requireAuthentication(ctx);

  // Get order data
  const order = await ctx.db.get(args.orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.isDeleted) {
    throw new Error("Order not found");
  }

  // Check permissions - user can update invoices for their own orders, staff/admin can update any
  if (
    currentUser._id !== order.customerId &&
    !currentUser.isStaff &&
    !currentUser.isAdmin
  ) {
    throw new Error("You can only update payment links for your own orders");
  }

  // Update the order directly
  await ctx.db.patch(args.orderId, {
    xenditInvoiceId: args.xenditInvoiceId,
    xenditInvoiceUrl: args.xenditInvoiceUrl,
    xenditInvoiceExpiryDate: args.xenditInvoiceExpiryDate,
    xenditInvoiceCreatedAt: Date.now(),
    updatedAt: Date.now(),
  });
};

export const createXenditInvoiceForOrder = mutation({
  args: createXenditInvoiceForOrderArgs,
  handler: createXenditInvoiceForOrderHandler,
});

