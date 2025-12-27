'use node';

import { action, internalAction, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { api } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import { Doc } from '../../_generated/dataModel';

/**
 * Internal action to create a grouped Xendit invoice for a checkout session
 * This creates a single payment link for multiple orders
 */
export const createGroupedXenditInvoiceInternal = internalAction({
  args: {
    checkoutId: v.string(),
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx: ActionCtx, args: { checkoutId: string }): Promise<{ invoiceId: string; invoiceUrl: string; expiryDate: number }> => {
    // Get checkout session
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Get all orders in the session
    const orders = await Promise.all(
      session.orderIds.map((orderId: Id<'orders'>) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId }))
    );

    const validOrders = orders.filter((order: Doc<'orders'> | null): order is Doc<'orders'> => {
      return order !== null && !order.isDeleted;
    });

    if (validOrders.length === 0) {
      throw new Error('No valid orders found in checkout session');
    }

    // Get customer email from first order
    const customerEmail = validOrders[0]?.customerInfo?.email;
    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    // Calculate total amount
    const totalAmount = validOrders.reduce((sum: number, order: Doc<'orders'>) => sum + order.totalAmount, 0);

    // Create invoice using internal action
    const invoice = await ctx.runAction(internal.payments.actions.xenditService.createXenditInvoice, {
      orderIds: validOrders.map((o: Doc<'orders'>) => o._id),
      amount: totalAmount,
      customerEmail,
      externalId: `checkout-${args.checkoutId}`,
      checkoutId: args.checkoutId,
    });

    // Update checkout session with invoice details
    await ctx.runMutation(internal.checkoutSessions.mutations.index.updateCheckoutSessionInvoice, {
      checkoutId: args.checkoutId,
      xenditInvoiceId: invoice.invoiceId,
      xenditInvoiceUrl: invoice.invoiceUrl,
      xenditInvoiceExpiryDate: invoice.expiryDate,
    });

    // Update all orders with invoice details
    await ctx.runMutation(internal.orders.mutations.index.updateOrdersInvoiceForSession, {
      checkoutId: args.checkoutId,
      xenditInvoiceId: invoice.invoiceId,
      xenditInvoiceUrl: invoice.invoiceUrl,
      xenditInvoiceExpiryDate: invoice.expiryDate,
    });

    return invoice;
  },
});

/**
 * Public action wrapper for creating grouped Xendit invoices
 * This allows clients to create payment invoices for checkout sessions
 */
export const createGroupedXenditInvoice = action({
  args: {
    checkoutId: v.string(),
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx: ActionCtx, args: { checkoutId: string }): Promise<{ invoiceId: string; invoiceUrl: string; expiryDate: number }> => {
    // Get checkout session first to verify it exists
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Get current user (if authenticated)
    const userId = await ctx.auth.getUserIdentity();
    
    if (userId) {
      // Authenticated user - verify they match the session's customerId or are staff/admin
      const currentUser = await ctx.runQuery(api.users.queries.index.getCurrentUser, {
        clerkId: userId.subject,
      });
      
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Check permissions - user can create invoices for their own sessions, staff/admin can create for any
      if (currentUser._id !== session.customerId && !currentUser.isStaff && !currentUser.isAdmin) {
        throw new Error('You can only create payment links for your own checkout sessions');
      }
    } else {
      // Guest user - allow them to create invoices since they have the checkoutId
      // The checkoutId acts as a secret token that proves ownership
      // Guest users can only create invoices for their own sessions (they wouldn't know other checkoutIds)
    }

    // Call the internal action
    return await ctx.runAction(internal.payments.actions.createGroupedXenditInvoice.createGroupedXenditInvoiceInternal, {
      checkoutId: args.checkoutId,
    });
  },
});
