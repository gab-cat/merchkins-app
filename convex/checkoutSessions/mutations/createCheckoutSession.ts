import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { validateUUIDv4, CHECKOUT_SESSION_EXPIRY_MS } from '../../helpers/utils';

export const createCheckoutSessionArgs = {
  checkoutId: v.string(),
  customerId: v.id('users'),
  orderIds: v.array(v.id('orders')),
  totalAmount: v.number(),
};

export const createCheckoutSessionHandler = async (
  ctx: MutationCtx,
  args: {
    checkoutId: string;
    customerId: Id<'users'>;
    orderIds: Array<Id<'orders'>>;
    totalAmount: number;
  }
) => {
  // Validate checkoutId is UUIDv4 format for security
  if (!validateUUIDv4(args.checkoutId)) {
    throw new Error('Invalid checkoutId format. Must be a valid UUIDv4.');
  }

  const now = Date.now();

  await ctx.db.insert('checkoutSessions', {
    checkoutId: args.checkoutId,
    customerId: args.customerId,
    orderIds: args.orderIds,
    totalAmount: args.totalAmount,
    status: 'PENDING',
    // Security fields
    expiresAt: now + CHECKOUT_SESSION_EXPIRY_MS, // 24 hours from creation
    invoiceCreated: false, // One-time-use flag
    invoiceCreationAttempts: 0, // Rate limiting counter
    lastInvoiceAttemptAt: undefined, // Will be set on first attempt
    createdAt: now,
    updatedAt: now,
  });

  return { checkoutId: args.checkoutId };
};
