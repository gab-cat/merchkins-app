import { mutation, internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createCheckoutSessionArgs, createCheckoutSessionHandler } from './createCheckoutSession';
import { updateCheckoutSessionInvoiceArgs, updateCheckoutSessionInvoiceHandler } from './updateCheckoutSessionInvoice';
import { markInvoiceCreatedArgs, markInvoiceCreatedHandler } from './markInvoiceCreated';

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

/**
 * Atomic mutation to mark invoice as created and enforce security checks
 * Prevents race conditions and enforces one-time-use, expiry, and rate limiting
 */
export const markInvoiceCreated = internalMutation({
  args: markInvoiceCreatedArgs,
  returns: v.object({
    success: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: markInvoiceCreatedHandler,
});
