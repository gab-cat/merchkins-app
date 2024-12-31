import { mutation, internalMutation } from '../../_generated/server';
import { v } from 'convex/values';
import { createCheckoutSessionArgs, createCheckoutSessionHandler } from './createCheckoutSession';
import { updateCheckoutSessionInvoiceArgs, updateCheckoutSessionInvoiceHandler } from './updateCheckoutSessionInvoice';
import { markInvoiceCreatedArgs, markInvoiceCreatedHandler } from './markInvoiceCreated';
import {
  updateCheckoutSessionPaymongoCheckoutArgs,
  updateCheckoutSessionPaymongoCheckoutHandler,
  updateCheckoutSessionAttemptsArgs,
  updateCheckoutSessionAttemptsHandler,
  markCheckoutSessionInvoiceCreatedArgs,
  markCheckoutSessionInvoiceCreatedHandler,
} from './updateCheckoutSessionPaymongoCheckout';

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

export const updateCheckoutSessionPaymongoCheckout = internalMutation({
  args: updateCheckoutSessionPaymongoCheckoutArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await updateCheckoutSessionPaymongoCheckoutHandler(ctx, args);
    return null;
  },
});

export const updateCheckoutSessionAttempts = internalMutation({
  args: updateCheckoutSessionAttemptsArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await updateCheckoutSessionAttemptsHandler(ctx, args);
    return null;
  },
});

export const markCheckoutSessionInvoiceCreated = internalMutation({
  args: markCheckoutSessionInvoiceCreatedArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    await markCheckoutSessionInvoiceCreatedHandler(ctx, args);
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
