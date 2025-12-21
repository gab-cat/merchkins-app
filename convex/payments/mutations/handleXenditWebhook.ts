import { MutationCtx } from '../../_generated/server';
import { logAction } from '../../helpers';
import { internal } from '../../_generated/api';
import type { XenditWebhookEvent } from '../../../types/xendit';
import { v } from 'convex/values';
import { Doc } from '../../_generated/dataModel';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const handleXenditWebhookArgs = {
  webhookEvent: v.any(), // Allow any webhook data from Xendit
};

export const handleXenditWebhookHandler = async (ctx: MutationCtx, args: { webhookEvent: XenditWebhookEvent }) => {
  const webhookEvent = args.webhookEvent;
  // Only process successful payments
  if (webhookEvent.status !== 'PAID') {
    console.log(`Ignoring webhook event with status: ${webhookEvent.status}`);
    return { processed: false, reason: 'Not a successful payment' };
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
  const externalId = webhookEvent.external_id;
  const now = Date.now();
  const paymentAmount = webhookEvent.paid_amount || webhookEvent.amount;
  const processingFee = webhookEvent.fees_paid_amount || 0;
  const netAmount = Math.max(0, paymentAmount - processingFee);

  // Check if this is a grouped payment (checkout session)
  const isGroupedPayment = externalId.startsWith('checkout-');

  if (isGroupedPayment) {
    // Extract checkout ID
    const checkoutId = externalId.replace('checkout-', '');

    // Get checkout session
    const session = await ctx.db
      .query('checkoutSessions')
      .withIndex('by_checkout_id', (q) => q.eq('checkoutId', checkoutId))
      .first();

    if (!session) {
      console.error(`Checkout session not found for external_id: ${externalId}`);
      return { processed: false, reason: 'Checkout session not found', statusCode: 404 };
    }

    // Check if payment already processed for this session
    const existingPayment = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', session.orderIds[0]))
      .filter((q) =>
        q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), webhookEvent.id), q.eq(q.field('paymentProvider'), 'XENDIT'))
      )
      .first();

    if (existingPayment) {
      console.log(`Payment already processed for transaction: ${webhookEvent.id}`);
      return { processed: true, reason: 'Payment already exists' };
    }

    // Get all orders in the session
    const orders = await Promise.all(session.orderIds.map((orderId) => ctx.db.get(orderId)));

    const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

    if (validOrders.length === 0) {
      console.error(`No valid orders found in checkout session: ${checkoutId}`);
      return { processed: false, reason: 'No valid orders found', statusCode: 404 };
    }

    // Process payment for each order
    const paymentIds: string[] = [];
    const orderIds: string[] = [];

    for (const order of validOrders) {
      // Check if payment already exists for this specific order
      const orderExistingPayment = await ctx.db
        .query('payments')
        .withIndex('by_order', (q) => q.eq('orderId', order._id))
        .filter((q) =>
          q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), webhookEvent.id), q.eq(q.field('paymentProvider'), 'XENDIT'))
        )
        .first();

      if (orderExistingPayment) {
        console.log(`Payment already exists for order ${order._id}`);
        continue;
      }

      // Calculate proportional payment amount for this order
      const orderPaymentAmount = (order.totalAmount / session.totalAmount) * paymentAmount;
      const orderProcessingFee = (order.totalAmount / session.totalAmount) * processingFee;
      const orderNetAmount = Math.max(0, orderPaymentAmount - orderProcessingFee);

      const paymentDoc = {
        isDeleted: false,
        organizationId: order.organizationId,
        orderId: order._id,
        userId: order.customerId,
        processedById: undefined, // System processed
        paymentDate: now,
        amount: orderPaymentAmount,
        processingFee: orderProcessingFee || undefined,
        netAmount: orderNetAmount,
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
            reason: 'Payment confirmed via webhook (grouped payment)',
            changedAt: now,
          },
        ],

        createdAt: now,
        updatedAt: now,
      };

      const paymentId = await ctx.db.insert('payments', paymentDoc);
      paymentIds.push(paymentId);
      orderIds.push(order._id);

      // Update order status to PROCESSING and payment status to PAID
      const statusUpdate = {
        status: 'PROCESSING' as const,
        changedBy: systemUser._id,
        changedByName: 'Xendit Payment System',
        reason: 'Payment confirmed via webhook (grouped payment)',
        changedAt: now,
      };

      const currentHistory = order.recentStatusHistory || [];
      const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)]; // Keep last 5 entries

      await ctx.db.patch(order._id, {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paidAt: now, // Set payment timestamp for accurate payout period assignment
        recentStatusHistory: updatedHistory as Doc<'orders'>['recentStatusHistory'],
        updatedAt: now,
      });

      // Recalculate order payment stats
      await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
        orderId: order._id,
        actorId: systemUser._id,
        actorName: 'Xendit Payment System',
      });

      // Create order log for payment received
      await createSystemOrderLog(ctx, {
        orderId: order._id,
        logType: 'PAYMENT_UPDATE',
        reason: 'Payment received',
        message: `Payment of ₱${orderPaymentAmount.toFixed(2)} ${webhookEvent.currency} received via Xendit (Transaction: ${webhookEvent.id})`,
        previousValue: 'PENDING',
        newValue: 'PAID',
        isPublic: true,
        actorId: systemUser._id,
      });

      // Create order log for status change to PROCESSING
      await createSystemOrderLog(ctx, {
        orderId: order._id,
        logType: 'STATUS_CHANGE',
        reason: 'Order status updated',
        message: `Order status changed to PROCESSING after payment confirmation`,
        previousValue: order.status,
        newValue: 'PROCESSING',
        isPublic: true,
        actorId: systemUser._id,
      });

      // Log the payment event for this order
      await logAction(
        ctx,
        'xendit_payment_received',
        'SYSTEM_EVENT',
        'HIGH',
        `Payment of ${orderPaymentAmount.toFixed(2)} ${webhookEvent.currency} received via Xendit for order ${order.orderNumber} (grouped payment)`,
        undefined, // System action
        order.organizationId,
        {
          paymentId,
          orderId: order._id,
          amount: orderPaymentAmount,
          transactionId: webhookEvent.id,
          provider: 'XENDIT',
          checkoutId,
        }
      );

      // Schedule payment received email for this order
      await ctx.scheduler.runAfter(0, internal.payments.actions.sendPaymentConfirmationEmail.sendPaymentConfirmationEmail, {
        orderId: order._id,
        paymentAmount: orderPaymentAmount,
        transactionId: webhookEvent.id,
      });
      console.log('Payment received email scheduled for order:', order.orderNumber);
    }

    // Update checkout session status to PAID
    await ctx.db.patch(session._id, {
      status: 'PAID',
      updatedAt: now,
    });

    console.log(`Successfully processed grouped Xendit payment for checkout session ${checkoutId}`);
    return {
      processed: true,
      paymentIds,
      orderIds,
      checkoutId,
    };
  }

  // Single order payment (backward compatibility)
  // Find the order by external_id (should match order number)
  const orderNumber = externalId;
  const order = await ctx.db
    .query('orders')
    .withIndex('by_isDeleted', (q) => q.eq('isDeleted', false))
    .filter((q) => q.eq(q.field('orderNumber'), orderNumber))
    .first();

  if (!order) {
    console.error(`Order not found for external_id: ${orderNumber}`);
    return { processed: false, reason: 'Order not found', statusCode: 404 };
  }

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
    paidAt: now, // Set payment timestamp for accurate payout period assignment
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

  // Create order log for payment received
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'PAYMENT_UPDATE',
    reason: 'Payment received',
    message: `Payment of ₱${paymentAmount.toFixed(2)} ${webhookEvent.currency} received via Xendit (Transaction: ${webhookEvent.id})`,
    previousValue: 'PENDING',
    newValue: 'PAID',
    isPublic: true,
    actorId: systemUser._id,
  });

  // Create order log for status change to PROCESSING
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'STATUS_CHANGE',
    reason: 'Order status updated',
    message: `Order status changed to PROCESSING after payment confirmation`,
    previousValue: order.status,
    newValue: 'PROCESSING',
    isPublic: true,
    actorId: systemUser._id,
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

  // Schedule payment confirmation email (non-blocking)
  await ctx.scheduler.runAfter(0, internal.payments.actions.sendPaymentConfirmationEmail.sendPaymentConfirmationEmail, {
    orderId: order._id,
    paymentAmount,
    transactionId: webhookEvent.id,
  });
  console.log('Payment confirmation email scheduled for order:', orderNumber);

  // Schedule Chatwoot notification for Messenger orders
  if (order.orderSource === 'MESSENGER') {
    await ctx.scheduler.runAfter(0, internal.chatwoot.orderFlow.sendPaymentConfirmation.sendPaymentConfirmationChatwoot, {
      orderId: order._id,
      orderNumber: orderNumber,
      paymentAmount,
    });
    console.log('Chatwoot payment confirmation scheduled for Messenger order:', orderNumber);
  }

  return {
    processed: true,
    paymentId,
    orderId: order._id,
  };
};
