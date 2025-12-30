import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { INVOICE_CREATION_RATE_WINDOW_MS, MAX_INVOICE_CREATION_ATTEMPTS, checkRateLimit } from '../../helpers/utils';

/**
 * Atomic mutation to mark invoice as created and enforce security checks
 * This prevents race conditions where multiple requests check invoiceCreated simultaneously
 * Returns success status and reason if failed
 */
export const markInvoiceCreatedArgs = {
  checkoutId: v.string(),
};

export const markInvoiceCreatedHandler = async (ctx: MutationCtx, args: { checkoutId: string }): Promise<{ success: boolean; reason?: string }> => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  if (!session) {
    return { success: false, reason: 'Checkout session not found' };
  }

  const now = Date.now();

  // Check if session has expired (handle optional field during migration)
  if (session.expiresAt !== undefined && session.expiresAt !== null && session.expiresAt < now) {
    return { success: false, reason: 'Checkout session has expired' };
  }

  // Check if invoice already created (one-time-use protection)
  if (session.invoiceCreated) {
    return { success: false, reason: 'Invoice already created for this checkout session' };
  }

  // Check rate limiting (handle optional field during migration)
  const invoiceCreationAttempts = session.invoiceCreationAttempts ?? 0;
  const rateLimitCheck = checkRateLimit(
    invoiceCreationAttempts,
    session.lastInvoiceAttemptAt,
    INVOICE_CREATION_RATE_WINDOW_MS,
    MAX_INVOICE_CREATION_ATTEMPTS
  );

  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      reason: `Rate limit exceeded. Maximum ${MAX_INVOICE_CREATION_ATTEMPTS} attempts per ${INVOICE_CREATION_RATE_WINDOW_MS / 60000} minutes.`,
    };
  }

  // Atomically update: set invoiceCreated to true and increment attempts
  await ctx.db.patch(session._id, {
    invoiceCreated: true,
    invoiceCreationAttempts: invoiceCreationAttempts + 1,
    lastInvoiceAttemptAt: now,
    updatedAt: now,
  });

  return { success: true };
};
