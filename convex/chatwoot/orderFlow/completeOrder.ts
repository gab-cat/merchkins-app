'use node';

// Chatwoot Order Flow - Complete Order
// Creates order, generates payment link, sends confirmation

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { api, internal } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import { buildPaymentLinkMessage, buildErrorMessage, sendChatwootMessage } from './messageBuilder';

// Variant type from product query
interface ProductVariant {
  isActive: boolean;
  variantId: string;
  variantName: string;
  price: number;
  inventory: number;
  imageUrl?: string;
  sizes?: Array<{ id: string; label: string; price?: number; inventory?: number }>;
}

// Size type from variant
interface VariantSize {
  id: string;
  label: string;
  price?: number;
  inventory?: number;
}

export const completeOrderArgs = {
  sessionId: v.id('messengerOrderSessions'),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const completeOrder = internalAction({
  args: completeOrderArgs,
  returns: v.object({
    success: v.boolean(),
    orderId: v.optional(v.id('orders')),
    reason: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    orderId?: Id<'orders'>;
    reason?: string;
  }> => {
    const { sessionId, accountId, conversationId, botToken } = args;

    // Get session
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (!session) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Session expired. Please start a new order.'), botToken);
      return { success: false, reason: 'Session not found' };
    }

    // Validate session has all required data
    if (!session.productId || !session.variantId || !session.quantity || !session.userId) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Order information is incomplete. Please start a new order.'), botToken);
      return { success: false, reason: 'Incomplete session data' };
    }

    // Get product details
    const product = await ctx.runQuery(api.products.queries.index.getProductById, {
      productId: session.productId,
    });

    if (!product) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Product no longer available.'), botToken);
      return { success: false, reason: 'Product not found' };
    }

    // Find variant and size
    const variants = (product.variants || []) as ProductVariant[];
    const variant = variants.find((v: ProductVariant) => v.variantId === session.variantId);
    if (!variant) {
      return { success: false, reason: 'Variant not found' };
    }

    let price = variant.price;
    let sizeLabel: string | undefined;

    if (session.sizeId && variant.sizes) {
      const size = (variant.sizes as VariantSize[]).find((s: VariantSize) => s.id === session.sizeId);
      if (size) {
        sizeLabel = size.label;
        if (size.price) {
          price = size.price;
        }
      }
    }

    const total = price * session.quantity;

    // Create the order using internal mutation
    try {
      const orderId: Id<'orders'> = await ctx.runMutation(internal.chatwoot.orderFlow.createMessengerOrder.createMessengerOrder, {
        organizationId: session.organizationId,
        customerId: session.userId,
        productId: session.productId,
        variantId: session.variantId,
        sizeId: session.sizeId,
        sizeLabel,
        quantity: session.quantity,
        price,
        notes: session.notes,
        productTitle: product.title,
        productSlug: product.slug,
        productImageUrl: product.imageUrl,
        variantName: variant.variantName,
      });

      // Update session with order ID
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        orderId,
        currentStep: 'COMPLETED',
      });

      // Get the order to create invoice
      const order = await ctx.runQuery(api.orders.queries.index.getOrderById, {
        orderId,
      });

      if (!order) {
        return { success: false, reason: 'Order created but not found' };
      }

      // Create Xendit invoice
      const invoice = await ctx.runAction(internal.payments.actions.xenditService.createXenditInvoice, {
        orderId,
        amount: total,
        customerEmail: session.email || '',
        externalId: order.orderNumber || orderId,
      });

      // Update order with invoice details
      await ctx.runMutation(internal.orders.mutations.index.updateOrderXenditInvoice, {
        orderId,
        xenditInvoiceId: invoice.invoiceId,
        xenditInvoiceUrl: invoice.invoiceUrl,
        xenditInvoiceExpiryDate: invoice.expiryDate,
      });

      // Send payment link via Chatwoot
      const message = buildPaymentLinkMessage(product.title, variant.variantName, sizeLabel, session.quantity, total, invoice.invoiceUrl);
      await sendChatwootMessage(accountId, conversationId, message, botToken);

      return { success: true, orderId };
    } catch (error) {
      console.error('[CompleteOrder] Error creating order:', error);
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Failed to create order. Please try again later.'), botToken);
      return { success: false, reason: String(error) };
    }
  },
});
