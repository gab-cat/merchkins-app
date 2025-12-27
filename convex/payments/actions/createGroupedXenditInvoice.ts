'use node';

import { action, internalAction, ActionCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { internal } from '../../_generated/api';
import { api } from '../../_generated/api';
import { Id } from '../../_generated/dataModel';
import { Doc } from '../../_generated/dataModel';
import { validateUUIDv4, maskCheckoutId, CHECKOUT_SESSION_EXPIRY_MS } from '../../helpers/utils';
import { logAction } from '../../helpers/utils';

/**
 * Internal action to create a grouped Xendit invoice for a checkout session
 * This creates a single payment link for multiple orders
 * Security: This function assumes all security checks have been performed by the public action
 */
export const createGroupedXenditInvoiceInternal = internalAction({
  args: {
    checkoutId: v.string(),
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx: ActionCtx, args: { checkoutId: string }): Promise<{ invoiceId: string; invoiceUrl: string; expiryDate: number }> => {
    // Validate UUIDv4 format (defense in depth)
    if (!validateUUIDv4(args.checkoutId)) {
      throw new Error('Invalid checkoutId format');
    }

    // Get checkout session
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      throw new Error('Checkout session not found');
    }

    // Check expiry (defense in depth - should already be checked by atomic guard)
    const now = Date.now();
    if (session.expiresAt === undefined || session.expiresAt === null || session.expiresAt < now) {
      throw new Error('Checkout session has expired');
    }

    // Get all orders in the session
    const orders = await Promise.all(
      session.orderIds.map((orderId: Id<'orders'>) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId }))
    );

    const validOrders = orders.filter((order: Doc<'orders'> | null): order is Doc<'orders'> => {
      return order !== null && !order.isDeleted;
    });

    if (validOrders.length === 0) {
      throw new Error('No valid orders found in checkout session');
    }

    // Get customer email from first order
    const customerEmail = validOrders[0]?.customerInfo?.email;
    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    // Calculate total amount
    const totalAmount = validOrders.reduce((sum: number, order: Doc<'orders'>) => sum + order.totalAmount, 0);

    // Create invoice using internal action
    const invoice = await ctx.runAction(internal.payments.actions.xenditService.createXenditInvoice, {
      orderIds: validOrders.map((o: Doc<'orders'>) => o._id),
      amount: totalAmount,
      customerEmail,
      externalId: `checkout-${args.checkoutId}`,
      checkoutId: args.checkoutId,
    });

    // Update checkout session with invoice details
    await ctx.runMutation(internal.checkoutSessions.mutations.index.updateCheckoutSessionInvoice, {
      checkoutId: args.checkoutId,
      xenditInvoiceId: invoice.invoiceId,
      xenditInvoiceUrl: invoice.invoiceUrl,
      xenditInvoiceExpiryDate: invoice.expiryDate,
    });

    // Update all orders with invoice details
    await ctx.runMutation(internal.orders.mutations.index.updateOrdersInvoiceForSession, {
      checkoutId: args.checkoutId,
      xenditInvoiceId: invoice.invoiceId,
      xenditInvoiceUrl: invoice.invoiceUrl,
      xenditInvoiceExpiryDate: invoice.expiryDate,
    });

    return invoice;
  },
});

/**
 * Public action wrapper for creating grouped Xendit invoices
 * This allows clients to create payment invoices for checkout sessions
 *
 * Security features:
 * - UUIDv4 validation: Ensures checkoutId is cryptographically unguessable
 * - Session expiry: Prevents use of expired sessions
 * - One-time-use protection: Prevents duplicate invoice creation via atomic guard
 * - Rate limiting: Prevents brute force attempts (5 attempts per 15 minutes)
 * - Email verification: For guests, requires email to match session customer
 * - Security logging: Logs all suspicious attempts without exposing tokens
 */
export const createGroupedXenditInvoice = action({
  args: {
    checkoutId: v.string(),
    email: v.optional(v.string()), // Required for guest users
  },
  returns: v.object({
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (
    ctx: ActionCtx,
    args: { checkoutId: string; email?: string }
  ): Promise<{ invoiceId: string; invoiceUrl: string; expiryDate: number }> => {
    const maskedCheckoutId = maskCheckoutId(args.checkoutId);

    // 1. Validate UUIDv4 format (cryptographically unguessable)
    if (!validateUUIDv4(args.checkoutId)) {
      // Log security event
      await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
        action: 'create_invoice_invalid_checkout_id',
        logType: 'SECURITY_EVENT',
        severity: 'HIGH',
        reason: `Invalid checkoutId format attempted: ${maskedCheckoutId}`,
        metadata: { checkoutId: maskedCheckoutId },
      });
      throw new Error('Invalid checkout session identifier');
    }

    // 2. Get checkout session
    const session = await ctx.runQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, {
      checkoutId: args.checkoutId,
    });

    if (!session) {
      // Log security event
      await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
        action: 'create_invoice_session_not_found',
        logType: 'SECURITY_EVENT',
        severity: 'MEDIUM',
        reason: `Checkout session not found: ${maskedCheckoutId}`,
        metadata: { checkoutId: maskedCheckoutId },
      });
      throw new Error('Checkout session not found');
    }

    // 3. Check session expiry
    const now = Date.now();
    if (session.expiresAt === undefined || session.expiresAt === null || session.expiresAt < now) {
      // Log security event
      await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
        action: 'create_invoice_expired_session',
        logType: 'SECURITY_EVENT',
        severity: 'MEDIUM',
        reason: `Attempted to create invoice for expired session: ${maskedCheckoutId}`,
        userId: session.customerId,
        metadata: { checkoutId: maskedCheckoutId, expiresAt: session.expiresAt },
      });
      throw new Error('This checkout session has expired. Please start a new checkout.');
    }

    // 4. Get current user (if authenticated)
    const authIdentity = await ctx.auth.getUserIdentity();

    if (authIdentity) {
      // Authenticated user flow
      const currentUser = await ctx.runQuery(api.users.queries.index.getCurrentUser, {
        clerkId: authIdentity.subject,
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      // Check permissions - user can create invoices for their own sessions, staff/admin can create for any
      if (currentUser._id !== session.customerId && !currentUser.isStaff && !currentUser.isAdmin) {
        // Log security event
        await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
          action: 'create_invoice_unauthorized',
          logType: 'SECURITY_EVENT',
          severity: 'HIGH',
          reason: `User ${currentUser.email} attempted to create invoice for session owned by different user`,
          userId: currentUser._id,
          metadata: { checkoutId: maskedCheckoutId, sessionCustomerId: session.customerId },
        });
        throw new Error('You can only create payment links for your own checkout sessions');
      }

      // 5. Call atomic guard mutation (checks one-time-use and rate limiting)
      const guardResult = await ctx.runMutation(internal.checkoutSessions.mutations.index.markInvoiceCreated, {
        checkoutId: args.checkoutId,
      });

      if (!guardResult.success) {
        // Log security event based on reason
        const logReason = guardResult.reason?.includes('already created')
          ? 'create_invoice_duplicate_attempt'
          : guardResult.reason?.includes('Rate limit')
            ? 'create_invoice_rate_limit_exceeded'
            : 'create_invoice_guard_failed';

        await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
          action: logReason,
          logType: 'SECURITY_EVENT',
          severity: guardResult.reason?.includes('Rate limit') ? 'HIGH' : 'HIGH',
          reason: `Invoice creation blocked: ${guardResult.reason} for ${maskedCheckoutId}`,
          userId: currentUser._id,
          metadata: { checkoutId: maskedCheckoutId, reason: guardResult.reason },
        });

        throw new Error(guardResult.reason || 'Invoice creation failed');
      }
    } else {
      // Guest user flow
      // 6. Email verification required for guests
      if (!args.email) {
        // Log security event
        await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
          action: 'create_invoice_guest_no_email',
          logType: 'SECURITY_EVENT',
          severity: 'MEDIUM',
          reason: `Guest attempted to create invoice without providing email for ${maskedCheckoutId}`,
          userId: session.customerId,
          metadata: { checkoutId: maskedCheckoutId },
        });
        throw new Error('Email verification required for guest checkout');
      }

      // 7. Get customer user to verify email matches
      const customerUser = await ctx.runQuery(api.users.queries.index.getUserById, {
        userId: session.customerId,
      });

      if (!customerUser) {
        throw new Error('Customer not found');
      }

      // 8. Verify email matches session customer email (case-insensitive)
      const providedEmail = args.email.trim().toLowerCase();
      const customerEmail = customerUser.email.toLowerCase();

      if (providedEmail !== customerEmail) {
        // Log security event
        await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
          action: 'create_invoice_email_mismatch',
          logType: 'SECURITY_EVENT',
          severity: 'MEDIUM',
          reason: `Guest provided email ${providedEmail} does not match session customer email for ${maskedCheckoutId}`,
          userId: session.customerId,
          metadata: {
            checkoutId: maskedCheckoutId,
            providedEmail: providedEmail.substring(0, 3) + '***', // Mask email in logs
            expectedEmailPrefix: customerEmail.substring(0, 3),
          },
        });
        throw new Error('Email does not match the checkout session. Please use the email associated with this checkout.');
      }

      // 9. Call atomic guard mutation (checks one-time-use and rate limiting)
      const guardResult = await ctx.runMutation(internal.checkoutSessions.mutations.index.markInvoiceCreated, {
        checkoutId: args.checkoutId,
      });

      if (!guardResult.success) {
        // Log security event based on reason
        const logReason = guardResult.reason?.includes('already created')
          ? 'create_invoice_duplicate_attempt'
          : guardResult.reason?.includes('Rate limit')
            ? 'create_invoice_rate_limit_exceeded'
            : 'create_invoice_guard_failed';

        await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
          action: logReason,
          logType: 'SECURITY_EVENT',
          severity: guardResult.reason?.includes('Rate limit') ? 'HIGH' : 'HIGH',
          reason: `Guest invoice creation blocked: ${guardResult.reason} for ${maskedCheckoutId}`,
          userId: session.customerId,
          metadata: { checkoutId: maskedCheckoutId, reason: guardResult.reason },
        });

        throw new Error(guardResult.reason || 'Invoice creation failed');
      }
    }

    // 10. All security checks passed - create invoice
    const invoice = await ctx.runAction(internal.payments.actions.createGroupedXenditInvoice.createGroupedXenditInvoiceInternal, {
      checkoutId: args.checkoutId,
    });

    // 11. Log successful invoice creation (audit trail)
    await ctx.runMutation(internal.logs.mutations.index.createLogInternal, {
      action: 'create_invoice_success',
      logType: 'AUDIT_TRAIL',
      severity: 'LOW',
      reason: `Invoice created successfully for checkout session ${maskedCheckoutId}`,
      userId: session.customerId,
      metadata: {
        checkoutId: maskedCheckoutId,
        invoiceId: invoice.invoiceId,
        invoiceUrl: invoice.invoiceUrl.substring(0, 50) + '...', // Truncate URL
      },
    });

    return invoice;
  },
});
