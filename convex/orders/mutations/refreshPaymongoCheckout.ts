import { ActionCtx } from '../../_generated/server';
import { Infer, v } from 'convex/values';
import { internal, api } from '../../_generated/api';
import { checkCheckoutExpiry } from '../../payments/actions/paymongoService';
import { Doc } from '../../_generated/dataModel';

export const refreshPaymongoCheckoutArgs = v.object({
  orderId: v.id('orders'),
});

export const refreshPaymongoCheckoutReturns = v.object({
  checkoutUrl: v.string(),
  isExpired: v.boolean(),
});

export const refreshPaymongoCheckoutHandler = async (
  ctx: ActionCtx,
  args: Infer<typeof refreshPaymongoCheckoutArgs>
): Promise<Infer<typeof refreshPaymongoCheckoutReturns>> => {
  // Get current user from action context
  const userId = await ctx.auth.getUserIdentity();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Get current user data
  const currentUser = await ctx.runQuery(api.users.queries.index.getCurrentUser, {
    clerkId: userId.subject,
  });
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Get order data
  const order: Doc<'orders'> | null = await ctx.runQuery(api.orders.queries.index.getOrderById, {
    orderId: args.orderId,
  });
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.isDeleted) {
    throw new Error('Order not found');
  }

  // Check if this order is part of a checkout session
  if (order.checkoutId) {
    // Handle grouped payment refresh
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: order.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Check if Paymongo checkout exists and is not expired
    if (session.paymongoCheckoutCreatedAt) {
      const isExpired = checkCheckoutExpiry(session.paymongoCheckoutCreatedAt);
      if (!isExpired && session.paymongoCheckoutUrl) {
        // Return existing checkout URL if not expired
        return {
          checkoutUrl: session.paymongoCheckoutUrl,
          isExpired: false,
        };
      }
    }

    // Fall back to Xendit check for backward compatibility
    if (session.xenditInvoiceCreatedAt) {
      const isExpired = checkCheckoutExpiry(session.xenditInvoiceCreatedAt);
      if (!isExpired && session.xenditInvoiceUrl) {
        return {
          checkoutUrl: session.xenditInvoiceUrl,
          isExpired: false,
        };
      }
    }

    // Refresh grouped checkout
    try {
      const newCheckout = await ctx.runAction(internal.payments.actions.createGroupedPaymongoCheckout.createGroupedPaymongoCheckoutInternal, {
        checkoutId: order.checkoutId,
      });

      return {
        checkoutUrl: newCheckout.checkoutUrl,
        isExpired: true,
      };
    } catch (error) {
      console.error('Failed to refresh grouped Paymongo checkout:', error);
      throw new Error('Failed to refresh payment link. Please try again.');
    }
  }

  // Single order payment
  // Check if Paymongo checkout exists and is not expired
  if (order.paymongoCheckoutCreatedAt) {
    const isExpired = checkCheckoutExpiry(order.paymongoCheckoutCreatedAt);
    if (!isExpired && order.paymongoCheckoutUrl) {
      return {
        checkoutUrl: order.paymongoCheckoutUrl,
        isExpired: false,
      };
    }
  }

  // Fall back to Xendit check for backward compatibility
  if (order.xenditInvoiceCreatedAt) {
    const isExpired = checkCheckoutExpiry(order.xenditInvoiceCreatedAt);
    if (!isExpired && order.xenditInvoiceUrl) {
      return {
        checkoutUrl: order.xenditInvoiceUrl,
        isExpired: false,
      };
    }
  }

  // Create new Paymongo checkout
  try {
    const newCheckout = await ctx.runAction(internal.payments.actions.paymongoService.createPaymongoCheckout, {
      orderId: args.orderId,
      amount: order.totalAmount,
      customerEmail: order.customerInfo.email ?? currentUser.email ?? '',
      externalId: order.orderNumber || `order-${args.orderId}`,
    });

    // Update order with new checkout details using a mutation
    await ctx.runMutation(internal.orders.mutations.index.updateOrderPaymongoCheckout, {
      orderId: args.orderId,
      paymongoCheckoutId: newCheckout.checkoutId,
      paymongoCheckoutUrl: newCheckout.checkoutUrl,
      paymongoCheckoutExpiryDate: newCheckout.expiryDate,
    });

    return {
      checkoutUrl: newCheckout.checkoutUrl,
      isExpired: true,
    };
  } catch (error) {
    console.error('Failed to refresh Paymongo checkout:', error);
    throw new Error('Failed to refresh payment link. Please try again.');
  }
};
