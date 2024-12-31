import { MutationCtx } from '../../_generated/server';
import { logAction, isTestMode } from '../../helpers';
import { internal } from '../../_generated/api';
import type { PaymongoWebhookEvent } from '../../../types/paymongo';
import { v } from 'convex/values';
import { Doc } from '../../_generated/dataModel';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const handlePaymongoWebhookArgs = {
  webhookEvent: v.any(), // Allow any webhook data from Paymongo
};

export const handlePaymongoWebhookHandler = async (ctx: MutationCtx, args: { webhookEvent: PaymongoWebhookEvent }) => {
  const webhookEvent = args.webhookEvent;

  // Get the system admin user for webhook operations
  const systemUser = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', 'seed_admin'))
    .first();

  if (!systemUser) {
    console.error('System admin user not found');
    throw new Error('System admin user not found');
  }

  const now = Date.now();

  // Extract checkout session or payment data based on event type
  // Extract event type from nested structure (Paymongo webhooks)
  // The actual event type is at webhookEvent.data.attributes.type, not webhookEvent.type
  const eventAttributes = webhookEvent.data?.attributes as Record<string, unknown> | undefined;
  const eventType = (eventAttributes?.type as string) || webhookEvent.type;

  // Handle payment failed event
  if (eventType === 'payment.failed') {
    // Get external_id/reference from metadata
    const attributes = webhookEvent.data.attributes as Record<string, unknown>;
    const metadata = (attributes.metadata as Record<string, string>) || {};
    const externalId = metadata.external_id || metadata.reference_number || '';

    if (!externalId) {
      console.error('No external_id found in payment.failed webhook');
      return { processed: false, reason: 'No external ID' };
    }

    const isGroupedPayment = externalId.startsWith('checkout-');

    if (isGroupedPayment) {
      // Handle checkout session payment failure
      const checkoutId = externalId.replace('checkout-', '');

      const session = await ctx.db
        .query('checkoutSessions')
        .withIndex('by_checkout_id', (q) => q.eq('checkoutId', checkoutId))
        .first();

      if (!session) {
        console.error(`Checkout session not found for external_id: ${externalId}`);
        return { processed: false, reason: 'Checkout session not found', statusCode: 404 };
      }

      if (session.status === 'EXPIRED' || session.status === 'CANCELLED') {
        console.log(`Checkout session ${checkoutId} already ${session.status}`);
        return { processed: true, reason: 'Session already processed' };
      }

      // Get all orders in the session
      const orders = await Promise.all(session.orderIds.map((orderId) => ctx.db.get(orderId)));
      const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

      const cancelledOrderIds: string[] = [];

      for (const order of validOrders) {
        if (order.status === 'PENDING' && order.paymentStatus === 'PENDING') {
          try {
            await ctx.runMutation(internal.orders.mutations.index.cancelOrderInternal, {
              orderId: order._id,
              reason: 'PAYMENT_FAILED',
              message: 'Payment failed',
              actorId: systemUser._id,
              actorName: 'Paymongo Payment System',
            });
            cancelledOrderIds.push(order._id);

            await logAction(
              ctx,
              'order_cancelled',
              'SYSTEM_EVENT',
              'MEDIUM',
              `Order ${order.orderNumber} cancelled due to payment failure`,
              undefined,
              order.organizationId,
              {
                orderId: order._id,
                orderNumber: order.orderNumber,
                reason: 'PAYMENT_FAILED',
                checkoutId: session.checkoutId,
                transactionId: webhookEvent.id,
              }
            );
          } catch (error) {
            console.error(`Error cancelling order ${order._id}:`, error);
          }
        }
      }

      await ctx.db.patch(session._id, {
        status: 'EXPIRED',
        updatedAt: now,
      });

      console.log(`Processed payment.failed for checkout session ${checkoutId}, cancelled ${cancelledOrderIds.length} orders`);
      return { processed: true, cancelledOrderIds, checkoutId };
    } else {
      // Handle single order payment failure
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

      if (order.status !== 'PENDING' || order.paymentStatus !== 'PENDING') {
        console.log(`Order ${orderNumber} is not pending, skipping cancellation`);
        return { processed: true, reason: 'Order not pending' };
      }

      try {
        await ctx.runMutation(internal.orders.mutations.index.cancelOrderInternal, {
          orderId: order._id,
          reason: 'PAYMENT_FAILED',
          message: 'Payment failed',
          actorId: systemUser._id,
          actorName: 'Paymongo Payment System',
        });

        await logAction(
          ctx,
          'order_cancelled',
          'SYSTEM_EVENT',
          'MEDIUM',
          `Order ${order.orderNumber} cancelled due to payment failure`,
          undefined,
          order.organizationId,
          {
            orderId: order._id,
            orderNumber: order.orderNumber,
            reason: 'PAYMENT_FAILED',
            transactionId: webhookEvent.id,
          }
        );

        return { processed: true, orderId: order._id };
      } catch (error) {
        console.error(`Error cancelling order ${orderNumber}:`, error);
        return { processed: false, reason: 'Error cancelling order', error: String(error) };
      }
    }
  }

  // Handle checkout_session.payment.paid event
  if (eventType !== 'checkout_session.payment.paid' && eventType !== 'payment.paid') {
    console.log(`Ignoring webhook event with type: ${eventType}`);
    return { processed: false, reason: 'Unhandled event type' };
  }

  // Extract payment data based on event type
  let paymentAmount = 0; // In centavos
  let processingFee = 0;
  let netAmount = 0;
  let currency = 'PHP';
  let paymentId = webhookEvent.id;
  let externalId = '';
  let metadata: Record<string, string> = {};

  if (eventType === 'checkout_session.payment.paid') {
    // For checkout_session.payment.paid, data is at webhookEvent.data.attributes (checkout session)
    const checkoutAttributes = webhookEvent.data.attributes as Record<string, unknown>;
    const payments = (checkoutAttributes.payments as Array<{ id: string; type: string; attributes: Record<string, unknown> }>) || [];
    metadata = (checkoutAttributes.metadata as Record<string, string>) || {};
    externalId = metadata.external_id || (checkoutAttributes.reference_number as string) || '';

    // Get payment details from the first payment
    const firstPayment = payments[0];
    const paymentAttributes = firstPayment?.attributes || {};
    paymentAmount = (paymentAttributes.amount as number) || 0; // In centavos
    processingFee = (paymentAttributes.fee as number) || 0;
    netAmount = (paymentAttributes.net_amount as number) || paymentAmount - processingFee;
    currency = (paymentAttributes.currency as string) || 'PHP';
    paymentId = firstPayment?.id || webhookEvent.id;
  } else if (eventType === 'payment.paid') {
    // For payment.paid, data is nested at webhookEvent.data.attributes.data (payment object)
    const eventAttributes = webhookEvent.data.attributes as Record<string, unknown>;
    const paymentData = eventAttributes.data as { id: string; type: string; attributes: Record<string, unknown> } | undefined;

    if (paymentData) {
      const paymentAttributes = paymentData.attributes || {};
      paymentAmount = (paymentAttributes.amount as number) || 0; // In centavos
      processingFee = (paymentAttributes.fee as number) || 0;
      netAmount = (paymentAttributes.net_amount as number) || paymentAmount - processingFee;
      currency = (paymentAttributes.currency as string) || 'PHP';
      paymentId = paymentData.id || webhookEvent.id;
      metadata = (paymentAttributes.metadata as Record<string, string>) || {};
      externalId = metadata.external_id || metadata.reference_number || '';

      // Also check description for order numbers (fallback)
      const description = (paymentAttributes.description as string) || '';
      if (!externalId && description) {
        // Try to extract order numbers from description like "Payment for 2 orders from 2 stores: ORD-20260105-BU78Q4, ORD-20260105-DBACSF"
        const orderMatches = description.match(/ORD-[A-Z0-9-]+/g);
        if (orderMatches && orderMatches.length > 0) {
          if (orderMatches.length === 1) {
            // Single order - safe to process
            externalId = orderMatches[0];
          } else {
            // Multiple orders detected - try to find related checkout session
            const orderNumbers = orderMatches;
            console.log(
              `Payment description contains multiple orders (${orderNumbers.length}): ${orderNumbers.join(', ')}. Attempting to find checkout session.`
            );

            // Find orders by their order numbers
            const orders = await Promise.all(
              orderNumbers.map((orderNumber) =>
                ctx.db
                  .query('orders')
                  .withIndex('by_isDeleted', (q) => q.eq('isDeleted', false))
                  .filter((q) => q.eq(q.field('orderNumber'), orderNumber))
                  .first()
              )
            );

            const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null);
            const orderIds = validOrders.map((order) => order._id);

            if (validOrders.length !== orderNumbers.length) {
              const foundOrderNumbers = validOrders.map((o) => o.orderNumber);
              const missingOrderNumbers = orderNumbers.filter((on) => !foundOrderNumbers.includes(on));
              console.error(`Cannot process multi-order payment: Some orders not found. Missing: ${missingOrderNumbers.join(', ')}`);
              return {
                processed: false,
                reason: 'Multi-order payment detected but some orders not found',
                missingOrders: missingOrderNumbers,
              };
            }

            // Find checkout session that contains all these orders
            // Query pending/active checkout sessions and check if they contain all order IDs
            const allSessions = await ctx.db
              .query('checkoutSessions')
              .withIndex('by_status', (q) => q.eq('status', 'PENDING'))
              .collect();

            const matchingSession = allSessions.find((session) => {
              // Check if session contains all order IDs
              return orderIds.every((orderId) => session.orderIds.includes(orderId)) && session.orderIds.length === orderIds.length;
            });

            if (matchingSession) {
              // Found matching checkout session - use it for grouped payment processing
              externalId = `checkout-${matchingSession.checkoutId}`;
              console.log(`Found matching checkout session ${matchingSession.checkoutId} for multi-order payment`);
            } else {
              // No matching session found - prevent partial processing
              console.error(`Cannot process multi-order payment: No checkout session found containing all orders: ${orderNumbers.join(', ')}`);
              return {
                processed: false,
                reason: 'Multi-order payment detected but no matching checkout session found',
                orderNumbers,
                orderIds: orderIds.map((id) => id),
              };
            }
          }
        }
      }
    }
  }

  // Convert from centavos to pesos
  const amountInPesos = paymentAmount / 100;
  const feeInPesos = processingFee / 100;
  const netInPesos = netAmount / 100;

  if (!externalId) {
    console.error('No external_id found in webhook', {
      eventType,
      paymentId,
      hasMetadata: Object.keys(metadata).length > 0,
    });
    return { processed: false, reason: 'No external ID' };
  }

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

    // Check if payment already processed
    const existingPayment = await ctx.db
      .query('payments')
      .withIndex('by_order', (q) => q.eq('orderId', session.orderIds[0]))
      .filter((q) =>
        q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), paymentId), q.eq(q.field('paymentProvider'), 'PAYMONGO'))
      )
      .first();

    if (existingPayment) {
      console.log(`Payment already processed for transaction: ${paymentId}`);
      return { processed: true, reason: 'Payment already exists' };
    }

    // Get all orders in the session
    const orders = await Promise.all(session.orderIds.map((orderId) => ctx.db.get(orderId)));
    const validOrders = orders.filter((order): order is NonNullable<typeof order> => order !== null && !order.isDeleted);

    if (validOrders.length === 0) {
      console.error(`No valid orders found in checkout session: ${checkoutId}`);
      return { processed: false, reason: 'No valid orders found', statusCode: 404 };
    }

    const paymentIds: string[] = [];
    const orderIds: string[] = [];

    for (const order of validOrders) {
      // Check if payment already exists for this specific order
      const orderExistingPayment = await ctx.db
        .query('payments')
        .withIndex('by_order', (q) => q.eq('orderId', order._id))
        .filter((q) =>
          q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), paymentId), q.eq(q.field('paymentProvider'), 'PAYMONGO'))
        )
        .first();

      if (orderExistingPayment) {
        console.log(`Payment already exists for order ${order._id}`);
        continue;
      }

      // Calculate proportional payment amount
      const orderPaymentAmount = (order.totalAmount / session.totalAmount) * amountInPesos;
      const orderProcessingFee = (order.totalAmount / session.totalAmount) * feeInPesos;
      const orderNetAmount = Math.max(0, orderPaymentAmount - orderProcessingFee);

      const paymentDoc = {
        isDeleted: false,
        organizationId: order.organizationId,
        orderId: order._id,
        userId: order.customerId,
        processedById: undefined,
        paymentDate: now,
        amount: orderPaymentAmount,
        processingFee: orderProcessingFee || undefined,
        netAmount: orderNetAmount,
        paymentMethod: 'PAYMONGO' as const,
        paymentSite: 'OFFSITE' as const,
        paymentStatus: 'VERIFIED' as const,
        referenceNo: `PAYMONGO-${paymentId}`,
        currency,
        transactionId: paymentId,
        paymentProvider: 'PAYMONGO',
        paymongoCheckoutId: webhookEvent.data.id,
        paymongoPaymentId: paymentId,
        metadata: webhookEvent as unknown as Record<string, unknown>,

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
            changedByName: 'Paymongo Payment System',
            reason: 'Payment confirmed via webhook (grouped payment)',
            changedAt: now,
          },
        ],

        createdAt: now,
        updatedAt: now,
      };

      const createdPaymentId = await ctx.db.insert('payments', paymentDoc);
      paymentIds.push(createdPaymentId);
      orderIds.push(order._id);

      // Update order status
      const statusUpdate = {
        status: 'PROCESSING' as const,
        changedBy: systemUser._id,
        changedByName: 'Paymongo Payment System',
        reason: 'Payment confirmed via webhook (grouped payment)',
        changedAt: now,
      };

      const currentHistory = order.recentStatusHistory || [];
      const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)];

      await ctx.db.patch(order._id, {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paidAt: now,
        recentStatusHistory: updatedHistory as Doc<'orders'>['recentStatusHistory'],
        updatedAt: now,
      });

      // Recalculate order payment stats
      await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
        orderId: order._id,
        actorId: systemUser._id,
        actorName: 'Paymongo Payment System',
      });

      // Create order logs
      await createSystemOrderLog(ctx, {
        orderId: order._id,
        logType: 'PAYMENT_UPDATE',
        reason: 'Payment received',
        message: `Payment of ₱${orderPaymentAmount.toFixed(2)} ${currency} received via Paymongo (Transaction: ${paymentId})`,
        previousValue: 'PENDING',
        newValue: 'PAID',
        isPublic: true,
        actorId: systemUser._id,
      });

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
        'paymongo_payment_received',
        'SYSTEM_EVENT',
        'HIGH',
        `Payment of ${orderPaymentAmount.toFixed(2)} ${currency} received via Paymongo for order ${order.orderNumber} (grouped payment)`,
        undefined,
        order.organizationId,
        {
          paymentId: createdPaymentId,
          orderId: order._id,
          amount: orderPaymentAmount,
          transactionId: paymentId,
          provider: 'PAYMONGO',
          checkoutId,
        }
      );

      // Schedule payment received email (skip in test mode to prevent convex-test transaction errors)
      if (!isTestMode()) {
        await ctx.scheduler.runAfter(0, internal.payments.actions.sendPaymentConfirmationEmail.sendPaymentConfirmationEmail, {
          orderId: order._id,
          paymentAmount: orderPaymentAmount,
          transactionId: paymentId,
        });
      }
    }

    // Update checkout session status to PAID
    await ctx.db.patch(session._id, {
      status: 'PAID',
      updatedAt: now,
    });

    console.log(`Successfully processed grouped Paymongo payment for checkout session ${checkoutId}`);
    return { processed: true, paymentIds, orderIds, checkoutId };
  }

  // Single order payment
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

  // Check if payment already exists
  const existingPayment = await ctx.db
    .query('payments')
    .withIndex('by_order', (q) => q.eq('orderId', order._id))
    .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('transactionId'), paymentId), q.eq(q.field('paymentProvider'), 'PAYMONGO')))
    .first();

  if (existingPayment) {
    console.log(`Payment already processed for transaction: ${paymentId}`);
    return { processed: true, reason: 'Payment already exists' };
  }

  // Create payment record
  const paymentDoc = {
    isDeleted: false,
    organizationId: order.organizationId,
    orderId: order._id,
    userId: order.customerId,
    processedById: undefined,
    paymentDate: now,
    amount: amountInPesos,
    processingFee: feeInPesos || undefined,
    netAmount: netInPesos,
    paymentMethod: 'PAYMONGO' as const,
    paymentSite: 'OFFSITE' as const,
    paymentStatus: 'VERIFIED' as const,
    referenceNo: `PAYMONGO-${paymentId}`,
    currency,
    transactionId: paymentId,
    paymentProvider: 'PAYMONGO',
    paymongoCheckoutId: webhookEvent.data.id,
    paymongoPaymentId: paymentId,
    metadata: webhookEvent as unknown as Record<string, unknown>,

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
        changedByName: 'Paymongo Payment System',
        reason: 'Payment verified via webhook',
        changedAt: now,
      },
    ],

    createdAt: now,
    updatedAt: now,
  };

  const createdPaymentId = await ctx.db.insert('payments', paymentDoc);

  // Update order status
  await ctx.db.patch(order._id, {
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paidAt: now,
    updatedAt: now,
  });

  const statusUpdate = {
    status: 'PROCESSING',
    changedBy: systemUser._id,
    changedByName: 'Paymongo Payment System',
    reason: 'Payment confirmed via webhook',
    changedAt: now,
  };

  const currentHistory = order.recentStatusHistory || [];
  const updatedHistory = [statusUpdate, ...currentHistory.slice(0, 4)];

  await ctx.db.patch(order._id, {
    recentStatusHistory: updatedHistory as Doc<'orders'>['recentStatusHistory'],
  });

  // Recalculate order payment stats
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: order._id,
    actorId: systemUser._id,
    actorName: 'Paymongo Payment System',
  });

  // Create order logs
  await createSystemOrderLog(ctx, {
    orderId: order._id,
    logType: 'PAYMENT_UPDATE',
    reason: 'Payment received',
    message: `Payment of ₱${amountInPesos.toFixed(2)} ${currency} received via Paymongo (Transaction: ${paymentId})`,
    previousValue: 'PENDING',
    newValue: 'PAID',
    isPublic: true,
    actorId: systemUser._id,
  });

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
    'paymongo_payment_received',
    'SYSTEM_EVENT',
    'HIGH',
    `Payment of ${amountInPesos} ${currency} received via Paymongo for order ${orderNumber}`,
    undefined,
    order.organizationId,
    {
      paymentId: createdPaymentId,
      orderId: order._id,
      amount: amountInPesos,
      transactionId: paymentId,
      provider: 'PAYMONGO',
    }
  );

  console.log(`Successfully processed Paymongo payment for order ${orderNumber}`);

  // Schedule payment confirmation email (skip in test mode to prevent convex-test transaction errors)
  if (!isTestMode()) {
    await ctx.scheduler.runAfter(0, internal.payments.actions.sendPaymentConfirmationEmail.sendPaymentConfirmationEmail, {
      orderId: order._id,
      paymentAmount: amountInPesos,
      transactionId: paymentId,
    });

    // Schedule Chatwoot notification for Messenger orders
    if (order.orderSource === 'MESSENGER') {
      await ctx.scheduler.runAfter(0, internal.chatwoot.orderFlow.sendPaymentConfirmation.sendPaymentConfirmationChatwoot, {
        orderId: order._id,
        orderNumber: orderNumber,
        paymentAmount: amountInPesos,
      });
    }
  }

  return {
    processed: true,
    paymentId: createdPaymentId,
    orderId: order._id,
  };
};
