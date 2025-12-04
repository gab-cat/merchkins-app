import { MutationCtx } from '../../_generated/server';
import { logAction } from '../../helpers';
import { internal } from '../../_generated/api';
import type { XenditWebhookEvent } from '../../../types/xendit';
import { v } from 'convex/values';
import { Doc, Id } from '../../_generated/dataModel';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const handleXenditWebhookArgs = {
  webhookEvent: v.any(), // Allow any webhook data from Xendit
};

export const handleXenditWebhookHandler = async (ctx: MutationCtx, args: { webhookEvent: XenditWebhookEvent }) => {
  const webhookEvent = args.webhookEvent;

  // Only process PAID and EXPIRED statuses
  if (webhookEvent.status !== 'PAID' && webhookEvent.status !== 'EXPIRED') {
    console.log(`Ignoring webhook event with status: ${webhookEvent.status}`);
    return { processed: false, reason: `Status ${webhookEvent.status} not handled` };
  }

  // Get the system admin user for webhook operations
  const systemUser = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', 'seed_admin'))
    .first();

  if (!systemUser) {
    console.error('System admin user not found');
    throw new Error('System admin user not found');
  }

  // Find the order by external_id (should match order number)
  const orderNumber = webhookEvent.external_id;
  const orders = await ctx.db
    .query('orders')
    .withIndex('by_isDeleted', (q) => q.eq('isDeleted', false))
    .filter((q) => q.eq(q.field('orderNumber'), orderNumber))
    .first();

  if (!orders) {
    console.error(`Order not found for external_id: ${orderNumber}`);
    return { processed: false, reason: 'Order not found', statusCode: 404 };
  }

  const order = orders;

  // Handle EXPIRED status - cancel the order
  if (webhookEvent.status === 'EXPIRED') {
    return await handleExpiredInvoice(ctx, webhookEvent, order, systemUser);
  }

  // Handle PAID status - process payment (existing logic)

  // Check if payment already exists for this order and transaction
  const existingPayment = await ctx.db
    .query('payments')
    .withIndex('by_order', (q) => q.eq('orderId', order._id))
    .filter((q) =>
      q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), webhookEvent.id), q.eq(q.field('paymentProvider'), 'XENDIT'))
    )
    .first();

  if (existingPayment) {
    console.log(`Payment already processed for transaction: ${webhookEvent.id}`);
    return { processed: true, reason: 'Payment already exists' };
  }

  // Create payment record
  const now = Date.now();
  const paymentAmount = webhookEvent.paid_amount || webhookEvent.amount;
  const processingFee = webhookEvent.fees_paid_amount || 0;
  const netAmount = Math.max(0, paymentAmount - processingFee);

  const paymentDoc = {
    isDeleted: false,
    organizationId: order.organizationId,
    orderId: order._id,
    userId: order.customerId,
    processedById: undefined, // System processed
    paymentDate: now,
    amount: paymentAmount,
    processingFee: processingFee || undefined,
    netAmount,
    paymentMethod: 'XENDIT' as const,
    paymentSite: 'OFFSITE' as const,
    paymentStatus: 'VERIFIED' as const,
    referenceNo: `XENDIT-${webhookEvent.id}`,
    currency: webhookEvent.currency,
    transactionId: webhookEvent.id,
    paymentProvider: 'XENDIT',
    xenditInvoiceId: webhookEvent.id,
    metadata: webhookEvent as unknown as Record<string, unknown>,

    // Embedded order info
    orderInfo: {
      orderNumber: order.orderNumber,
      customerName: order.customerInfo.firstName
        ? `${order.customerInfo.firstName} ${order.customerInfo.lastName || ''}`.trim()
        : order.customerInfo.email,
      customerEmail: order.customerInfo.email,
      totalAmount: order.totalAmount,
      orderDate: order.orderDate,
      status: order.status,
    },

    // Embedded user info
    userInfo: {
      firstName: order.customerInfo.firstName,
      lastName: order.customerInfo.lastName,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      imageUrl: order.customerInfo.imageUrl,
    },

    verificationDate: now,
    reconciliationStatus: 'MATCHED' as const,

    statusHistory: [
      {
        status: 'VERIFIED',
        changedBy: systemUser._id,
        changedByName: 'Xendit Payment System',
        reason: 'Payment verified via webhook',
        changedAt: now,
      },
    ],

    createdAt: now,
    updatedAt: now,
  };

  const paymentId = await ctx.db.insert('payments', paymentDoc);

  // Update order status to CONFIRMED and payment status to PAID
  await ctx.db.patch(order._id, {
    status: 'PROCESSING', // Move to processing as payment is confirmed
    paymentStatus: 'PAID',
    updatedAt: now,
  });

  // Update order status history
  const statusUpdate = {
    status: 'PROCESSING',
    changedBy: systemUser._id,
    changedByName: 'Xendit Payment System',
    reason: 'Payment confirmed via webhook',
    changedAt: now,
  };

  // Get current recentStatusHistory and add new entry
  const currentHistory = order.recentStatusHistory || [];
  const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)]; // Keep last 5 entries

  await ctx.db.patch(order._id, {
    recentStatusHistory: updatedHistory as Doc<'orders'>['recentStatusHistory'], // Type assertion needed due to Convex schema limitations
    updatedAt: now,
  });

  // Recalculate order payment stats
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: order._id,
    actorId: systemUser._id,
    actorName: 'Xendit Payment System',
  });

  // Log the payment event
  await logAction(
    ctx,
    'xendit_payment_received',
    'SYSTEM_EVENT',
    'HIGH',
    `Payment of ${paymentAmount} ${webhookEvent.currency} received via Xendit for order ${orderNumber}`,
    undefined, // System action
    order.organizationId,
    {
      paymentId,
      orderId: order._id,
      amount: paymentAmount,
      transactionId: webhookEvent.id,
      provider: 'XENDIT',
    }
  );

  console.log(`Successfully processed Xendit payment for order ${orderNumber}`);
  return {
    processed: true,
    paymentId,
    orderId: order._id,
  };
};

/**
 * Handle expired invoice webhook event by cancelling the associated order
 */
async function handleExpiredInvoice(ctx: MutationCtx, webhookEvent: XenditWebhookEvent, order: Doc<'orders'>, systemUser: Doc<'users'>) {
  const orderNumber = webhookEvent.external_id;

  console.log(`Processing expired invoice for order ${orderNumber}`);

  // Edge case: Order already cancelled - idempotent
  if (order.status === 'CANCELLED') {
    console.log(`Order ${orderNumber} is already cancelled, skipping`);
    return { processed: true, reason: 'Order already cancelled' };
  }

  // Edge case: Order already delivered - should not cancel
  if (order.status === 'DELIVERED') {
    console.log(`Order ${orderNumber} is already delivered, cannot cancel`);
    return { processed: false, reason: 'Cannot cancel delivered order' };
  }

  // Edge case: Order already paid - should not cancel
  if (order.paymentStatus === 'PAID') {
    console.log(`Order ${orderNumber} is already paid, skipping cancellation`);
    return { processed: false, reason: 'Order already paid' };
  }

  const now = Date.now();
  const actorName = 'Xendit Payment System';

  // Update order status to CANCELLED
  const history = [
    {
      status: 'CANCELLED' as const,
      changedBy: systemUser._id,
      changedByName: actorName,
      reason: 'Invoice expired - payment not received',
      changedAt: now,
    },
    ...order.recentStatusHistory,
  ].slice(0, 5);

  await ctx.db.patch(order._id, {
    status: 'CANCELLED',
    cancellationReason: 'PAYMENT_FAILED',
    recentStatusHistory: history as Doc<'orders'>['recentStatusHistory'],
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
  } catch (error) {
    // Best-effort restock; do not block cancellation on restock failure
    console.error(`Error restocking inventory for order ${orderNumber}:`, error);
  }

  // Log the cancellation event
  await logAction(
    ctx,
    'xendit_invoice_expired',
    'SYSTEM_EVENT',
    'HIGH',
    `Invoice expired for order ${orderNumber} - order cancelled`,
    undefined, // System action
    order.organizationId ?? undefined,
    {
      orderId: order._id,
      invoiceId: webhookEvent.id,
      orderNumber,
      provider: 'XENDIT',
    }
  );

  // Create order log for cancellation
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'ORDER_CANCELLED',
    reason: 'Order cancelled due to non-payment',
    message: `Invoice expired - payment was not received within the allowed time. Order has been automatically cancelled.`,
    previousValue: order.status,
    newValue: 'CANCELLED',
    isPublic: true,
    actorId: systemUser._id,
  });

  console.log(`Successfully cancelled order ${orderNumber} due to expired invoice`);
  return {
    processed: true,
    orderId: order._id,
    reason: 'Order cancelled due to expired invoice',
  };
}
