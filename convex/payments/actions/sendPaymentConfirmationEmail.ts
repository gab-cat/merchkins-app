'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { generatePaymentReceivedEmail } from '../../helpers/emailTemplates/paymentReceived';
import { sendEmail, getNotificationsFromAddress } from '../../helpers/emailTemplates/mailgunClient';

/**
 * Internal action to send payment received email to customer
 * Called via scheduler from the Xendit webhook handler
 * Includes payment confirmation and order status change to Processing
 */
export const sendPaymentConfirmationEmail = internalAction({
  args: {
    orderId: v.id('orders'),
    paymentAmount: v.number(),
    transactionId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get order data
      const order = await ctx.runQuery(internal.orders.queries.index.getOrderByIdInternal, {
        orderId: args.orderId,
      });

      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Get customer email
      const customerEmail = order.customerInfo?.email;
      if (!customerEmail) {
        return { success: false, error: 'Customer email not found' };
      }

      // Build items array from embedded items
      const items = (order.embeddedItems || []).map((item: any) => ({
        name: item.productInfo?.title || 'Product',
        variant: item.productInfo?.variantName,
        quantity: item.quantity,
        price: item.price,
      }));

      // Calculate subtotal
      const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      // Generate payment received email with order status change notification
      const { subject, html } = generatePaymentReceivedEmail({
        customerFirstName: order.customerInfo?.firstName || 'Customer',
        orderNumber: order.orderNumber || String(order._id),
        orderDate: order.orderDate || Date.now(),
        organizationName: order.organizationInfo?.name || 'Merchkins',
        items,
        subtotal,
        discount: order.discountAmount,
        total: order.totalAmount,
        paymentAmount: args.paymentAmount,
        transactionId: args.transactionId,
      });

      // Send via Mailgun
      const result = await sendEmail({
        to: customerEmail,
        subject,
        html,
        from: getNotificationsFromAddress(),
        fromName: order.organizationInfo?.name || 'Merchkins',
      });

      if (!result.success) {
        console.error('Failed to send payment received email:', result.error);
        return { success: false, error: result.error };
      }

      console.log(`Payment received email sent successfully to ${customerEmail} for order ${order.orderNumber}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending payment received email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});
