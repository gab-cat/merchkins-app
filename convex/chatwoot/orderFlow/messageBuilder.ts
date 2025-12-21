// Chatwoot Order Flow - Message Builder
// Builds Chatwoot messages with input_select support

import { InputSelectItem, ChatwootMessagePayload, ProductVariantOption, SizeOption } from './types';
import { toBoldFont } from '../fonts';

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.merchkins.com';

/**
 * Build a text message payload
 */
export function buildTextMessage(content: string): ChatwootMessagePayload {
  return {
    content,
    content_type: 'text',
    message_type: 'outgoing',
    private: false,
  };
}

/**
 * Build an input_select message payload
 */
export function buildInputSelectMessage(content: string, items: InputSelectItem[]): ChatwootMessagePayload {
  return {
    content,
    content_type: 'input_select',
    content_attributes: {
      items,
    },
    message_type: 'outgoing',
    private: false,
  };
}

/**
 * Build variant selection message
 */
export function buildVariantSelectionMessage(productTitle: string, variants: ProductVariantOption[]): ChatwootMessagePayload {
  const items: InputSelectItem[] = variants
    .filter((v) => v.isAvailable)
    .map((v) => ({
      title: `${v.variantName} - ₱${v.price.toFixed(2)}`,
      value: `variant_${v.variantId}`,
    }));

  // Add cancel option
  items.push({
    title: '❌ Cancel Order',
    value: 'cancel',
  });

  return buildInputSelectMessage(`📦 ${toBoldFont(productTitle)}\n\nPlease select a variant:`, items);
}

/**
 * Build size selection message
 */
export function buildSizeSelectionMessage(productTitle: string, variantName: string, sizes: SizeOption[]): ChatwootMessagePayload {
  const items: InputSelectItem[] = sizes
    .filter((s) => s.isAvailable)
    .map((s) => ({
      title: s.price ? `${s.label} (+₱${s.price.toFixed(2)})` : s.label,
      value: `size_${s.sizeId}`,
    }));

  // Add back option
  items.push({
    title: '⬅️ Back to variants',
    value: 'back_variant',
  });

  items.push({
    title: '❌ Cancel Order',
    value: 'cancel',
  });

  return buildInputSelectMessage(`📦 ${toBoldFont(productTitle)} - ${variantName}\n\nPlease select a size:`, items);
}

/**
 * Build quantity input prompt
 */
export function buildQuantityPromptMessage(productTitle: string, variantName: string, size?: string): ChatwootMessagePayload {
  const selection = size ? `${variantName} (${size})` : variantName;
  return buildTextMessage(`📦 ${toBoldFont(productTitle)} - ${selection}\n\nHow many would you like to order? Please reply with a number (1-99):`);
}

/**
 * Build notes input prompt
 */
export function buildNotesPromptMessage(): ChatwootMessagePayload {
  const items: InputSelectItem[] = [
    { title: '⏩ Skip (No notes)', value: 'skip_notes' },
    { title: '❌ Cancel Order', value: 'cancel' },
  ];

  return buildInputSelectMessage('📝 Any special notes or instructions for your order?\n\nYou can type your notes or select an option:', items);
}

/**
 * Build email input prompt
 */
export function buildEmailPromptMessage(): ChatwootMessagePayload {
  return buildTextMessage('📧 To complete your order, please provide your email address:\n\n(We will send you an OTP code to verify your email)');
}

/**
 * Build OTP verification prompt
 */
export function buildOTPPromptMessage(email: string): ChatwootMessagePayload {
  return buildTextMessage(`📧 We sent a verification code to ${toBoldFont(email)}.\n\nPlease enter the 6-digit code:`);
}

/**
 * Build order summary and payment link message
 */
export function buildPaymentLinkMessage(
  productTitle: string,
  variantName: string,
  size: string | undefined,
  quantity: number,
  total: number,
  paymentUrl: string
): ChatwootMessagePayload {
  const selection = size ? `${variantName} (${size})` : variantName;
  return buildTextMessage(
    `${toBoldFont('✅ Order Created!')}\n\n` +
      `📦 ${productTitle}\n` +
      `   ${selection} x${quantity}\n\n` +
      `${toBoldFont(`💰 Total: ₱${total.toFixed(2)}`)}\n\n` +
      `🔗 Pay here: ${paymentUrl}\n\n` +
      `Thank you for your order! You will receive a confirmation once payment is received.`
  );
}

/**
 * Build order confirmation message (after payment)
 */
export function buildOrderConfirmationMessage(orderNumber: string): ChatwootMessagePayload {
  return buildTextMessage(
    `${toBoldFont('🎉 Payment Received!')}\n\n` +
      `Your order ${toBoldFont(orderNumber)} has been confirmed and is now being processed.\n\n` +
      `We'll keep you updated on the status. Thank you!`
  );
}

/**
 * Build error message
 */
export function buildErrorMessage(message: string): ChatwootMessagePayload {
  return buildTextMessage(`❌ ${message}`);
}

/**
 * Build cancel confirmation message
 */
export function buildCancelMessage(): ChatwootMessagePayload {
  return buildTextMessage('❌ Order cancelled.\n\nYou can start a new order anytime by sending a product code (e.g., CODE: PROD123).');
}
/**
 * Send message to Chatwoot conversation
 */
export async function sendChatwootMessage(
  accountId: number,
  conversationId: number,
  payload: ChatwootMessagePayload,
  botToken: string
): Promise<boolean> {
  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_access_token: botToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chatwoot OrderFlow] Failed to send message:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Chatwoot OrderFlow] Error sending message:', error);
    return false;
  }
}

/**
 * Download an image from URL and upload it as a Chatwoot attachment
 */
export async function sendChatwootImageAttachment(
  accountId: number,
  conversationId: number,
  imageUrl: string,
  caption: string,
  botToken: string
): Promise<boolean> {
  const url = `${CHATWOOT_BASE_URL}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;

  try {
    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('[Chatwoot OrderFlow] Failed to download image:', imageUrl);
      return false;
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Determine file extension from content type
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
    };
    const ext = extMap[contentType] || 'jpg';
    const filename = `product_image.${ext}`;

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('content', caption);
    formData.append('message_type', 'outgoing');
    formData.append('private', 'false');

    // Create blob and append as attachment
    const blob = new Blob([imageBuffer], { type: contentType });
    formData.append('attachments[]', blob, filename);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        api_access_token: botToken,
        // Don't set Content-Type - let fetch set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chatwoot OrderFlow] Failed to send attachment:', response.status, errorText);
      return false;
    }

    console.log('[Chatwoot OrderFlow] Image attachment sent successfully');
    return true;
  } catch (error) {
    console.error('[Chatwoot OrderFlow] Error sending attachment:', error);
    return false;
  }
}

/**
 * Build product info message with details
 */
export function buildProductInfoMessage(
  title: string,
  description: string | undefined,
  tags: string[],
  minPrice: number | undefined,
  maxPrice: number | undefined,
  rating: number,
  reviewsCount: number,
  totalOrders: number,
  fulfillmentDays: number | undefined,
  inventoryType: 'PREORDER' | 'STOCK'
): ChatwootMessagePayload {
  let content = `📦 ${toBoldFont(title)}\n\n`;

  // Description (truncated if too long)
  if (description) {
    const truncatedDesc = description.length > 200 ? description.substring(0, 200) + '...' : description;
    content += `${truncatedDesc}\n\n`;
  }

  // Price range
  if (minPrice !== undefined && maxPrice !== undefined) {
    if (minPrice === maxPrice) {
      content += `💰 ${toBoldFont('Price:')} ₱${minPrice.toFixed(2)}\n`;
    } else {
      content += `💰 ${toBoldFont('Price:')} ₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}\n`;
    }
  }

  // Ratings and reviews
  if (reviewsCount > 0) {
    const stars = '⭐'.repeat(Math.round(rating));
    content += `${stars} ${rating.toFixed(1)} (${reviewsCount} reviews)\n`;
  }

  // Total orders
  if (totalOrders > 0) {
    content += `📊 ${totalOrders} orders\n`;
  }

  // Fulfillment info
  if (inventoryType === 'PREORDER') {
    content += `⏳ ${toBoldFont('Pre-order')} - Ships in ${fulfillmentDays || 7} days\n`;
  } else if (fulfillmentDays) {
    content += `🚚 Ready in ${fulfillmentDays} days\n`;
  }

  // Tags
  if (tags.length > 0) {
    const tagStr = tags
      .slice(0, 5)
      .map((t) => `#${t}`)
      .join(' ');
    content += `\n🏷️ ${tagStr}`;
  }

  return buildTextMessage(content);
}
