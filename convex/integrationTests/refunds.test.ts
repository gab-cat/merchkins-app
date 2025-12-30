import { convexTest } from 'convex-test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, internal } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestOrderData, MONETARY_REFUND_DELAY_MS } from '../testHelpers';

describe('Refund Integration Tests', () => {
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
});
