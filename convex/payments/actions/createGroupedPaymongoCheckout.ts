'use node';

import { internalAction, action } from '../../_generated/server';
import { v } from 'convex/values';
import { internal, api } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';

// UUID v4 validation regex
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Type for checkout result
type CheckoutResult = {
  checkoutId: string;
  checkoutUrl: string;
  expiryDate: number;
};

/**
 * Internal action to create a grouped Paymongo checkout for a checkout session
 * This is called by the refresh checkout action
 */
export const createGroupedPaymongoCheckoutInternal = internalAction({
  args: {
    checkoutId: v.string(),
  },
  returns: v.object({
    checkoutId: v.string(),
    checkoutUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx, args): Promise<CheckoutResult> => {
    // Validate checkoutId format
    if (!UUID_V4_REGEX.test(args.checkoutId)) {
      throw new Error('Invalid checkout ID format');
    }

    // Get checkout session
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Check session expiry
    if (session.expiresAt && session.expiresAt < Date.now()) {
      throw new Error('Checkout session has expired');
    }

    // Get orders
    const orders = await Promise.all(
      session.orderIds.map((orderId: Id<'orders'>) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId }))
    );

    const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

    if (validOrders.length === 0) {
      throw new Error('No valid orders found in checkout session');
    }

    // Calculate total and get customer info
    const totalAmount = validOrders.reduce((sum: number, order) => sum + order.totalAmount, 0);
    const firstOrder = validOrders[0];
    const customerEmail = firstOrder.customerInfo.email;
    const customerName = firstOrder.customerInfo.firstName
      ? `${firstOrder.customerInfo.firstName} ${firstOrder.customerInfo.lastName || ''}`.trim()
      : undefined;

    // Build external ID
    const externalId = `checkout-${args.checkoutId}`;

    // Create Paymongo checkout
    const checkout: CheckoutResult = await ctx.runAction(internal.payments.actions.paymongoService.createPaymongoCheckout, {
      orderIds: session.orderIds,
      amount: totalAmount,
      customerEmail,
      externalId,
      checkoutId: args.checkoutId,
      customerName,
    });

    // Update checkout session with new Paymongo checkout details
    await ctx.runMutation(internal.checkoutSessions.mutations.index.updateCheckoutSessionPaymongoCheckout, {
      checkoutId: args.checkoutId,
      paymongoCheckoutId: checkout.checkoutId,
      paymongoCheckoutUrl: checkout.checkoutUrl,
      paymongoCheckoutExpiryDate: checkout.expiryDate,
    });

    // Update all orders with the new checkout details
    for (const order of validOrders) {
      await ctx.runMutation(internal.orders.mutations.index.updateOrderPaymongoCheckout, {
        orderId: order._id,
        paymongoCheckoutId: checkout.checkoutId,
        paymongoCheckoutUrl: checkout.checkoutUrl,
        paymongoCheckoutExpiryDate: checkout.expiryDate,
      });
    }

    return {
      checkoutId: checkout.checkoutId,
      checkoutUrl: checkout.checkoutUrl,
      expiryDate: checkout.expiryDate,
    };
  },
});

/**
 * Public action for creating a grouped Paymongo checkout
 * Includes security guards for rate limiting and validation
 */
export const createGroupedPaymongoCheckout = action({
  args: {
    checkoutId: v.string(),
    guestEmail: v.optional(v.string()),
  },
  returns: v.object({
    checkoutId: v.string(),
    checkoutUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx, args): Promise<CheckoutResult> => {
    // Validate checkoutId format (UUID v4)
    if (!UUID_V4_REGEX.test(args.checkoutId)) {
      console.error(`Invalid checkout ID format: ${args.checkoutId}`);
      throw new Error('Invalid checkout ID');
    }

    // Get checkout session
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Check if session has expired
    if (session.expiresAt && session.expiresAt < Date.now()) {
      throw new Error('Checkout session has expired. Please create a new cart.');
    }

    // Check one-time-use flag for existing checkout with strict field validation
    if (session.invoiceCreated) {
      // Validate PayMongo fields - all must be present
      if (session.paymongoCheckoutUrl && session.paymongoCheckoutId && session.paymongoCheckoutExpiryDate) {
        return {
          checkoutId: session.paymongoCheckoutId,
          checkoutUrl: session.paymongoCheckoutUrl,
          expiryDate: session.paymongoCheckoutExpiryDate,
        };
      }
      // Validate Xendit fields (backward compatibility) - all must be present
      if (session.xenditInvoiceUrl && session.xenditInvoiceId && session.xenditInvoiceExpiryDate) {
        return {
          checkoutId: session.xenditInvoiceId,
          checkoutUrl: session.xenditInvoiceUrl,
          expiryDate: session.xenditInvoiceExpiryDate,
        };
      }
      // If invoiceCreated is true but fields are missing, this is an invalid state
      // Fall through to create new checkout (will be handled by atomic check)
    }

    // Try to atomically mark invoice as created
    // This prevents race conditions and handles rate limiting atomically
    const markResult = await ctx.runMutation(internal.checkoutSessions.mutations.index.markInvoiceCreated, {
      checkoutId: args.checkoutId,
    });

    if (!markResult.success) {
      // Invoice already created or rate limited - check if valid checkout exists
      if (session.invoiceCreated) {
        // Re-validate fields (defensive check)
        if (session.paymongoCheckoutUrl && session.paymongoCheckoutId && session.paymongoCheckoutExpiryDate) {
          return {
            checkoutId: session.paymongoCheckoutId,
            checkoutUrl: session.paymongoCheckoutUrl,
            expiryDate: session.paymongoCheckoutExpiryDate,
          };
        }
        if (session.xenditInvoiceUrl && session.xenditInvoiceId && session.xenditInvoiceExpiryDate) {
          return {
            checkoutId: session.xenditInvoiceId,
            checkoutUrl: session.xenditInvoiceUrl,
            expiryDate: session.xenditInvoiceExpiryDate,
          };
        }
      }
      throw new Error(markResult.reason || 'Cannot create checkout');
    }

    // Guest email verification
    if (args.guestEmail) {
      const orders = await Promise.all(
        session.orderIds.map((orderId: Id<'orders'>) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId }))
      );
      // Filter out null orders and deleted orders (defensive - getOrderById already filters, but be explicit)
      const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

      if (validOrders.length === 0) {
        throw new Error('No valid orders found for email verification');
      }

      const firstOrder = validOrders[0];
      const orderEmail = firstOrder.customerInfo.email;

      // Case-insensitive comparison with null safety
      if (orderEmail && orderEmail.toLowerCase() !== args.guestEmail.toLowerCase()) {
        throw new Error('Email verification failed');
      }

      // Also handle case where orderEmail is null/undefined
      if (!orderEmail) {
        throw new Error('Email verification failed: order email not found');
      }
    }

    // Create the checkout via the internal action
    // Note: invoiceCreated flag is already set atomically by markInvoiceCreated above
    const result: CheckoutResult = await ctx.runAction(
      internal.payments.actions.createGroupedPaymongoCheckout.createGroupedPaymongoCheckoutInternal,
      {
        checkoutId: args.checkoutId,
      }
    );

    return result;
  },
});
