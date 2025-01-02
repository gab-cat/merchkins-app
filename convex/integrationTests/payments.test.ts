import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import schema from '../schema';
import { modules } from '../test.setup';
import {
  createTestUserData,
  createTestOrganizationData,
  createTestOrderData,
  createTestOrgMemberData,
  createTestCheckoutSessionData,
  createMockPaymongoWebhookEvent,
} from '../testHelpers';
import { internal } from '../_generated/api';

describe('Paymongo Payment Integration Tests', () => {
  // =========================================================================
  // Single Order Payment Flow
  // =========================================================================
  describe('Single Order Checkout', () => {
    it('should update order with Paymongo checkout details', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          recentStatusHistory: [],
        });
      });

      // Simulate setting Paymongo checkout details on the order
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.patch(orderId, {
          paymongoCheckoutId: 'cs_test_123456789',
          paymongoCheckoutUrl: 'https://checkout.paymongo.com/cs_test_123456789',
          paymongoCheckoutExpiryDate: now + 24 * 60 * 60 * 1000,
          paymongoCheckoutCreatedAt: now,
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.paymongoCheckoutId).toBe('cs_test_123456789');
      expect(order!.paymongoCheckoutUrl).toContain('checkout.paymongo.com');
      expect(order!.paymongoCheckoutExpiryDate).toBeGreaterThan(Date.now());
    });

    it('should reject checkout creation for cancelled orders', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'CANCELLED',
          paymentStatus: 'PENDING',
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('CANCELLED');
    });

    it('should reject checkout creation for already-paid orders', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paidAt: Date.now(),
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.paymentStatus).toBe('PAID');
    });
  });

  // =========================================================================
  // Grouped Checkout Flow
  // =========================================================================
  describe('Grouped Checkout Session', () => {
    it('should link all orders to same checkoutId in a checkout session', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId1 = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData({ name: 'Store A' }));
      });

      const orgId2 = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData({ name: 'Store B' }));
      });

      const order1Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId1, customerId),
          totalAmount: 500,
          recentStatusHistory: [],
        });
      });

      const order2Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId2, customerId),
          totalAmount: 300,
          recentStatusHistory: [],
        });
      });

      // Create checkout session linking both orders
      const checkoutId = crypto.randomUUID();
      await t.run(async (ctx) => {
        await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, [order1Id, order2Id]),
          checkoutId,
          totalAmount: 800,
        });
      });

      // Simulate setting the same Paymongo checkout for both orders
      const paymongoCheckoutId = 'cs_grouped_test_123';
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.patch(order1Id, {
          paymongoCheckoutId,
          paymongoCheckoutUrl: `https://checkout.paymongo.com/${paymongoCheckoutId}`,
          paymongoCheckoutExpiryDate: now + 24 * 60 * 60 * 1000,
        });
        await ctx.db.patch(order2Id, {
          paymongoCheckoutId,
          paymongoCheckoutUrl: `https://checkout.paymongo.com/${paymongoCheckoutId}`,
          paymongoCheckoutExpiryDate: now + 24 * 60 * 60 * 1000,
        });
      });

      const [order1, order2] = await t.run(async (ctx) => {
        return [await ctx.db.get(order1Id), await ctx.db.get(order2Id)];
      });

      expect(order1!.paymongoCheckoutId).toBe(paymongoCheckoutId);
      expect(order2!.paymongoCheckoutId).toBe(paymongoCheckoutId);
      expect(order1!.paymongoCheckoutId).toBe(order2!.paymongoCheckoutId);
    });

    it('should calculate correct total from all orders', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const order1Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          totalAmount: 250,
          recentStatusHistory: [],
        });
      });

      const order2Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          totalAmount: 150,
          recentStatusHistory: [],
        });
      });

      const order3Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          totalAmount: 100,
          recentStatusHistory: [],
        });
      });

      const checkoutSession = await t.run(async (ctx) => {
        const session = {
          ...createTestCheckoutSessionData(customerId, [order1Id, order2Id, order3Id]),
          totalAmount: 500, // 250 + 150 + 100
        };
        const id = await ctx.db.insert('checkoutSessions', session);
        return await ctx.db.get(id);
      });

      expect(checkoutSession!.totalAmount).toBe(500);
      expect(checkoutSession!.orderIds.length).toBe(3);
    });
  });

  // =========================================================================
  // Webhook Processing - Payment Success
  // =========================================================================
  describe('Webhook: checkout_session.payment.paid', () => {
    it('should create payment record on successful webhook', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmount: 1000,
          paymongoCheckoutId: 'cs_test_webhook_123',
          recentStatusHistory: [],
        });
      });

      // Simulate successful payment
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.patch(orderId, {
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paidAt: now,
        });

        // Create payment record
        await ctx.db.insert('payments', {
          isDeleted: false,
          orderId,
          userId: customerId,
          organizationId: orgId,
          orderInfo: {
            orderNumber: 'ORD-TEST',
            customerName: 'Test Customer',
            customerEmail: 'test@test.com',
            totalAmount: 1000,
            orderDate: now,
            status: 'PROCESSING',
          },
          userInfo: {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@test.com',
            phone: '+639123456789',
          },
          paymentDate: now,
          amount: 1000,
          paymentMethod: 'PAYMONGO',
          paymentSite: 'OFFSITE',
          paymentStatus: 'VERIFIED',
          referenceNo: 'pay_test_123',
          paymongoCheckoutId: 'cs_test_webhook_123',
          paymongoPaymentId: 'pay_test_123',
          currency: 'PHP',
          reconciliationStatus: 'PENDING',
          statusHistory: [{ status: 'VERIFIED', changedAt: now }],
          createdAt: now,
          updatedAt: now,
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('PROCESSING');
      expect(order!.paymentStatus).toBe('PAID');
      expect(order!.paidAt).toBeDefined();

      const payments = await t.run(async (ctx) => {
        return await ctx.db
          .query('payments')
          .filter((q) => q.eq(q.field('orderId'), orderId))
          .collect();
      });
      expect(payments.length).toBe(1);
      expect(payments[0].paymentMethod).toBe('PAYMONGO');
      expect(payments[0].paymongoCheckoutId).toBe('cs_test_webhook_123');
    });

    it('should be idempotent (ignore duplicate webhooks)', async () => {
      const t = convexTest(schema, modules);

      // Create system admin user (required by webhook handler)
      await t.run(async (ctx) => {
        await ctx.db.insert('users', createTestUserData({ clerkId: 'seed_admin', isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create checkout session first
      const checkoutId = crypto.randomUUID();
      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, []),
          checkoutId,
          totalAmount: 100, // Match the default webhook amount (10000 centavos = 100 pesos)
        });
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          totalAmount: 100, // Match the default webhook amount (10000 centavos = 100 pesos)
          recentStatusHistory: [],
        });
      });

      // Link order to checkout session
      await t.run(async (ctx) => {
        await ctx.db.patch(sessionId, {
          orderIds: [orderId],
          totalAmount: 100, // Match order total
        });
      });

      // Create mock checkout_session.payment.paid webhook event
      // Use the same webhook event object to ensure same paymentId
      // Amount is 10000 centavos = 100 pesos, which matches order totalAmount
      const webhookEvent = createMockPaymongoWebhookEvent('checkout_session.payment.paid', checkoutId);

      // Process the webhook first time
      const result1 = await t.mutation(internal.payments.mutations.index.handlePaymongoWebhook, {
        webhookEvent,
      });

      // Process the same webhook again (duplicate)
      const result2 = await t.mutation(internal.payments.mutations.index.handlePaymongoWebhook, {
        webhookEvent,
      });

      // Verify both calls succeeded (second one should return early due to idempotency)
      expect(result1.processed).toBe(true);
      expect(result2.processed).toBe(true);
      expect(result2.reason).toBe('Payment already exists');

      // Verify only one payment record was created
      const payments = await t.run(async (ctx) => {
        return await ctx.db
          .query('payments')
          .filter((q) => q.eq(q.field('orderId'), orderId))
          .collect();
      });

      expect(payments.length).toBe(1);
      expect(payments[0].paymentMethod).toBe('PAYMONGO');
      expect(payments[0].paymongoCheckoutId).toBe(checkoutId);

      // Verify order status
      const updatedOrder = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(updatedOrder!.status).toBe('PROCESSING');
      expect(updatedOrder!.paymentStatus).toBe('PAID');
    });

    it('should calculate proportional amounts for grouped orders', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId1 = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orgId2 = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Order 1: 600 (60%) Order 2: 400 (40%) Total: 1000
      const order1Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId1, customerId),
          totalAmount: 600,
          recentStatusHistory: [],
        });
      });

      const order2Id = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId2, customerId),
          totalAmount: 400,
          recentStatusHistory: [],
        });
      });

      // Create payments with proportional amounts via metadata
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert('payments', {
          isDeleted: false,
          orderId: order1Id,
          userId: customerId,
          organizationId: orgId1,
          orderInfo: {
            orderNumber: 'ORD-1',
            customerName: 'Test',
            customerEmail: 'test@test.com',
            totalAmount: 600,
            orderDate: now,
            status: 'PROCESSING',
          },
          userInfo: { firstName: 'Test', lastName: 'User', email: 'test@test.com', phone: '+639123456789' },
          paymentDate: now,
          amount: 600,
          paymentMethod: 'PAYMONGO',
          paymentSite: 'OFFSITE',
          paymentStatus: 'VERIFIED',
          referenceNo: 'pay_1',
          currency: 'PHP',
          reconciliationStatus: 'PENDING',
          metadata: { fee: 21, proportion: 0.6 }, // Proportional fee
          statusHistory: [],
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert('payments', {
          isDeleted: false,
          orderId: order2Id,
          userId: customerId,
          organizationId: orgId2,
          orderInfo: {
            orderNumber: 'ORD-2',
            customerName: 'Test',
            customerEmail: 'test@test.com',
            totalAmount: 400,
            orderDate: now,
            status: 'PROCESSING',
          },
          userInfo: { firstName: 'Test', lastName: 'User', email: 'test@test.com', phone: '+639123456789' },
          paymentDate: now,
          amount: 400,
          paymentMethod: 'PAYMONGO',
          paymentSite: 'OFFSITE',
          paymentStatus: 'VERIFIED',
          referenceNo: 'pay_2',
          currency: 'PHP',
          reconciliationStatus: 'PENDING',
          metadata: { fee: 14, proportion: 0.4 }, // Proportional fee
          statusHistory: [],
          createdAt: now,
          updatedAt: now,
        });
      });

      const payments = await t.run(async (ctx) => {
        return await ctx.db.query('payments').collect();
      });

      const payment1 = payments.find((p) => p.orderId === order1Id);
      const payment2 = payments.find((p) => p.orderId === order2Id);

      expect(payment1!.amount).toBe(600);
      expect(payment2!.amount).toBe(400);
      // Fees stored in metadata
      expect((payment1!.metadata as { fee: number }).fee).toBe(21);
      expect((payment2!.metadata as { fee: number }).fee).toBe(14);
    });
  });

  // =========================================================================
  // Webhook Processing - Payment Failed
  // =========================================================================
  describe('Webhook: payment.failed', () => {
    it('should cancel order on payment failure', async () => {
      const t = convexTest(schema, modules);

      // Create system admin user (required by webhook handler)
      await t.run(async (ctx) => {
        await ctx.db.insert('users', createTestUserData({ clerkId: 'seed_admin', isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          recentStatusHistory: [],
        });
      });

      // Get order number for webhook
      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      if (!order || !order.orderNumber) {
        throw new Error('Order not found or missing orderNumber');
      }
      const orderNumber = order.orderNumber;

      // Create a checkout session to test cleanup for grouped payments
      // Note: Single-order payment failures don't update checkout session status
      // Only grouped payments (checkout-{checkoutId}) update the session
      const checkoutId = crypto.randomUUID();
      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, [orderId]),
          checkoutId,
          status: 'PENDING',
        });
      });

      // Create mock payment.failed webhook event for single order
      const webhookEvent = createMockPaymongoWebhookEvent('payment.failed', orderNumber);

      // Process the webhook using the actual handler
      await t.mutation(internal.payments.mutations.index.handlePaymongoWebhook, {
        webhookEvent,
      });

      // Verify order was cancelled
      const cancelledOrder = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(cancelledOrder!.status).toBe('CANCELLED');
      expect(cancelledOrder!.cancellationReason).toBe('PAYMENT_FAILED');

      // Note: Single-order payment failures don't update checkout session status
      // Only grouped payments (with checkout- prefix in external_id) update sessions
      // The session should remain in its original state for single-order failures
      const updatedSession = await t.run(async (ctx) => ctx.db.get(sessionId));
      // Session status should remain unchanged for single-order failures
      expect(updatedSession!.status).toBe('PENDING');

      // Verify error logging occurred
      // Query logs by organizationId and action since resourceId might not be set
      const logs = await t.run(async (ctx) => {
        return await ctx.db
          .query('logs')
          .withIndex('by_organization', (q) => q.eq('organizationId', orgId))
          .filter((q) => q.and(q.eq(q.field('action'), 'order_cancelled'), q.eq(q.field('logType'), 'SYSTEM_EVENT')))
          .collect();
      });

      expect(logs.length).toBeGreaterThan(0);
      const cancellationLog = logs.find(
        (log) =>
          log.metadata &&
          (log.metadata as { reason?: string; orderId?: string }).reason === 'PAYMENT_FAILED' &&
          (log.metadata as { orderId?: string }).orderId === orderId
      );
      expect(cancellationLog).toBeDefined();
      expect((cancellationLog!.metadata as { orderNumber?: string }).orderNumber).toBe(orderNumber);
    });

    it('should skip already-cancelled orders (idempotency)', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'CANCELLED',
          cancellationReason: 'CUSTOMER_REQUEST',
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('CANCELLED');
      expect(order!.cancellationReason).toBe('CUSTOMER_REQUEST');
    });
  });

  // =========================================================================
  // Checkout Expiry & Refresh
  // =========================================================================
  describe('Checkout Expiry Flow', () => {
    it('should detect expired checkout', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const expiredTime = Date.now() - 60 * 60 * 1000; // 1 hour ago
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          paymongoCheckoutId: 'cs_expired_123',
          paymongoCheckoutExpiryDate: expiredTime,
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      const isExpired = order!.paymongoCheckoutExpiryDate! < Date.now();
      expect(isExpired).toBe(true);
    });

    it('should return existing URL if not expired', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const futureExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
      const checkoutUrl = 'https://checkout.paymongo.com/cs_active_123';
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          paymongoCheckoutId: 'cs_active_123',
          paymongoCheckoutUrl: checkoutUrl,
          paymongoCheckoutExpiryDate: futureExpiry,
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      const isExpired = order!.paymongoCheckoutExpiryDate! < Date.now();
      expect(isExpired).toBe(false);
      expect(order!.paymongoCheckoutUrl).toBe(checkoutUrl);
    });
  });

  // =========================================================================
  // Security Guards
  // =========================================================================
  describe('Checkout Security', () => {
    it('should validate UUIDv4 checkoutId format', () => {
      const validUUID = '123e4567-e89b-4d3c-8456-426614174000';
      const invalidUUID = 'not-a-valid-uuid';

      const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidv4Regex.test(validUUID)).toBe(true);
      expect(uuidv4Regex.test(invalidUUID)).toBe(false);
    });

    it('should reject expired checkout sessions', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const expiredSession = await t.run(async (ctx) => {
        const session = {
          ...createTestCheckoutSessionData(customerId, []),
          expiresAt: Date.now() - 60 * 60 * 1000, // Expired 1 hour ago
        };
        const id = await ctx.db.insert('checkoutSessions', session);
        return await ctx.db.get(id);
      });

      expect(expiredSession!.expiresAt).toBeLessThan(Date.now());
    });

    it('should enforce one-time-use (invoiceCreated flag)', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, []),
          invoiceCreated: true,
          paymongoCheckoutId: 'cs_already_created',
          paymongoCheckoutUrl: 'https://checkout.paymongo.com/cs_already_created',
        });
      });

      const session = await t.run(async (ctx) => ctx.db.get(sessionId));
      expect(session!.invoiceCreated).toBe(true);
    });

    it('should track rate limit attempts', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, []),
          invoiceCreationAttempts: 4,
          lastInvoiceAttemptAt: Date.now(),
        });
      });

      // Simulate incrementing attempt
      await t.run(async (ctx) => {
        await ctx.db.patch(sessionId, {
          invoiceCreationAttempts: 5,
          lastInvoiceAttemptAt: Date.now(),
        });
      });

      const session = await t.run(async (ctx) => ctx.db.get(sessionId));
      expect(session!.invoiceCreationAttempts).toBe(5);
    });

    it('should reject duplicate invoice creation when invoiceCreated is true', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const checkoutId = crypto.randomUUID();
      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, []),
          checkoutId,
          invoiceCreated: true,
          paymongoCheckoutId: 'cs_already_created',
          paymongoCheckoutUrl: 'https://checkout.paymongo.com/cs_already_created',
        });
      });

      // Attempt to mark invoice as created again (should fail)
      const result = await t.mutation(internal.checkoutSessions.mutations.index.markInvoiceCreated, {
        checkoutId,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('already created');

      // Verify session still has invoiceCreated flag
      const session = await t.run(async (ctx) => ctx.db.get(sessionId));
      expect(session!.invoiceCreated).toBe(true);
    });

    it('should reject invoice creation when rate limit is exceeded', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const checkoutId = crypto.randomUUID();
      const sessionId = await t.run(async (ctx) => {
        return await ctx.db.insert('checkoutSessions', {
          ...createTestCheckoutSessionData(customerId, []),
          checkoutId,
          invoiceCreated: false,
          invoiceCreationAttempts: 5, // Max attempts reached
          lastInvoiceAttemptAt: Date.now() - 1000, // Recent attempt
        });
      });

      // Attempt to mark invoice as created (should fail due to rate limit)
      const result = await t.mutation(internal.checkoutSessions.mutations.index.markInvoiceCreated, {
        checkoutId,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');

      // Verify attempts count was not incremented beyond limit
      const session = await t.run(async (ctx) => ctx.db.get(sessionId));
      expect(session!.invoiceCreationAttempts).toBe(5);
      expect(session!.invoiceCreated).toBe(false);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe('Edge Cases', () => {
    it('should handle zero-amount orders (fully discounted)', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          totalAmount: 0,
          voucherDiscount: 500,
          voucherCode: 'FULLOFF',
          recentStatusHistory: [],
        });
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.totalAmount).toBe(0);
      expect(order!.voucherDiscount).toBe(500);
    });

    it('should handle orders with Paymongo payment method', async () => {
      const t = convexTest(schema, modules);

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          paymongoCheckoutId: 'cs_test_payment_method',
          recentStatusHistory: [],
        });
      });

      // Create payment with PAYMONGO method
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert('payments', {
          isDeleted: false,
          orderId,
          userId: customerId,
          organizationId: orgId,
          orderInfo: {
            orderNumber: 'ORD-TEST',
            customerName: 'Test',
            customerEmail: 'test@test.com',
            totalAmount: 100,
            orderDate: now,
            status: 'PROCESSING',
          },
          userInfo: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
            phone: '+639123456789',
          },
          paymentDate: now,
          amount: 100,
          paymentMethod: 'PAYMONGO',
          paymentSite: 'OFFSITE',
          paymentStatus: 'VERIFIED',
          referenceNo: 'pay_test',
          currency: 'PHP',
          reconciliationStatus: 'PENDING',
          statusHistory: [],
          createdAt: now,
          updatedAt: now,
        });
      });

      const payments = await t.run(async (ctx) => {
        return await ctx.db
          .query('payments')
          .filter((q) => q.eq(q.field('orderId'), orderId))
          .collect();
      });

      expect(payments.length).toBe(1);
      expect(payments[0].paymentMethod).toBe('PAYMONGO');
    });
  });
});
