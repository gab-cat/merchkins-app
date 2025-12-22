'use node';

// Chatwoot Order Flow - Start Order Flow Action
// Triggered when user sends CODE: PRODUCTCODE

import { v } from 'convex/values';
import { internalAction, ActionCtx } from '../../_generated/server';
import { api, internal } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import {
  buildVariantSelectionMessage,
  buildErrorMessage,
  sendChatwootMessage,
  sendChatwootImageAttachment,
  buildProductInfoMessage,
} from './messageBuilder';
import { toBoldFont } from '../fonts';
import { ProductVariantOption } from './types';

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

export const startOrderFlowArgs = {
  productId: v.id('products'),
  productCode: v.optional(v.string()),
  conversationId: v.number(),
  accountId: v.number(),
  contactId: v.number(),
  inboxName: v.optional(v.string()),
  botToken: v.string(),
};

export const startOrderFlowHandler = async (
  ctx: ActionCtx,
  args: {
    productId: Id<'products'>;
    productCode?: string;
    conversationId: number;
    accountId: number;
    contactId: number;
    inboxName?: string;
    botToken: string;
  }
): Promise<{ success: boolean; sessionId?: Id<'messengerOrderSessions'>; reason?: string }> => {
  const { productId, productCode, conversationId, accountId, contactId, botToken } = args;

  // Get full product details
  const product = await ctx.runQuery(api.products.queries.index.getProductById, {
    productId,
  });

  if (!product || product.isDeleted) {
    await sendChatwootMessage(accountId, conversationId, buildErrorMessage('Product not found. Please try another product code.'), botToken);
    return { success: false, reason: 'Product not found' };
  }

  // Check if product has active variants
  const variants = (product.variants || []) as ProductVariant[];
  const activeVariants = variants.filter((v: ProductVariant) => v.isActive && v.inventory > 0);

  if (activeVariants.length === 0) {
    await sendChatwootMessage(accountId, conversationId, buildErrorMessage('This product is currently out of stock.'), botToken);
    return { success: false, reason: 'No available variants' };
  }

  // Check if user already exists by contact ID
  const existingUser = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getUserByContact, { chatwootContactId: contactId });

  // Get organization ID from product
  const organizationId = product.organizationId;

  // Create order session
  const sessionId: Id<'messengerOrderSessions'> = await ctx.runMutation(internal.chatwoot.orderFlow.sessionManager.createSession, {
    chatwootConversationId: conversationId,
    chatwootAccountId: accountId,
    chatwootContactId: contactId,
    organizationId,
    productId,
    productCode,
    userId: existingUser?._id,
    email: existingUser?.email,
  });

  // Build variant options
  const variantOptions: ProductVariantOption[] = activeVariants.map((v: ProductVariant) => ({
    variantId: v.variantId,
    variantName: v.variantName,
    price: v.price,
    imageUrl: v.imageUrl,
    hasSizes: Boolean(v.sizes && v.sizes.length > 0),
    isAvailable: v.inventory > 0,
  }));

  // Build R2 public URL
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-bef9c89ebd5d427c9bf90c155b9b8fd0.r2.dev';
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

  // Build product URL
  const organizationSlug = product.organizationInfo?.slug || '';
  const productSlug = product.slug;
  const productUrl = organizationSlug ? `${APP_URL}/o/${organizationSlug}/p/${productSlug}` : '';

  // Send product image with details as attachment (if available)
  const productImageUrl = product.imageUrl?.[0];
  if (productImageUrl) {
    const fullImageUrl = productImageUrl.startsWith('http') ? productImageUrl : `${R2_PUBLIC_URL}/${productImageUrl}`;

    // Build professional product info caption
    let caption = `${toBoldFont(product.title)}`;

    // Add description (truncated)
    if (product.description) {
      const truncatedDesc = product.description.length > 150 ? product.description.substring(0, 150) + '...' : product.description;
      caption += `\n\n${truncatedDesc}`;
    }

    // Add price range
    if (product.minPrice !== undefined && product.maxPrice !== undefined) {
      if (product.minPrice === product.maxPrice) {
        caption += `\n\n${toBoldFont('Price:')} ₱${product.minPrice.toFixed(2)}`;
      } else {
        caption += `\n\n${toBoldFont('Price:')} ₱${product.minPrice.toFixed(2)} — ₱${product.maxPrice.toFixed(2)}`;
      }
    }

    // Add ratings if available
    if (product.reviewsCount > 0) {
      caption += `\n${toBoldFont('Rating:')} ${product.rating.toFixed(1)} ★ (${product.reviewsCount} reviews)`;
    }

    // Add order count if available
    if (product.totalOrders && product.totalOrders > 0) {
      caption += `\n${toBoldFont('Sold:')} ${product.totalOrders} orders`;
    }

    // Add fulfillment info
    if (product.inventoryType === 'PREORDER') {
      caption += `\n${toBoldFont('Type:')} Pre-order (ships in ${product.fulfillmentDays || 7} days)`;
    } else if (product.fulfillmentDays) {
      caption += `\n${toBoldFont('Delivery:')} Ready in ${product.fulfillmentDays} days`;
    }

    // Add tags
    if (product.tags && product.tags.length > 0) {
      const tagStr = product.tags
        .slice(0, 5)
        .map((t: string) => `#${t}`)
        .join(' ');
      caption += `\n\n${tagStr}`;
    }

    // Add product URL at the bottom
    if (productUrl) {
      caption += `\n\n${toBoldFont('View Product:')}\n${productUrl}`;
    }

    // Try to send as attachment, fall back to text message if it fails
    const attachmentSent = await sendChatwootImageAttachment(accountId, conversationId, fullImageUrl, caption, botToken);

    if (!attachmentSent) {
      // Fallback: send text message without image URL, just product URL
      await sendChatwootMessage(
        accountId,
        conversationId,
        { content: caption, content_type: 'text', message_type: 'outgoing', private: false },
        botToken
      );
    }
  } else {
    // No image - just send product info with product URL
    const productInfoMessage = buildProductInfoMessage(
      product.title,
      product.description,
      product.tags || [],
      product.minPrice,
      product.maxPrice,
      product.rating,
      product.reviewsCount,
      product.totalOrders || 0,
      product.fulfillmentDays,
      product.inventoryType,
      productUrl
    );
    await sendChatwootMessage(accountId, conversationId, productInfoMessage, botToken);
  }

  // Send variant selection message
  const message = buildVariantSelectionMessage(product.title, variantOptions);
  const sent = await sendChatwootMessage(accountId, conversationId, message, botToken);

  return {
    success: sent,
    sessionId,
    reason: sent ? 'Variant selection sent' : 'Failed to send message',
  };
};

export const startOrderFlow = internalAction({
  args: startOrderFlowArgs,
  returns: v.object({
    success: v.boolean(),
    sessionId: v.optional(v.id('messengerOrderSessions')),
    reason: v.optional(v.string()),
  }),
  handler: startOrderFlowHandler,
});
