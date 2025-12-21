'use node';

// Chatwoot Order Flow - Send Payment Confirmation Message
// Sends Chatwoot message when payment is confirmed for Messenger orders

import { v } from 'convex/values';
import { internalAction } from '../../_generated/server';
import { internal } from '../../_generated/api';
import { sendChatwootMessage, buildOrderConfirmationMessage, buildTextMessage } from './messageBuilder';
import { toBoldFont } from '../fonts';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.merchkins.com';

export const sendPaymentConfirmationChatwootArgs = {
  orderId: v.id('orders'),
  orderNumber: v.string(),
  paymentAmount: v.number(),
};

/**
 * Send payment confirmation message via Chatwoot for Messenger orders
 */
export const sendPaymentConfirmationChatwoot = internalAction({
  args: sendPaymentConfirmationChatwootArgs,
  returns: v.object({
    success: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { orderId, orderNumber, paymentAmount } = args;

    try {
      // Find the messenger order session for this order
      const session = await ctx.runQuery(internal.chatwoot.orderFlow.sessionManager.getSessionByOrderId, {
        orderId,
      });

      if (!session) {
        console.log('[PaymentConfirmation] No messenger session found for order:', orderId);
        return { success: false, reason: 'No messenger session found' };
      }

      const { chatwootConversationId, chatwootAccountId } = session;

      // Get bot token (fallback to env)
      const botToken = process.env.CHATWOOT_BOT_TOKEN;
      if (!botToken) {
        console.error('[PaymentConfirmation] No bot token available');
        return { success: false, reason: 'No bot token configured' };
      }

      // Build order view URL
      const orderUrl = `${APP_URL}/orders/${orderId}`;

      // Build and send confirmation message
      const message = buildTextMessage(
        `${toBoldFont('🎉 Payment Received!')}\n\n` +
          `Your payment of ${toBoldFont(`₱${paymentAmount.toFixed(2)}`)} for order ${toBoldFont(orderNumber)} has been confirmed!\n\n` +
          `✅ Your order is now being processed.\n\n` +
          `📦 View your order: ${orderUrl}\n\n` +
          `Thank you for your purchase! We'll notify you when your order is ready.`
      );

      const sent = await sendChatwootMessage(chatwootAccountId, chatwootConversationId, message, botToken);

      if (sent) {
        console.log('[PaymentConfirmation] Chatwoot message sent for order:', orderNumber);
        return { success: true };
      } else {
        console.error('[PaymentConfirmation] Failed to send Chatwoot message');
        return { success: false, reason: 'Failed to send message' };
      }
    } catch (error) {
      console.error('[PaymentConfirmation] Error sending Chatwoot message:', error);
      return { success: false, reason: String(error) };
    }
  },
});
