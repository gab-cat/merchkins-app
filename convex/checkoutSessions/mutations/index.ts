import { mutation, internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createCheckoutSessionArgs, createCheckoutSessionHandler } from './createCheckoutSession';
import { updateCheckoutSessionInvoiceArgs, updateCheckoutSessionInvoiceHandler } from './updateCheckoutSessionInvoice';

export const createCheckoutSession = mutation({
  args: createCheckoutSessionArgs,
  returns: v.object({
    checkoutId: v.string(),
  }),
  handler: createCheckoutSessionHandler,
});

export const updateCheckoutSessionInvoice = internalMutation({
  args: updateCheckoutSessionInvoiceArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await updateCheckoutSessionInvoiceHandler(ctx, args);
    return null;
  },
});
