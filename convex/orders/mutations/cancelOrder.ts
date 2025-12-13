import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, logAction, requireOrganizationPermission } from '../../helpers';
import { createSystemOrderLog } from './createOrderLog';
import { internal } from '../../_generated/api';

export const cancelOrderArgs = {
  orderId: v.id('orders'),
  reason: v.union(v.literal('OUT_OF_STOCK'), v.literal('CUSTOMER_REQUEST'), v.literal('PAYMENT_FAILED'), v.literal('OTHERS')),
  message: v.optional(v.string()),
  userNote: v.optional(v.string()), // Required note from admin
};

export const cancelOrderHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    reason: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'PAYMENT_FAILED' | 'OTHERS';
    message?: string;
    userNote?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const order = await validateOrderExists(ctx, args.orderId);

  if (order.status === 'DELIVERED') {
    throw new Error('Cannot cancel a delivered order');
  }
  if (order.status === 'CANCELLED') {
    return order._id; // idempotent
  }

  // Check if order is paid - if so, customer must use refund request flow
  if (order.paymentStatus === 'PAID' && currentUser._id === order.customerId) {
    // Check if refund request already exists
    const existingRequest = await ctx.db
      .query('refundRequests')
      .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('status'), 'PENDING'))
      .first();

    if (existingRequest) {
      throw new Error('A refund request is already pending for this order. Please wait for admin review.');
    }

    // Check 24-hour window
    const payment = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'VERIFIED'))
      .order('desc')
      .first();

    if (payment) {
      const paymentDate = payment.paymentDate || payment.createdAt;
      const hoursSincePayment = (Date.now() - paymentDate) / (1000 * 60 * 60);

      if (hoursSincePayment > 24) {
        throw new Error('Refund requests must be submitted within 24 hours of payment. This order cannot be cancelled.');
      }
    }

    throw new Error('This order has been paid. Please submit a refund request instead of cancelling directly.');
  }

  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'update');
  } else if (!currentUser.isAdmin && !currentUser.isStaff && currentUser._id !== order.customerId) {
    throw new Error('Permission denied');
  }

  const now = Date.now();
  const actorName = `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email;
  const history = [
    {
      status: 'CANCELLED',
      changedBy: currentUser._id,
      changedByName: actorName,
      reason: args.message || `Order cancelled: ${args.reason}`,
      changedAt: now,
    },
    ...order.recentStatusHistory,
  ].slice(0, 5);

  await ctx.db.patch(order._id, {
    status: 'CANCELLED',
    cancellationReason: args.reason,
    recentStatusHistory: history,
    updatedAt: now,
  });

  // Update associated payment statuses
  try {
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', order._id))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    for (const payment of payments) {
      // Determine new payment status based on current status
      // If payment was VERIFIED/PAID, mark as REFUNDED
      // If payment was PENDING/PROCESSING, mark as CANCELLED
      const newPaymentStatus =
        payment.paymentStatus === 'VERIFIED' || payment.paymentStatus === 'PROCESSING'
          ? 'REFUNDED'
          : payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'FAILED'
            ? 'CANCELLED'
            : payment.paymentStatus; // Keep existing status if already REFUNDED/CANCELLED

      // Only update if status is changing
      if (newPaymentStatus !== payment.paymentStatus) {
        await ctx.db.patch(payment._id, {
          paymentStatus: newPaymentStatus,
          statusHistory: [
            ...payment.statusHistory,
            {
              status: newPaymentStatus,
              changedBy: currentUser._id,
              changedByName: actorName,
              reason: `Order cancelled: ${args.reason}`,
              changedAt: now,
            },
          ],
          updatedAt: now,
        });
      }
    }
  } catch {
    // Best-effort payment update; do not block cancellation on payment update failure
  }

  // Restock inventory for STOCK products
  try {
    // Load items (embedded or separate table)
    const items =
      order.embeddedItems && order.embeddedItems.length > 0
        ? order.embeddedItems.map((i) => ({
            productId: i.productInfo.productId,
            variantId: i.variantId as string | undefined,
            quantity: i.quantity,
          }))
        : await ctx.db
            .query('orderItems')
            .withIndex('by_order', (q) => q.eq('orderId', order._id))
            .collect()
            .then((rows) =>
              rows.map((r) => ({
                productId: r.productInfo.productId,
                variantId: r.variantId as string | undefined,
                quantity: r.quantity,
              }))
            );

    // Group quantities per product and variant
    const byProduct: Map<string, { total: number; byVariant: Map<string, number> }> = new Map();
    for (const it of items) {
      const key = String(it.productId);
      if (!byProduct.has(key)) byProduct.set(key, { total: 0, byVariant: new Map() });
      const entry = byProduct.get(key)!;
      entry.total += it.quantity;
      if (it.variantId) {
        entry.byVariant.set(it.variantId, (entry.byVariant.get(it.variantId) || 0) + it.quantity);
      }
    }

    for (const [productIdStr, data] of byProduct.entries()) {
      const productId = productIdStr as unknown as Id<'products'>;
      const product = await ctx.db.get(productId);
      if (!product) continue;
      if (product.inventoryType !== 'STOCK') continue;

      const nowTs = Date.now();
      // Restore product aggregate inventory
      const newInventory = Math.max(0, (product.inventory || 0) + data.total);

      // Restore variant inventories
      let variants = product.variants;
      if (data.byVariant.size > 0) {
        variants = product.variants.map((v) => {
          const inc = v.variantId ? data.byVariant.get(v.variantId) || 0 : 0;
          if (inc > 0) {
            return { ...v, inventory: v.inventory + inc, updatedAt: nowTs };
          }
          return v;
        });
      }

      await ctx.db.patch(productId, { inventory: newInventory, variants, updatedAt: nowTs });
    }
  } catch {
    // Best-effort restock; do not block cancellation on restock failure
  }

  await logAction(
    ctx,
    'cancel_order',
    'DATA_CHANGE',
    'MEDIUM',
    `Cancelled order ${order.orderNumber ?? String(order._id)}`,
    currentUser._id,
    order.organizationId ?? undefined,
    { orderId: order._id, reason: args.reason }
  );

  // Create order log for cancellation
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'ORDER_CANCELLED',
    reason: `Order cancelled: ${args.reason}`,
    message: args.message || `Cancelled by ${actorName}`,
    userMessage: args.userNote,
    previousValue: order.status,
    newValue: 'CANCELLED',
    isPublic: true,
    actorId: currentUser._id,
  });

  return order._id;
};

/**
 * Internal helper function to cancel an order and restore stock
 * This is used when canceling orders from refund approvals or other internal flows
 * where permissions have already been validated
 */
export async function cancelOrderInternal(
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    reason: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'PAYMENT_FAILED' | 'OTHERS';
    message?: string;
    actorId: Id<'users'>;
    actorName: string;
  }
) {
  const order = await ctx.db.get(args.orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status === 'DELIVERED') {
    throw new Error('Cannot cancel a delivered order');
  }
  if (order.status === 'CANCELLED') {
    return order._id; // idempotent
  }

  const now = Date.now();
  const history = [
    {
      status: 'CANCELLED' as const,
      changedBy: args.actorId,
      changedByName: args.actorName,
      reason: args.message || `Order cancelled: ${args.reason}`,
      changedAt: now,
    },
    ...order.recentStatusHistory,
  ].slice(0, 5);

  await ctx.db.patch(order._id, {
    status: 'CANCELLED',
    cancellationReason: args.reason,
    recentStatusHistory: history,
    updatedAt: now,
  });

  // Update associated payment statuses
  try {
    const payments = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', order._id))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    for (const payment of payments) {
      // Determine new payment status based on current status
      // If payment was VERIFIED/PAID, mark as REFUNDED
      // If payment was PENDING/PROCESSING, mark as CANCELLED
      const newPaymentStatus =
        payment.paymentStatus === 'VERIFIED' || payment.paymentStatus === 'PROCESSING'
          ? 'REFUNDED'
          : payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'FAILED'
            ? 'CANCELLED'
            : payment.paymentStatus; // Keep existing status if already REFUNDED/CANCELLED

      // Only update if status is changing
      if (newPaymentStatus !== payment.paymentStatus) {
        await ctx.db.patch(payment._id, {
          paymentStatus: newPaymentStatus,
          statusHistory: [
            ...payment.statusHistory,
            {
              status: newPaymentStatus,
              changedBy: args.actorId,
              changedByName: args.actorName,
              reason: `Order cancelled: ${args.reason}`,
              changedAt: now,
            },
          ],
          updatedAt: now,
        });
      }
    }
  } catch {
    // Best-effort payment update; do not block cancellation on payment update failure
  }

  // Restock inventory for STOCK products
  try {
    // Load items (embedded or separate table)
    const items =
      order.embeddedItems && order.embeddedItems.length > 0
        ? order.embeddedItems.map((i) => ({
            productId: i.productInfo.productId,
            variantId: i.variantId as string | undefined,
            quantity: i.quantity,
          }))
        : await ctx.db
            .query('orderItems')
            .withIndex('by_order', (q) => q.eq('orderId', order._id))
            .collect()
            .then((rows) =>
              rows.map((r) => ({
                productId: r.productInfo.productId,
                variantId: r.variantId as string | undefined,
                quantity: r.quantity,
              }))
            );

    // Group quantities per product and variant
    const byProduct: Map<string, { total: number; byVariant: Map<string, number> }> = new Map();
    for (const it of items) {
      const key = String(it.productId);
      if (!byProduct.has(key)) byProduct.set(key, { total: 0, byVariant: new Map() });
      const entry = byProduct.get(key)!;
      entry.total += it.quantity;
      if (it.variantId) {
        entry.byVariant.set(it.variantId, (entry.byVariant.get(it.variantId) || 0) + it.quantity);
      }
    }

    for (const [productIdStr, data] of byProduct.entries()) {
      const productId = productIdStr as unknown as Id<'products'>;
      const product = await ctx.db.get(productId);
      if (!product) continue;
      if (product.inventoryType !== 'STOCK') continue;

      const nowTs = Date.now();
      // Restore product aggregate inventory
      const newInventory = Math.max(0, (product.inventory || 0) + data.total);

      // Restore variant inventories
      let variants = product.variants;
      if (data.byVariant.size > 0) {
        variants = product.variants.map((v) => {
          const inc = v.variantId ? data.byVariant.get(v.variantId) || 0 : 0;
          if (inc > 0) {
            return { ...v, inventory: v.inventory + inc, updatedAt: nowTs };
          }
          return v;
        });
      }

      await ctx.db.patch(productId, { inventory: newInventory, variants, updatedAt: nowTs });
    }
  } catch {
    // Best-effort restock; do not block cancellation on restock failure
  }

  // Create order log for cancellation
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'ORDER_CANCELLED',
    reason: `Order cancelled: ${args.reason}`,
    message: args.message || `Cancelled by ${args.actorName}`,
    previousValue: order.status,
    newValue: 'CANCELLED',
    isPublic: true,
    actorId: args.actorId,
  });

  return order._id;
}

export const cancelOrderInternalArgs = {
  orderId: v.id('orders'),
  reason: v.union(v.literal('OUT_OF_STOCK'), v.literal('CUSTOMER_REQUEST'), v.literal('PAYMENT_FAILED'), v.literal('OTHERS')),
  message: v.optional(v.string()),
  actorId: v.id('users'),
  actorName: v.string(),
} as const;

export const cancelOrderInternalHandler = async (
  ctx: MutationCtx,
  args: {
    orderId: Id<'orders'>;
    reason: 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'PAYMENT_FAILED' | 'OTHERS';
    message?: string;
    actorId: Id<'users'>;
    actorName: string;
  }
) => {
  return await cancelOrderInternal(ctx, args);
};
