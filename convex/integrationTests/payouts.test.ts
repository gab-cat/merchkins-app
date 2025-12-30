import { convexTest } from 'convex-test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, internal } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { Id } from '../_generated/dataModel';
import { createTestUserData, createTestOrganizationData, createTestOrderData } from '../testHelpers';

describe('Payout Integration Tests', () => {
  // =========================================================================
  // Payout Logic Flow
  // =========================================================================
  describe('Payout Logic Flow', () => {
    it('should carry over negative balance and mark zero payout as PAID', async () => {
      const t = convexTest(schema, modules);

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      // Create a paid order (Revenue: 1000)
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, userId),
          totalAmount: 1000,
          paymentStatus: 'PAID',
          paidAt: Date.now(), // Paid now
          payoutInvoiceId: undefined,
        });
      });

      // Create dummy old invoice first
      const oldInvoiceId = await t.run(async (ctx) => {
        return await ctx.db.insert('payoutInvoices', {
          organizationId: orgId,
          invoiceNumber: 'PI-OLD-123',
          organizationInfo: {
            name: 'Test Org',
            slug: 'test-org',
            logo: '',
            bankDetails: {
              accountName: 'Test',
              accountNumber: '123',
              bankName: 'Test Bank',
            },
          },
          periodStart: 0,
          periodEnd: 0,
          grossAmount: 0,
          platformFeePercentage: 15,
          platformFeeAmount: 0,
          netAmount: 0,
          orderCount: 0,
          itemCount: 0,
          orderSummary: [],
          productSummary: [],
          status: 'PAID',
          statusHistory: [],
          createdAt: Date.now() - 10000000,
          updatedAt: Date.now() - 10000000,
        });
      });

      // Create dummy old order linked to the invoice
      const oldOrderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, userId),
          totalAmount: 2000,
          paymentStatus: 'PAID',
          paidAt: Date.now() - 10000000,
          payoutInvoiceId: oldInvoiceId,
        });
      });

      // Create a LARGE negative adjustment that exceeds revenue (Adjustment: -2000)
      // Net should be: 1000 (Revenue) - 150 (15% Fee) - 2000 (Adj) = -1150
      await t.run(async (ctx) => {
        await ctx.db.insert('payoutAdjustments', {
          organizationId: orgId,
          orderId: oldOrderId,
          originalInvoiceId: oldInvoiceId,
          type: 'CANCELLATION',
          amount: -2000,
          reason: 'Previous massive refund',
          status: 'PENDING',
          createdAt: Date.now(),
        });
      });

      // Run payout generation
      const periodStart = Date.now() - 86400000; // Yesterday
      const periodEnd = Date.now() + 86400000; // Tomorrow

      const result = await t.mutation(internal.payouts.mutations.index.generatePayoutInvoices, {
        periodStart,
        periodEnd,
      });

      // Verify Invoice
      const invoiceId = result.invoicesCreated[0] as Id<'payoutInvoices'>;
      // Actually result.invoicesCreated is string[] as per my previous fix in triggerActions.ts

      const invoice = await t.run(async (ctx) => ctx.db.get(invoiceId)); // Now invoice should be correctly typed

      expect(invoice).not.toBeNull();
      expect(invoice!.grossAmount).toBe(1000);
      expect(invoice!.platformFeeAmount).toBe(150); // 15% of 1000
      expect(invoice!.netAmount).toBe(0); // Should be floor'd to 0
      expect(invoice!.status).toBe('PAID'); // Zero amount means PAID

      // Verify Carry-Over Adjustment
      const adjustments = await t.run(async (ctx) => {
        return await ctx.db
          .query('payoutAdjustments')
          .withIndex('by_organization', (q) => q.eq('organizationId', orgId))
          .filter((q) => q.eq(q.field('status'), 'PENDING')) // Get only the NEW pending one
          .collect();
      });

      expect(adjustments.length).toBe(1);
      const carryOverAdj = adjustments[0];

      // Expected carry over: 1000 - 150 - 2000 = -1150
      expect(carryOverAdj.amount).toBe(-1150);
      expect(carryOverAdj.type).toBe('CARRY_OVER');
      expect(carryOverAdj.reason).toContain('Negative balance carried forward from Invoice #');
      expect(carryOverAdj.orderId).toBeUndefined();
    });
  });
});
