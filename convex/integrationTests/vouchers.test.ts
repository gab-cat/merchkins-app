import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, MONETARY_REFUND_DELAY_MS } from '../testHelpers';

describe('Voucher Integration Tests', () => {
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
      await t.run(async (ctx) => {
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
      const validationResult = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
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
      const validationResult = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
        code: 'REFUND-PERSONAL',
        userId: differentUserId,
        orderAmount: 500,
      });

      expect(validationResult.valid).toBe(false);
      expect(validationResult.error).toContain('not assigned to you');
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
      const firstValidation = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
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
      const secondValidation = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
        code: 'REFUND-SINGLEUSE',
        userId: customerId,
        orderAmount: 500,
      });
      expect(secondValidation.valid).toBe(false);
      expect(secondValidation.errorCode).toBe('USAGE_LIMIT_REACHED');
    });
  });
});
