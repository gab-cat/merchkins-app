import { convexTest } from 'convex-test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, internal } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestOrderData, createTestOrgMemberData } from '../testHelpers';

describe('Order Integration Tests', () => {
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
});
