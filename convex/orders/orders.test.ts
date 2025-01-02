import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestOrderData, createTestProductData, createTestOrgMemberData } from '../testHelpers';

/**
 * Orders Domain Tests
 *
 * Tests the order management system including:
 * - Order status transitions
 * - Order cancellation with stock restoration
 * - Order updates and modifications
 * - Seller-initiated cancellation creating refund vouchers
 *
 * Business Rules from Knowledge Base:
 * - Order statuses: PENDING → PROCESSING → READY → DELIVERED
 * - Cannot modify DELIVERED orders
 * - Cancellation restores stock for STOCK type products
 * - Seller-initiated cancellation of PAID orders creates refund voucher
 */

describe('Orders Domain', () => {
  // =========================================================================
  // updateOrder Mutation Tests
  // =========================================================================
  describe('updateOrder', () => {
    describe('status transitions', () => {
      it('should allow valid forward status transitions', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            status: 'PENDING',
            recentStatusHistory: [],
          });
        });

        // Add admin as org member with permissions
        await t.run(async (ctx) => {
          await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
        });

        const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

        // PENDING → PROCESSING
        await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
          orderId,
          status: 'PROCESSING',
        });

        let order = await t.run(async (ctx) => ctx.db.get(orderId));
        expect(order!.status).toBe('PROCESSING');

        // PROCESSING → READY
        await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
          orderId,
          status: 'READY',
        });

        order = await t.run(async (ctx) => ctx.db.get(orderId));
        expect(order!.status).toBe('READY');

        // READY → DELIVERED
        await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
          orderId,
          status: 'DELIVERED',
        });

        order = await t.run(async (ctx) => ctx.db.get(orderId));
        expect(order!.status).toBe('DELIVERED');
      });

      it('should reject invalid status transitions', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            status: 'PENDING',
            recentStatusHistory: [],
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
        });

        const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

        // Cannot skip PROCESSING to go directly to READY
        await expect(
          asAdmin.mutation(api.orders.mutations.index.updateOrder, {
            orderId,
            status: 'READY',
          })
        ).rejects.toThrow('Invalid status transition');

        // Cannot skip to DELIVERED
        await expect(
          asAdmin.mutation(api.orders.mutations.index.updateOrder, {
            orderId,
            status: 'DELIVERED',
          })
        ).rejects.toThrow('Invalid status transition');
      });

      it('should prevent modifying finalized orders for non-admins', async () => {
        const t = convexTest(schema, modules);

        const staffId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'staff_clerk', isStaff: true }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            status: 'DELIVERED', // Already delivered
            recentStatusHistory: [],
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'organizationMembers',
            createTestOrgMemberData(staffId, orgId, 'STAFF', {
              permissions: [
                {
                  permissionCode: 'MANAGE_ORDERS',
                  canCreate: false,
                  canRead: true,
                  canUpdate: true,
                  canDelete: false,
                },
              ],
            })
          );
        });

        const asStaff = t.withIdentity({ subject: 'staff_clerk' });

        await expect(
          asStaff.mutation(api.orders.mutations.index.updateOrder, {
            orderId,
            status: 'PROCESSING',
          })
        ).rejects.toThrow('finalized order');
      });
    });

    describe('payment status transitions', () => {
      it('should set paidAt when payment status changes to PAID', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            paymentStatus: 'PENDING',
            recentStatusHistory: [],
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
        });

        const beforeUpdate = Date.now();
        const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

        await asAdmin.mutation(api.orders.mutations.index.updateOrder, {
          orderId,
          paymentStatus: 'PAID',
        });

        const order = await t.run(async (ctx) => ctx.db.get(orderId));
        expect(order!.paymentStatus).toBe('PAID');
        expect(order!.paidAt).toBeDefined();
        expect(order!.paidAt).toBeGreaterThanOrEqual(beforeUpdate);
      });

      it('should reject invalid payment status transition from REFUNDED to PAID', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orderId = await t.run(async (ctx) => {
          return await ctx.db.insert('orders', {
            ...createTestOrderData(orgId, customerId),
            paymentStatus: 'REFUNDED', // Already refunded
            recentStatusHistory: [],
          });
        });

        await t.run(async (ctx) => {
          await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
        });

        const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

        await expect(
          asAdmin.mutation(api.orders.mutations.index.updateOrder, {
            orderId,
            paymentStatus: 'PAID',
          })
        ).rejects.toThrow('Invalid payment status transition');
      });
    });
  });

  // =========================================================================
  // cancelOrder Mutation Tests
  // =========================================================================
  describe('cancelOrder', () => {
    it('should cancel pending order successfully', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          recentStatusHistory: [],
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      await asAdmin.mutation(api.orders.mutations.index.cancelOrder, {
        orderId,
        reason: 'OUT_OF_STOCK',
        userNote: 'Item out of stock, cancelling order',
      });

      const order = await t.run(async (ctx) => ctx.db.get(orderId));
      expect(order!.status).toBe('CANCELLED');
      expect(order!.cancellationReason).toBe('OUT_OF_STOCK');
    });

    it('should restore stock when cancelling order with STOCK type products', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      // Create product with stock inventory type
      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, adminId),
          inventoryType: 'STOCK',
          inventory: 48, // After 2 items were ordered
        });
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'PENDING',
          paymentStatus: 'PENDING',
          recentStatusHistory: [],
          // Use embeddedItems instead of separate orderItems
          embeddedItems: [
            {
              productInfo: {
                productId,
                title: 'Test Product',
                slug: 'test-product',
                imageUrl: [],
              },
              quantity: 2,
              price: 100,
              originalPrice: 100,
              appliedRole: 'CUSTOMER',
            },
          ],
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      await asAdmin.mutation(api.orders.mutations.index.cancelOrder, {
        orderId,
        reason: 'CUSTOMER_REQUEST',
        userNote: 'Customer requested cancellation',
      });

      // Verify stock was restored (inventory field)
      const product = await t.run(async (ctx) => ctx.db.get(productId));
      expect(product!.inventory).toBe(50); // 48 + 2 restored
    });

    it('should reject cancellation of delivered order', async () => {
      const t = convexTest(schema, modules);

      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk', isAdmin: true }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData());
      });

      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', {
          ...createTestOrderData(orgId, customerId),
          status: 'DELIVERED', // Already delivered
          paymentStatus: 'PAID',
          recentStatusHistory: [],
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(adminId, orgId));
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      await expect(
        asAdmin.mutation(api.orders.mutations.index.cancelOrder, {
          orderId,
          reason: 'OTHERS',
          userNote: 'Trying to cancel delivered order',
        })
      ).rejects.toThrow();
    });
  });
});
