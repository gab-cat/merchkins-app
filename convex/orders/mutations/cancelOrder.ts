import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrderExists, logAction, requireOrganizationPermission } from '../../helpers';
import { createSystemOrderLog } from './createOrderLog';

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
