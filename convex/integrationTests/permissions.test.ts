import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestOrgMemberData, createTestVoucherData, createTestOrderData } from '../testHelpers';

/**
 * Permission System Integration Tests
 *
 * Tests the permission enforcement across domains:
 * - MANAGE_VOUCHERS for voucher operations
 * - MANAGE_REFUNDS for refund operations
 * - MANAGE_TICKETS for ticket operations
 * - Admin bypass functionality
 * - Permission denial scenarios
 */

describe('Permission System Integration Tests', () => {
  // =========================================================================
  // MANAGE_VOUCHERS Permission Tests
  // =========================================================================
  describe('MANAGE_VOUCHERS Permission', () => {
    it('should allow org admin to create voucher', async () => {
      const t = convexTest(schema, modules);

      // Create admin user
      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk' }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Add admin as org member with ADMIN role
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(adminId, orgId, 'ADMIN', {
            permissions: [
              {
                permissionCode: 'MANAGE_VOUCHERS',
                canCreate: true,
                canRead: true,
                canUpdate: true,
                canDelete: true,
              },
            ],
          })
        );
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      // Admin should be able to create voucher
      const result = await asAdmin.mutation(api.vouchers.mutations.index.createVoucher, {
        organizationId: orgId,
        name: 'Test Voucher',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: Date.now(),
      });

      expect(result.voucherId).toBeDefined();
      expect(result.code).toBeDefined();
    });

    it('should deny voucher creation for member without MANAGE_VOUCHERS permission', async () => {
      const t = convexTest(schema, modules);

      // Create member user
      const memberId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'member_clerk' }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Add member with NO permission for vouchers
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(memberId, orgId, 'MEMBER', {
            permissions: [], // No permissions
          })
        );
      });

      const asMember = t.withIdentity({ subject: 'member_clerk' });

      // Member should NOT be able to create voucher
      await expect(
        asMember.mutation(api.vouchers.mutations.index.createVoucher, {
          organizationId: orgId,
          name: 'Test Voucher',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          validFrom: Date.now(),
        })
      ).rejects.toThrow(/MANAGE_VOUCHERS/);
    });

    it('should allow staff with MANAGE_VOUCHERS permission to update voucher', async () => {
      const t = convexTest(schema, modules);

      // Create staff user
      const staffId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'staff_clerk', isStaff: true }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create voucher
      const voucherId = await t.run(async (ctx) => {
        return await ctx.db.insert('vouchers', {
          ...createTestVoucherData(staffId, { organizationId: orgId }),
        });
      });

      // Add staff with MANAGE_VOUCHERS permission
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(staffId, orgId, 'STAFF', {
            permissions: [
              {
                permissionCode: 'MANAGE_VOUCHERS',
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

      // Staff should be able to update voucher
      const result = await asStaff.mutation(api.vouchers.mutations.index.updateVoucher, {
        voucherId,
        name: 'Updated Voucher Name',
      });

      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // MANAGE_TICKETS Permission Tests
  // =========================================================================
  describe('MANAGE_TICKETS Permission', () => {
    it('should allow org member to update their own ticket', async () => {
      const t = convexTest(schema, modules);

      // Create user
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user_clerk' }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create ticket by user
      const ticketId = await t.run(async (ctx) => {
        return await ctx.db.insert('tickets', {
          organizationId: orgId,
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'OPEN',
          priority: 'MEDIUM',
          createdById: userId,
          creatorInfo: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@test.com',
          },
          recentUpdates: [],
          updateCount: 0,
          escalated: false,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Add user as member (no special permissions)
      await t.run(async (ctx) => {
        await ctx.db.insert('organizationMembers', createTestOrgMemberData(userId, orgId, 'MEMBER'));
      });

      const asUser = t.withIdentity({ subject: 'user_clerk' });

      // User should be able to update their own ticket (owner check)
      const result = await asUser.mutation(api.tickets.mutations.index.updateTicket, {
        ticketId,
        title: 'Updated Ticket Title',
      });

      expect(result).toBe(ticketId);
    });

    it('should allow staff with MANAGE_TICKETS to update any org ticket', async () => {
      const t = convexTest(schema, modules);

      // Create customer and staff users
      const customerId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
      });

      const staffId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'staff_clerk', isStaff: true }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create ticket by customer
      const ticketId = await t.run(async (ctx) => {
        return await ctx.db.insert('tickets', {
          organizationId: orgId,
          title: 'Customer Ticket',
          description: 'I need help',
          status: 'OPEN',
          priority: 'HIGH',
          createdById: customerId,
          creatorInfo: {
            firstName: 'Customer',
            lastName: 'User',
            email: 'customer@test.com',
          },
          recentUpdates: [],
          updateCount: 0,
          escalated: false,
          tags: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Add staff with MANAGE_TICKETS permission
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(staffId, orgId, 'STAFF', {
            permissions: [
              {
                permissionCode: 'MANAGE_TICKETS',
                canCreate: true,
                canRead: true,
                canUpdate: true,
                canDelete: false,
              },
            ],
          })
        );
      });

      const asStaff = t.withIdentity({ subject: 'staff_clerk' });

      // Staff should be able to update customer's ticket
      const result = await asStaff.mutation(api.tickets.mutations.index.updateTicket, {
        ticketId,
        priority: 'LOW',
      });

      expect(result).toBe(ticketId);
    });
  });

  // =========================================================================
  // MANAGE_REFUNDS Permission Tests
  // =========================================================================
  describe('MANAGE_REFUNDS Permission', () => {
    it('should allow org admin with MANAGE_REFUNDS to approve refund', async () => {
      const t = convexTest(schema, modules);

      // Create admin and customer users
      const [adminId, customerId] = await t.run(async (ctx) => {
        const u1 = await ctx.db.insert('users', createTestUserData({ clerkId: 'admin_clerk' }));
        const u2 = await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
        return [u1, u2];
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create order
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, customerId));
      });

      // Create refund request for that order
      const refundRequestId = await t.run(async (ctx) => {
        return await ctx.db.insert('refundRequests', {
          isDeleted: false,
          orderId,
          requestedById: customerId,
          organizationId: orgId,
          status: 'PENDING',
          refundAmount: 100,
          reason: 'OTHER',
          customerMessage: 'Please refund me',
          orderInfo: {
            orderNumber: 'ORD-123',
            totalAmount: 100,
            status: 'PAID',
            paymentStatus: 'PAID',
            orderDate: Date.now(),
          },
          customerInfo: {
            email: 'customer@test.com',
            phone: '+63123456789',
          },
          organizationInfo: {
            name: 'Test Org',
            slug: 'test-org',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Add admin as org member with MANAGE_REFUNDS permission
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(adminId, orgId, 'ADMIN', {
            permissions: [
              {
                permissionCode: 'MANAGE_REFUNDS',
                canCreate: true,
                canRead: true,
                canUpdate: true,
                canDelete: true,
              },
            ],
          })
        );
      });

      const asAdmin = t.withIdentity({ subject: 'admin_clerk' });

      // Admin should be able to approve refund
      const result = await asAdmin.mutation(api.refundRequests.mutations.index.approveRefundRequest, {
        refundRequestId,
        adminMessage: 'Refund approved after review',
      });

      expect(result).toBe(refundRequestId);
    });

    it('should deny refund approval for member without MANAGE_REFUNDS permission', async () => {
      const t = convexTest(schema, modules);

      // Create member and customer users
      const [memberId, customerId] = await t.run(async (ctx) => {
        const u1 = await ctx.db.insert('users', createTestUserData({ clerkId: 'member_clerk' }));
        const u2 = await ctx.db.insert('users', createTestUserData({ clerkId: 'customer_clerk' }));
        return [u1, u2];
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create order
      const orderId = await t.run(async (ctx) => {
        return await ctx.db.insert('orders', createTestOrderData(orgId, customerId));
      });

      // Create refund request
      const refundRequestId = await t.run(async (ctx) => {
        return await ctx.db.insert('refundRequests', {
          isDeleted: false,
          orderId,
          requestedById: customerId,
          organizationId: orgId,
          status: 'PENDING',
          refundAmount: 100,
          reason: 'OTHER',
          orderInfo: {
            orderNumber: 'ORD-123',
            totalAmount: 100,
            status: 'PAID',
            paymentStatus: 'PAID',
            orderDate: Date.now(),
          },
          customerInfo: {
            email: 'customer@test.com',
            phone: '+63123456789',
          },
          organizationInfo: {
            name: 'Test Org',
            slug: 'test-org',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      // Add member with NO refund permission
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(memberId, orgId, 'MEMBER', {
            permissions: [], // No permissions
          })
        );
      });

      const asMember = t.withIdentity({ subject: 'member_clerk' });

      // Member should NOT be able to approve refund
      await expect(
        asMember.mutation(api.refundRequests.mutations.index.approveRefundRequest, {
          refundRequestId,
          adminMessage: 'Trying to approve without permission',
        })
      ).rejects.toThrow(/MANAGE_REFUNDS/);
    });
  });

  // =========================================================================
  // System Admin Bypass Tests
  // =========================================================================
  describe('System Admin Bypass', () => {
    it('should allow system admin to perform any operation without specific permissions', async () => {
      const t = convexTest(schema, modules);

      // Create system admin
      const adminId = await t.run(async (ctx) => {
        return await ctx.db.insert(
          'users',
          createTestUserData({
            clerkId: 'super_admin_clerk',
            isAdmin: true,
          })
        );
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Add admin as member with NO explicit permissions
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(adminId, orgId, 'MEMBER', {
            permissions: [], // No permissions
          })
        );
      });

      const asSuperAdmin = t.withIdentity({ subject: 'super_admin_clerk' });

      // Super admin should still be able to create voucher (admin bypass)
      const result = await asSuperAdmin.mutation(api.vouchers.mutations.index.createVoucher, {
        organizationId: orgId,
        name: 'Admin Voucher',
        discountType: 'FIXED_AMOUNT',
        discountValue: 100,
        validFrom: Date.now(),
      });

      expect(result.voucherId).toBeDefined();
    });
  });

  // =========================================================================
  // Permission Denial Tests
  // =========================================================================
  describe('Permission Denial Scenarios', () => {
    it('should deny delete when user only has update permission', async () => {
      const t = convexTest(schema, modules);

      // Create staff user
      const staffId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'limited_staff_clerk' }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Create voucher
      const voucherId = await t.run(async (ctx) => {
        return await ctx.db.insert('vouchers', {
          ...createTestVoucherData(staffId, { organizationId: orgId }),
        });
      });

      // Add staff with MANAGE_VOUCHERS but NO delete permission
      await t.run(async (ctx) => {
        await ctx.db.insert(
          'organizationMembers',
          createTestOrgMemberData(staffId, orgId, 'STAFF', {
            permissions: [
              {
                permissionCode: 'MANAGE_VOUCHERS',
                canCreate: true,
                canRead: true,
                canUpdate: true,
                canDelete: false, // NO delete permission
              },
            ],
          })
        );
      });

      const asStaff = t.withIdentity({ subject: 'limited_staff_clerk' });

      // Staff should NOT be able to delete voucher
      await expect(
        asStaff.mutation(api.vouchers.mutations.index.deleteVoucher, {
          voucherId,
        })
      ).rejects.toThrow(/MANAGE_VOUCHERS/);
    });

    it('should deny access to non-member users', async () => {
      const t = convexTest(schema, modules);

      // Create non-member user
      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'outsider_clerk' }));
      });

      // Create organization
      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      // Do NOT add user as member

      const asOutsider = t.withIdentity({ subject: 'outsider_clerk' });

      // Outsider should NOT be able to create voucher
      await expect(
        asOutsider.mutation(api.vouchers.mutations.index.createVoucher, {
          organizationId: orgId,
          name: 'Unauthorized Voucher',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          validFrom: Date.now(),
        })
      ).rejects.toThrow(/not a member/);
    });
  });
});
