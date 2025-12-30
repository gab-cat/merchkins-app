'use node';

// Chatwoot Order Flow - Order Step Handlers
// Handles each step of the order flow based on user selections

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { api, internal } from '../../_generated/api';
import {
  buildSizeSelectionMessage,
  buildQuantityPromptMessage,
  buildNotesPromptMessage,
  buildEmailPromptMessage,
  buildErrorMessage,
  buildCancelMessage,
  buildVariantSelectionMessage,
  sendChatwootMessage,
} from './messageBuilder';
import { SizeOption, ProductVariantOption } from './types';

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

/**
 * Handle variant selection response
 */
export const handleVariantSelectionArgs = {
  sessionId: v.id('messengerOrderSessions'),
  selectedValue: v.string(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleVariantSelection = internalAction({
  args: handleVariantSelectionArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, selectedValue, accountId, conversationId, botToken } = args;

    // Handle cancel (flexible matching)
    const normalizedValue = selectedValue.toLowerCase().trim();
    if (normalizedValue === 'cancel' || normalizedValue.includes('cancel order') || normalizedValue.includes('cancel')) {
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        currentStep: 'CANCELLED',
      });
      await sendChatwootMessage(accountId, conversationId, buildCancelMessage(), botToken);

      // Hand off to human
      await ctx.runAction(api.chatwoot.actions.agentBot.handoffToHuman, {
        accountId,
        conversationId,
        botToken,
      });

      return { success: true, nextStep: 'CANCELLED', reason: 'Order cancelled by user' };
    }

    // Get session to get product ID
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (!session || !session.productId) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Session expired. Please start a new order.'), botToken);
      return { success: false, reason: 'Session not found' };
    }

    // Get product to find variant details
    const product = await ctx.runQuery(api.products.queries.index.getProductById, {
      productId: session.productId,
    });

    if (!product) {
      return { success: false, reason: 'Product not found' };
    }

    const variants = (product.variants || []) as ProductVariant[];

    // Try to find variant by ID (format: variant_<id>) or by matching title text
    let variant: ProductVariant | undefined;

    if (selectedValue.startsWith('variant_')) {
      // Direct ID match
      const variantId = selectedValue.replace('variant_', '');
      variant = variants.find((v: ProductVariant) => v.variantId === variantId);
    } else {
      // Try to match by title format: "VariantName - ₱Price" or "VariantName — ₱Price"
      // Extract variant name by removing the price part (handle both dash types)
      const nameMatch = selectedValue.match(/^(.+?)\s*[—-]\s*₱[\d,.]+$/);
      const variantName = nameMatch ? nameMatch[1].trim() : selectedValue.trim();

      // Try exact match first
      variant = variants.find((v: ProductVariant) => v.variantName === variantName);

      // If not found, try case-insensitive match
      if (!variant) {
        const normalizedInput = variantName.toLowerCase();
        variant = variants.find((v: ProductVariant) => v.variantName.toLowerCase() === normalizedInput);
      }

      // If still not found, try partial match (input contains variant name)
      if (!variant) {
        const normalizedInput = variantName.toLowerCase();
        variant = variants.find((v: ProductVariant) => normalizedInput.includes(v.variantName.toLowerCase()));
      }
    }

    if (!variant) {
      console.log('[OrderFlow] Variant not found for:', selectedValue);
      console.log(
        '[OrderFlow] Available variants:',
        variants.map((v) => v.variantName)
      );
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Invalid variant selection. Please try again.'), botToken);
      return { success: false, reason: 'Variant not found' };
    }

    // Check if variant has sizes
    const hasSizes = variant.sizes && variant.sizes.length > 0;

    if (hasSizes) {
      // Update session and send size selection
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        variantId: variant.variantId,
        currentStep: 'SIZE_SELECTION',
      });

      const sizeOptions: SizeOption[] = (variant.sizes as VariantSize[]).map((s: VariantSize) => ({
        sizeId: s.id,
        label: s.label,
        price: s.price,
        isAvailable: s.inventory === undefined || s.inventory > 0,
      }));

      const message = buildSizeSelectionMessage(product.title, variant.variantName, sizeOptions);
      await sendChatwootMessage(accountId, conversationId, message, botToken);

      return { success: true, nextStep: 'SIZE_SELECTION' };
    } else {
      // No sizes - go straight to quantity
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        variantId: variant.variantId,
        currentStep: 'QUANTITY_INPUT',
      });

      const message = buildQuantityPromptMessage(product.title, variant.variantName);
      await sendChatwootMessage(accountId, conversationId, message, botToken);

      return { success: true, nextStep: 'QUANTITY_INPUT' };
    }
  },
});

/**
 * Handle size selection response
 */
export const handleSizeSelectionArgs = {
  sessionId: v.id('messengerOrderSessions'),
  selectedValue: v.string(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleSizeSelection = internalAction({
  args: handleSizeSelectionArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, selectedValue, accountId, conversationId, botToken } = args;

    // Handle cancel (flexible matching)
    const normalizedValue = selectedValue.toLowerCase().trim();
    if (normalizedValue === 'cancel' || normalizedValue.includes('cancel order') || normalizedValue.includes('cancel')) {
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        currentStep: 'CANCELLED',
      });
      await sendChatwootMessage(accountId, conversationId, buildCancelMessage(), botToken);

      // Hand off to human
      await ctx.runAction(api.chatwoot.actions.agentBot.handoffToHuman, {
        accountId,
        conversationId,
        botToken,
      });

      return { success: true, nextStep: 'CANCELLED' };
    }

    // Handle back to variants (flexible matching)
    if (selectedValue === 'back_variant' || normalizedValue.includes('back to variant') || normalizedValue.includes('back')) {
      const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
        conversationId,
      });

      if (!session || !session.productId) {
        return { success: false, reason: 'Session not found' };
      }

      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        variantId: undefined,
        currentStep: 'VARIANT_SELECTION',
      });

      // Re-send variant selection
      const product = await ctx.runQuery(api.products.queries.index.getProductById, {
        productId: session.productId,
      });

      if (product) {
        const variants = (product.variants || []) as ProductVariant[];
        const activeVariants = variants.filter((v: ProductVariant) => v.isActive && v.inventory > 0);
        const variantOptions: ProductVariantOption[] = activeVariants.map((v: ProductVariant) => ({
          variantId: v.variantId,
          variantName: v.variantName,
          price: v.price,
          imageUrl: v.imageUrl,
          hasSizes: Boolean(v.sizes && v.sizes.length > 0),
          isAvailable: v.inventory > 0,
        }));

        const message = buildVariantSelectionMessage(product.title, variantOptions);
        await sendChatwootMessage(accountId, conversationId, message, botToken);
      }

      return { success: true, nextStep: 'VARIANT_SELECTION' };
    }

    // Get session to get product and variant
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (!session || !session.productId || !session.variantId) {
      return { success: false, reason: 'Session not found' };
    }

    // Get product
    const product = await ctx.runQuery(api.products.queries.index.getProductById, {
      productId: session.productId,
    });

    if (!product) {
      return { success: false, reason: 'Product not found' };
    }

    const variants = (product.variants || []) as ProductVariant[];
    const variant = variants.find((v: ProductVariant) => v.variantId === session.variantId);

    // Try to find size by ID (format: size_<id>) or by matching label text
    let sizeId: string | undefined;
    let size: VariantSize | undefined;

    if (selectedValue.startsWith('size_')) {
      // Direct ID match
      sizeId = selectedValue.replace('size_', '');
      size = variant?.sizes?.find((s: VariantSize) => s.id === sizeId);
    } else {
      // Try to match by label format: "Label" or "Label (+₱Price)"
      const labelMatch = selectedValue.match(/^(.+?)(?:\s*\(\+₱[\d,.]+\))?$/);
      const sizeLabel = labelMatch ? labelMatch[1].trim() : selectedValue.trim();

      size = variant?.sizes?.find((s: VariantSize) => s.label === sizeLabel);
      sizeId = size?.id;
    }

    // Update session and ask for quantity
    await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
      sessionId,
      sizeId,
      currentStep: 'QUANTITY_INPUT',
    });

    const message = buildQuantityPromptMessage(product.title, variant?.variantName || 'Selected', size?.label);
    await sendChatwootMessage(accountId, conversationId, message, botToken);

    return { success: true, nextStep: 'QUANTITY_INPUT' };
  },
});

/**
 * Handle quantity input
 */
export const handleQuantityInputArgs = {
  sessionId: v.id('messengerOrderSessions'),
  quantityText: v.string(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleQuantityInput = internalAction({
  args: handleQuantityInputArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, quantityText, accountId, conversationId, botToken } = args;

    // Parse quantity
    const quantity = parseInt(quantityText.trim(), 10);

    if (isNaN(quantity) || quantity < 1 || quantity > 99) {
      await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Please enter a valid quantity between 1 and 99.'), botToken);
      return { success: false, reason: 'Invalid quantity' };
    }

    // Update session and ask for notes
    await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
      sessionId,
      quantity,
      currentStep: 'NOTES_INPUT',
    });

    const message = buildNotesPromptMessage();
    await sendChatwootMessage(accountId, conversationId, message, botToken);

    return { success: true, nextStep: 'NOTES_INPUT' };
  },
});

/**
 * Handle notes input
 */
export const handleNotesInputArgs = {
  sessionId: v.id('messengerOrderSessions'),
  notesText: v.string(),
  accountId: v.number(),
  conversationId: v.number(),
  botToken: v.string(),
};

export const handleNotesInput = internalAction({
  args: handleNotesInputArgs,
  returns: v.object({
    success: v.boolean(),
    nextStep: v.optional(v.string()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { sessionId, notesText, accountId, conversationId, botToken } = args;

    // Handle cancel (flexible matching)
    const normalizedValue = notesText.toLowerCase().trim();
    if (normalizedValue === 'cancel' || normalizedValue.includes('cancel order') || normalizedValue.includes('cancel')) {
      await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
        sessionId,
        currentStep: 'CANCELLED',
      });
      await sendChatwootMessage(accountId, conversationId, buildCancelMessage(), botToken);

      // Hand off to human
      await ctx.runAction(api.chatwoot.actions.agentBot.handoffToHuman, {
        accountId,
        conversationId,
        botToken,
      });

      return { success: true, nextStep: 'CANCELLED' };
    }

    // Handle skip (flexible matching)
    const notes =
      normalizedValue === 'skip_notes' || normalizedValue.includes('skip') || normalizedValue.includes('no notes') ? undefined : notesText.trim();

    // Get session to check if user has email
    const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getActiveSession, {
      conversationId,
    });

    if (!session) {
      return { success: false, reason: 'Session not found' };
    }

    // Update session with notes
    await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.updateSession, {
      sessionId,
      notes,
      currentStep: session.email ? 'CHECKOUT' : 'EMAIL_INPUT',
    });

    if (session.email) {
      // User already has email - proceed to checkout
      await ctx.runAction(internal.chatwoot.orderFlow.completeOrder.completeOrder, {
        sessionId,
        accountId,
        conversationId,
        botToken,
      });
      return { success: true, nextStep: 'CHECKOUT' };
    } else {
      // Need to collect email
      const message = buildEmailPromptMessage();
      await sendChatwootMessage(accountId, conversationId, message, botToken);
      return { success: true, nextStep: 'EMAIL_INPUT' };
    }
  },
});
