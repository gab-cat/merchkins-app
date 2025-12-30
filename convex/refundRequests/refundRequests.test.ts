import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api, internal } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import {
  createTestUserData,
  createTestOrganizationData,
  createTestOrderData,
  createTestPaymentData,
  getPastTimestamp,
  REFUND_WINDOW_MS,
  MONETARY_REFUND_DELAY_MS,
  ONE_HOUR_MS,
} from '../testHelpers';

/**
 * Refund Requests Domain Tests
 *
 * Tests the refund request system including:
 * - Creating refund requests (customer-initiated)
 * - 24-hour refund window validation
 * - Approving refund requests (creates refund voucher)
 * - Rejecting refund requests (order continues)
 * - Refund voucher creation with proper cancellationInitiator
 *
 * Business Rules from Knowledge Base:
 * - Customers can request refund within 24 hours of payment
 * - Only PAID orders can be refunded
 * - DELIVERED or CANCELLED orders cannot be refunded
 * - Customer-initiated refunds: voucher NOT eligible for monetary refund
 * - Seller-initiated refunds: voucher eligible after 14 days
 */

describe('Refund Requests Domain', () => {
  // =========================================================================
  // createRefundRequest Mutation Tests
  // =========================================================================
  describe('createRefundRequest', () => {
    describe('validation rules', () => {
      it('should reject refund request for non-owned order', async () => {
        const t = convexTest(schema, modules);

        // Create admin user
        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
        });

        // Create customer who owns the order
        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        // Create a different user who will try to request refund
        const differentUserId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'different_clerk' }));
        });

        // Create organization
        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        // Create order owned by customerId
        const orderId = await t.run(async (ctx) => {
          const now = Date.now();
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            paymentStatus: 'PAID',
          });
        });

        // Create payment for the order
        await t.run(async (ctx) => {
          await ctx.db.insert('payments', createTestPaymentData(orderId, customerId, orgId));
        });

        // Try to request refund as a different user
        const asDifferentUser = t.withIdentity({ subject: 'different_clerk' });

        await expect(
          asDifferentUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('own orders');
      });

      it('should reject refund request for unpaid order', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, userId),
            paymentStatus: 'PENDING', // Not paid
          });
        });

        const asUser = t.withIdentity({ subject: 'test_clerk' });

        await expect(
          asUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('only available for paid orders');
      });

      it('should reject refund request for delivered order', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, userId),
            status: 'DELIVERED',
            paymentStatus: 'PAID',
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('payments', createTestPaymentData(orderId, userId, orgId));
        });

        const asUser = t.withIdentity({ subject: 'test_clerk' });

        await expect(
          asUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('delivered orders');
      });

      it('should reject refund request for cancelled order', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, userId),
            status: 'CANCELLED',
            paymentStatus: 'PAID',
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('payments', createTestPaymentData(orderId, userId, orgId));
        });

        const asUser = t.withIdentity({ subject: 'test_clerk' });

        await expect(
          asUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('already cancelled');
      });

      it('should reject refund request after 24-hour window', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, userId),
            paymentStatus: 'PAID',
          });
        });

        // Create payment that was made over 24 hours ago
        await t.run(async (ctx) => {
          const paymentDate = getPastTimestamp(25); // 25 hours ago
          await ctx.db.insert('payments', {
            ...createTestPaymentData(orderId, userId, orgId),
            paymentDate,
            createdAt: paymentDate,
          });
        });

        const asUser = t.withIdentity({ subject: 'test_clerk' });

        await expect(
          asUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('within 24 hours');
      });

      it('should reject duplicate pending refund request', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, userId),
            paymentStatus: 'PAID',
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('payments', createTestPaymentData(orderId, userId, orgId));
        });

        // Create an existing pending refund request
        await t.run(async (ctx) => {
          await ctx.db.insert('refundRequests', {
            isDeleted: false,
            orderId,
            requestedById: userId,
            organizationId: orgId,
            status: 'PENDING',
            reason: 'WRONG_SIZE',
            refundAmount: 100,
            orderInfo: {
              orderNumber: 'ORD-TEST',
              totalAmount: 100,
              status: 'PENDING',
              paymentStatus: 'PAID',
              orderDate: Date.now(),
            },
            customerInfo: {
              email: 'test@test.com',
              phone: '+639123456789',
            },
            organizationInfo: {
              name: 'Test Org',
              slug: 'test-org',
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        });

        const asUser = t.withIdentity({ subject: 'test_clerk' });

        await expect(
          asUser.mutation(api.refundRequests.mutations.index.createRefundRequest, {
            orderId,
            reason: 'CHANGED_MIND',
          })
        ).rejects.toThrow('pending refund request already exists');
      });
    });
  });

  // =========================================================================
  // createRefundVoucher Internal Mutation Tests
  // =========================================================================
  describe('createRefundVoucher', () => {
    it('should create customer-initiated refund voucher without monetary refund eligibility', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, userId));
      });

      // Create refund voucher with CUSTOMER cancellation initiator
      const voucherId = await t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
        orderId,
        amount: 500,
        assignedToUserId: userId,
        createdById: userId,
        cancellationInitiator: 'CUSTOMER',
      });

      const voucher = await t.run(async (ctx) => {
        return await ctx.db.get(voucherId);
      });

      expect(voucher).not.toBeNull();
      expect(voucher!.discountType).toBe('REFUND');
      expect(voucher!.discountValue).toBe(500);
      expect(voucher!.assignedToUserId).toBe(userId);
      expect(voucher!.cancellationInitiator).toBe('CUSTOMER');
      expect(voucher!.monetaryRefundEligibleAt).toBeUndefined();
      expect(voucher!.usageLimit).toBe(1);
      expect(voucher!.organizationId).toBeUndefined(); // Platform-wide
    });

    it('should create seller-initiated refund voucher with 14-day monetary refund eligibility', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, userId));
      });

      const beforeCreate = Date.now();

      // Create refund voucher with SELLER cancellation initiator
      const voucherId = await t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
        orderId,
        amount: 1000,
        assignedToUserId: userId,
        createdById: adminId,
        cancellationInitiator: 'SELLER',
      });

      const afterCreate = Date.now();

      const voucher = await t.run(async (ctx) => {
        return await ctx.db.get(voucherId);
      });

      expect(voucher).not.toBeNull();
      expect(voucher!.cancellationInitiator).toBe('SELLER');
      expect(voucher!.monetaryRefundEligibleAt).toBeDefined();

      // monetaryRefundEligibleAt should be ~14 days after creation
      const eligibleAt = voucher!.monetaryRefundEligibleAt!;
      expect(eligibleAt).toBeGreaterThanOrEqual(beforeCreate + MONETARY_REFUND_DELAY_MS);
      expect(eligibleAt).toBeLessThanOrEqual(afterCreate + MONETARY_REFUND_DELAY_MS);
    });

    it('should reject refund voucher with non-positive amount', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, userId));
      });

      await expect(
        t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
          orderId,
          amount: 0, // Invalid
          assignedToUserId: userId,
          createdById: userId,
          cancellationInitiator: 'CUSTOMER',
        })
      ).rejects.toThrow('positive number');

      await expect(
        t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
          orderId,
          amount: -100, // Invalid
          assignedToUserId: userId,
          createdById: userId,
          cancellationInitiator: 'SELLER',
        })
      ).rejects.toThrow('positive number');
    });
  });

  // =========================================================================
  // Refund Request Status Transitions Tests
  // =========================================================================
  describe('status transitions', () => {
    it('should reject already approved refund request', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, userId));
      });

      // Create already approved refund request
      const refundRequestId = await t.run(async (ctx) => {
        return await ctx.db.insert('refundRequests', {
          isDeleted: false,
          orderId,
          requestedById: userId,
          organizationId: orgId,
          status: 'APPROVED', // Already approved
          reason: 'WRONG_SIZE',
          refundAmount: 100,
          orderInfo: {
            orderNumber: 'ORD-TEST',
            totalAmount: 100,
            status: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            orderDate: Date.now(),
          },
          customerInfo: { email: 'test@test.com', phone: '+639123456789' },
          organizationInfo: { name: 'Test Org', slug: 'test-org' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      await expect(
        asAdmin.mutation(api.refundRequests.mutations.index.approveRefundRequest, {
          refundRequestId,
          adminMessage: 'Approving this refund request again',
        })
      ).rejects.toThrow('already approved');
    });

    it('should reject already rejected refund request', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, userId));
      });

      // Create already rejected refund request
      const refundRequestId = await t.run(async (ctx) => {
        return await ctx.db.insert('refundRequests', {
          isDeleted: false,
          orderId,
          requestedById: userId,
          organizationId: orgId,
          status: 'REJECTED', // Already rejected
          reason: 'WRONG_SIZE',
          adminMessage: 'Already rejected',
          refundAmount: 100,
          orderInfo: {
            orderNumber: 'ORD-TEST',
            totalAmount: 100,
            status: 'PENDING',
            paymentStatus: 'PAID',
            orderDate: Date.now(),
          },
          customerInfo: { email: 'test@test.com', phone: '+639123456789' },
          organizationInfo: { name: 'Test Org', slug: 'test-org' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      await expect(
        asAdmin.mutation(api.refundRequests.mutations.index.rejectRefundRequest, {
          refundRequestId,
          adminMessage: 'Rejecting this refund request again',
        })
      ).rejects.toThrow('already rejected');
    });
  });
});
