'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { Xendit } from 'xendit-node';

/**
 * Helper function to check if an invoice is expired (more than 24 hours old)
 */
export function checkInvoiceExpiry(createdAt: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return now - createdAt > twentyFourHours;
}

/**
 * Create a Xendit invoice for payment
 */
export const createXenditInvoice = internalAction({
  args: {
    orderId: v.id('orders'),
    amount: v.number(),
    customerEmail: v.string(),
    externalId: v.string(),
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx, args) => {
    const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!xenditSecretKey) {
      throw new Error('XENDIT_SECRET_KEY environment variable is not set');
    }

    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    const xenditClient = new Xendit({
      secretKey: xenditSecretKey,
    });

    try {
      const invoiceResponse = await xenditClient.Invoice.createInvoice({
        data: {
          externalId: args.externalId,
          amount: args.amount,
          payerEmail: args.customerEmail,
          description: `Payment for Order #${args.externalId}`,
          successRedirectUrl: `${appUrl}/orders/payment/success?orderId=${args.orderId}`,
          failureRedirectUrl: `${appUrl}/orders/payment/failure?orderId=${args.orderId}`,
        },
      });

      if (!invoiceResponse.invoiceUrl || !invoiceResponse.id) {
        throw new Error('Invalid invoice response from Xendit');
      }

      // Xendit invoices expire after 24 hours
      const createdAt = Date.now();
      const expiryDate = createdAt + 24 * 60 * 60 * 1000; // 24 hours from now

      return {
        invoiceId: invoiceResponse.id,
        invoiceUrl: invoiceResponse.invoiceUrl,
        expiryDate,
      };
    } catch (error) {
      console.error('Error creating Xendit invoice:', error);
      throw new Error('Failed to create payment invoice');
    }
  },
});
