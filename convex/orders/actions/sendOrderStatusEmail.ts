'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { generateShippingUpdateEmail, ShippingStatus } from '../../helpers/emailTemplates/shippingUpdate';
import { sendEmail, getNotificationsFromAddress } from '../../helpers/emailTemplates/mailgunClient';

/**
 * Internal action to send order status update email
 * Called via scheduler when order status changes to READY or DELIVERED
 */
export const sendOrderStatusEmail = internalAction({
  args: {
    orderId: v.id('orders'),
    newStatus: v.union(v.literal('READY'), v.literal('DELIVERED')),
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

      // Map order status to shipping status
      let shippingStatus: ShippingStatus;
      if (args.newStatus === 'READY') {
        shippingStatus = 'READY_FOR_PICKUP';
      } else if (args.newStatus === 'DELIVERED') {
        shippingStatus = 'DELIVERED';
      } else {
        return { success: false, error: 'Invalid status for email notification' };
      }

      // Generate shipping update email
      const { subject, html } = generateShippingUpdateEmail({
        customerFirstName: order.customerInfo?.firstName || 'Customer',
        orderNumber: order.orderNumber || String(order._id),
        status: shippingStatus,
        deliveredAt: args.newStatus === 'DELIVERED' ? Date.now() : undefined,
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
        console.error('Failed to send order status email:', result.error);
        return { success: false, error: result.error };
      }

      console.log(`Order status email (${args.newStatus}) sent successfully to ${customerEmail} for order ${order.orderNumber}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending order status email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});
