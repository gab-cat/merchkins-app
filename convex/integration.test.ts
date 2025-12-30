import { convexTest } from 'convex-test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, internal } from './_generated/api';
import schema from './schema';
import { modules } from './test.setup';
import {
  createTestUserData,
  createTestOrganizationData,
  createTestProductData,
  createTestOrderData,
  createTestPaymentData,
  createTestOrgMemberData,
  MONETARY_REFUND_DELAY_MS,
} from './testHelpers';

/**
 * Integration Tests - User Flow Tests
 *
 * These tests validate complete user flows across multiple domains
 * to ensure the system works correctly end-to-end.
 *
 * User Flows Tested:
 * 1. Cart to Checkout Flow
 * 2. Customer-Initiated Refund Flow
 * 3. Seller-Initiated Cancellation Flow
 * 4. Voucher Redemption Flow
 * 5. Monetary Refund Eligibility Flow
 */

describe('Integration Tests', () => {
  // =========================================================================
  // Voucher Redemption Flow
  // =========================================================================
  describe('Voucher Redemption Flow', () => {
    it('should allow refund voucher to be applied to new order', async () => {
      const t = convexTest(schema, modules);

      // Setup: Create admin, customer, and org
      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create a refund voucher for the customer (simulating post-refund)
      const voucherId = await t.run(async (ctx) => {
        return await ctx.db.insert('vouchers', {
          isDeleted: false,
          code: 'REFUND-TEST123',
          name: 'Test Refund Voucher',
          discountType: 'REFUND',
          discountValue: 500, // ₱500 refund
          isActive: true,
          usedCount: 0,
          usageLimit: 1,
          usageLimitPerUser: 1,
          validFrom: Date.now(),
          assignedToUserId: customerId,
          cancellationInitiator: 'SELLER',
          monetaryRefundEligibleAt: Date.now() + MONETARY_REFUND_DELAY_MS,
          createdById: adminId,
          creatorInfo: { email: 'admin@test.com' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Validate voucher for a new order
      const validationResult = await t.query(api.vouchers.queries.index.validateVoucher, {
        code: 'REFUND-TEST123',
        userId: customerId,
        organizationId: orgId, // Different org should still work (platform-wide)
        orderAmount: 1000,
      });

      expect(validationResult.valid).toBe(true);
      expect(validationResult.voucher?.discountType).toBe('REFUND');
      expect(validationResult.discountAmount).toBe(500);
    });

    it('should reject refund voucher for non-owner', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const differentUserId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      // Create voucher assigned to customerId
      await t.run(async (ctx) => {
        return await ctx.db.insert('vouchers', {
          isDeleted: false,
          code: 'REFUND-PERSONAL',
          name: 'Personal Refund Voucher',
          discountType: 'REFUND',
          discountValue: 300,
          isActive: true,
          usedCount: 0,
          usageLimit: 1,
          usageLimitPerUser: 1,
          validFrom: Date.now(),
          assignedToUserId: customerId, // Assigned to specific user
          cancellationInitiator: 'CUSTOMER',
          createdById: adminId,
          creatorInfo: { email: 'admin@test.com' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Different user tries to use it
      const validationResult = await t.query(api.vouchers.queries.index.validateVoucher, {
        code: 'REFUND-PERSONAL',
        userId: differentUserId,
        orderAmount: 500,
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toContain('not assigned to you');
    });
  });

  // =========================================================================
  // Monetary Refund Eligibility Flow
  // =========================================================================
  describe('Monetary Refund Eligibility Flow', () => {
    it('should correctly track seller-initiated voucher eligibility', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, customerId));
      });

      // Create seller-initiated refund voucher
      const voucherId = await t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
        orderId,
        amount: 1000,
        assignedToUserId: customerId,
        createdById: adminId,
        cancellationInitiator: 'SELLER',
      });

      const voucher = await t.run(async (ctx) => ctx.db.get(voucherId));

      // Verify eligibility is 14 days from now
      expect(voucher).not.toBeNull();
      expect(voucher!.cancellationInitiator).toBe('SELLER');
      expect(voucher!.monetaryRefundEligibleAt).toBeDefined();

      const now = Date.now();
      const eligibleAt = voucher!.monetaryRefundEligibleAt!;

      // Should be ~14 days in the future
      expect(eligibleAt - now).toBeGreaterThan(MONETARY_REFUND_DELAY_MS - 5000); // Allow 5s tolerance
      expect(eligibleAt - now).toBeLessThan(MONETARY_REFUND_DELAY_MS + 5000);
    });

    it('should not set eligibility for customer-initiated vouchers', async () => {
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

      // Create customer-initiated refund voucher
      const voucherId = await t.mutation(internal.refundRequests.mutations.index.createRefundVoucher, {
        orderId,
        amount: 500,
        assignedToUserId: userId,
        createdById: userId,
        cancellationInitiator: 'CUSTOMER',
      });

      const voucher = await t.run(async (ctx) => ctx.db.get(voucherId));

      expect(voucher).not.toBeNull();
      expect(voucher!.cancellationInitiator).toBe('CUSTOMER');
      expect(voucher!.monetaryRefundEligibleAt).toBeUndefined();
    });
  });

  // =========================================================================
  // Order Status Flow
  // =========================================================================
  describe('Order Status Flow', () => {
    it('should track complete order lifecycle: PENDING → PROCESSING → READY → DELIVERED', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
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
          paymentStatus: 'PAID',
          recentStatusHistory: [],
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      // Step 1: PENDING → PROCESSING
      await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
        orderId,
        status: 'PROCESSING',
      });

      let order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('PROCESSING');
      expect(order!.recentStatusHistory.length).toBe(1);

      // Step 2: PROCESSING → READY
      await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
        orderId,
        status: 'READY',
      });

      order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('READY');
      expect(order!.recentStatusHistory.length).toBe(2);

      // Step 3: READY → DELIVERED
      await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
        orderId,
        status: 'DELIVERED',
      });

      order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('DELIVERED');
      expect(order!.recentStatusHistory.length).toBe(3);

      // Verify status history is in correct order (most recent first)
      expect(order!.recentStatusHistory[0].status).toBe('DELIVERED');
      expect(order!.recentStatusHistory[1].status).toBe('READY');
      expect(order!.recentStatusHistory[2].status).toBe('PROCESSING');
    });
  });

  // =========================================================================
  // Refund Voucher Lifecycle
  // =========================================================================
  describe('Refund Voucher Lifecycle', () => {
    it('should prevent voucher reuse after single use', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      // Create single-use refund voucher
      const voucherId = await t.run(async (ctx) => {
        return await ctx.db.insert('vouchers', {
          isDeleted: false,
          code: 'REFUND-SINGLEUSE',
          name: 'Single Use Refund',
          discountType: 'REFUND',
          discountValue: 500,
          isActive: true,
          usedCount: 0,
          usageLimit: 1,
          usageLimitPerUser: 1,
          validFrom: Date.now(),
          assignedToUserId: customerId,
          cancellationInitiator: 'SELLER',
          monetaryRefundEligibleAt: Date.now() + MONETARY_REFUND_DELAY_MS,
          createdById: adminId,
          creatorInfo: { email: 'admin@test.com' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // First validation should pass
      const firstValidation = await t.query(api.vouchers.queries.index.validateVoucher, {
        code: 'REFUND-SINGLEUSE',
        userId: customerId,
        orderAmount: 1000,
      });
      expect(firstValidation.valid).toBe(true);

      // Simulate voucher usage
      await t.run(async (ctx) => {
        await ctx.db.patch(voucherId, { usedCount: 1 });
      });

      // Second validation should fail
      const secondValidation = await t.query(api.vouchers.queries.index.validateVoucher, {
        code: 'REFUND-SINGLEUSE',
        userId: customerId,
        orderAmount: 500,
      });
      expect(secondValidation.valid).toBe(false);
      expect(secondValidation.errorCode).toBe('USAGE_LIMIT_REACHED');
    });
  });
});
