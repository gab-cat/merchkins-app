import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';

import schema from '../schema';
import { modules } from '../test.setup';
import {
  createTestUserData,
  createTestOrganizationData,
  createTestVoucherData,
  createTestRefundVoucherData,
  getPastTimestamp,
  getFutureTimestamp,
  MONETARY_REFUND_DELAY_MS,
} from '../testHelpers';
import { api } from '../_generated/api';

/**
 * Vouchers Domain Tests
 *
 * Tests the voucher system including:
 * - Promotional vouchers (PERCENTAGE, FIXED_AMOUNT, FREE_ITEM)
 * - Refund vouchers (REFUND type with platform-wide applicability)
 * - Validation logic for all voucher constraints
 * - Monetary refund eligibility (14-day rule for seller-initiated)
 *
 * Business Rules from Knowledge Base:
 * - Percentage vouchers can have max discount cap
 * - Fixed amount vouchers cap at order total
 * - REFUND vouchers are platform-wide and user-assigned
 * - Customer-initiated refunds: NOT eligible for monetary refund through platform
 * - Seller-initiated refunds: Eligible after 14-day waiting period
 * - Vouchers are single-use per user by default
 */

describe('Vouchers Domain', () => {
  // =========================================================================
  // validateVoucher Query Tests
  // =========================================================================
  describe('validateVoucher', () => {
    describe('error cases', () => {
      it('should return NOT_FOUND for non-existent voucher code', async () => {
        const t = convexTest(schema, modules);

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'NONEXISTENT',
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('NOT_FOUND');
        expect(result.error).toContain('not found');
      });

      it('should return INACTIVE for disabled voucher', async () => {
        const t = convexTest(schema, modules);

        // Create test data
        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'INACTIVE-VOUCHER',
              isActive: false,
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'INACTIVE-VOUCHER',
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('INACTIVE');
      });

      it('should return EXPIRED for voucher past valid date', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'EXPIRED-VOUCHER',
              validFrom: getPastTimestamp(48), // 2 days ago
              validUntil: getPastTimestamp(24), // Expired 1 day ago
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'EXPIRED-VOUCHER',
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('EXPIRED');
      });

      it('should return NOT_STARTED for voucher with future start date', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'FUTURE-VOUCHER',
              validFrom: getFutureTimestamp(24), // Starts in 1 day
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'FUTURE-VOUCHER',
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('NOT_STARTED');
      });

      it('should return USAGE_LIMIT_REACHED when total usage exhausted', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'EXHAUSTED-VOUCHER',
              usageLimit: 5,
              usedCount: 5, // Already used 5 times
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'EXHAUSTED-VOUCHER',
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('USAGE_LIMIT_REACHED');
      });

      it('should return USER_USAGE_LIMIT_REACHED when user reached limit', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const voucherId = await t.run(async (ctx) => {
          return await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'USER-LIMIT-VOUCHER',
              usageLimitPerUser: 1,
            })
          );
        });

        // Record a usage for this user
        await t.run(async (ctx) => {
          const orderId = await ctx.db.insert('orders', {
            isDeleted: false,
            organizationId: undefined,
            customerId: userId,
            orderNumber: 'ORD-TEST-001',
            orderDate: Date.now(),
            status: 'PENDING',
            paymentStatus: 'PENDING',
            totalAmount: 100,
            discountAmount: 0,
            itemCount: 1,
            uniqueProductCount: 1,
            recentStatusHistory: [],
            customerInfo: { email: 'test@test.com', phone: '+639123456789' },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });

          await ctx.db.insert('voucherUsages', {
            voucherId,
            orderId,
            userId,
            voucherSnapshot: {
              code: 'USER-LIMIT-VOUCHER',
              name: 'Test Voucher',
              discountType: 'PERCENTAGE',
              discountValue: 10,
            },
            discountAmount: 10,
            userInfo: { email: 'test@test.com' },
            createdAt: Date.now(),
          });
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'USER-LIMIT-VOUCHER',
          userId,
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('USER_USAGE_LIMIT_REACHED');
      });

      it('should return MIN_ORDER_NOT_MET when order amount too low', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'MIN-ORDER-VOUCHER',
              minOrderAmount: 500,
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'MIN-ORDER-VOUCHER',
          orderAmount: 100, // Below minimum
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('MIN_ORDER_NOT_MET');
      });

      it('should return ORGANIZATION_MISMATCH for org-scoped voucher with wrong org', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const orgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        const differentOrgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData({ name: 'Different Org' }));
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'ORG-VOUCHER',
              organizationId: orgId,
              organizationInfo: { name: 'Test Org', slug: 'test-org' },
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'ORG-VOUCHER',
          organizationId: differentOrgId, // Wrong org
          orderAmount: 100,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('ORGANIZATION_MISMATCH');
      });
    });

    describe('discount calculation', () => {
      it('should calculate percentage discount correctly', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'PERCENT10',
              discountType: 'PERCENTAGE',
              discountValue: 10, // 10% off
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'PERCENT10',
          orderAmount: 1000,
        });

        expect(result.valid).toBe(true);
        expect(result.discountAmount).toBe(100); // 10% of 1000
      });

      it('should apply max discount cap for percentage vouchers', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'PERCENT50-CAPPED',
              discountType: 'PERCENTAGE',
              discountValue: 50, // 50% off
              maxDiscountAmount: 200, // Max ₱200
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'PERCENT50-CAPPED',
          orderAmount: 1000,
        });

        expect(result.valid).toBe(true);
        expect(result.discountAmount).toBe(200); // Capped at 200, not 500
      });

      it('should calculate fixed amount discount correctly', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'FIXED100',
              discountType: 'FIXED_AMOUNT',
              discountValue: 100, // ₱100 off
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'FIXED100',
          orderAmount: 500,
        });

        expect(result.valid).toBe(true);
        expect(result.discountAmount).toBe(100);
      });

      it('should cap fixed amount at order total', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestVoucherData(userId, {
              code: 'FIXED1000',
              discountType: 'FIXED_AMOUNT',
              discountValue: 1000, // ₱1000 off
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'FIXED1000',
          orderAmount: 500, // Order is only 500
        });

        expect(result.valid).toBe(true);
        expect(result.discountAmount).toBe(500); // Capped at order amount
      });
    });

    describe('REFUND voucher special handling', () => {
      it('should validate REFUND voucher for assigned user', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestRefundVoucherData(customerId, adminId, 500, 'CUSTOMER', {
              code: 'REFUND-CUSTOMER-001',
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'REFUND-CUSTOMER-001',
          userId: customerId,
          orderAmount: 1000,
        });

        expect(result.valid).toBe(true);
        expect(result.voucher?.discountType).toBe('REFUND');
        expect(result.discountAmount).toBe(500); // Refund amount
      });

      it('should reject REFUND voucher for non-assigned user', async () => {
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

        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestRefundVoucherData(customerId, adminId, 500, 'SELLER', {
              code: 'REFUND-SELLER-001',
            })
          );
        });

        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'REFUND-SELLER-001',
          userId: differentUserId, // Not the assigned user
          orderAmount: 1000,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe('USER_USAGE_LIMIT_REACHED');
        expect(result.error).toContain('not assigned to you');
      });

      it('should allow REFUND voucher across any organization (platform-wide)', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const anyOrgId = await t.run(async (ctx) => {
          return await ctx.db.insert('organizations', createTestOrganizationData());
        });

        // Create REFUND voucher without organization scope
        await t.run(async (ctx) => {
          await ctx.db.insert(
            'vouchers',
            createTestRefundVoucherData(customerId, adminId, 300, 'SELLER', {
              code: 'REFUND-PLATFORM-WIDE',
              // No organizationId = platform-wide
            })
          );
        });

        // Should work for any organization
        const result = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'REFUND-PLATFORM-WIDE',
          userId: customerId,
          organizationId: anyOrgId,
          orderAmount: 1000,
        });

        expect(result.valid).toBe(true);
        expect(result.discountAmount).toBe(300);
      });
    });
  });

  // =========================================================================
  // Refund Voucher Business Rules Tests
  // =========================================================================
  describe('Refund Voucher Business Rules', () => {
    describe('monetaryRefundEligibleAt calculation', () => {
      it('should have no monetary refund eligibility for customer-initiated vouchers', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const voucherId = await t.run(async (ctx) => {
          return await ctx.db.insert(
            'vouchers',
            createTestRefundVoucherData(customerId, adminId, 500, 'CUSTOMER', {
              code: 'REFUND-CUSTOMER-ONLY',
            })
          );
        });

        const voucher = await t.run(async (ctx) => {
          return await ctx.db.get(voucherId);
        });

        expect(voucher).not.toBeNull();
        expect(voucher!.cancellationInitiator).toBe('CUSTOMER');
        expect(voucher!.monetaryRefundEligibleAt).toBeUndefined();
      });

      it('should have 14-day monetary refund eligibility for seller-initiated vouchers', async () => {
        const t = convexTest(schema, modules);

        const adminId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData({ isAdmin: true }));
        });

        const customerId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const createdAt = Date.now();
        const voucherId = await t.run(async (ctx) => {
          return await ctx.db.insert('vouchers', {
            ...createTestRefundVoucherData(customerId, adminId, 500, 'SELLER', {
              code: 'REFUND-SELLER-ELIGIBLE',
            }),
            createdAt,
          });
        });

        const voucher = await t.run(async (ctx) => {
          return await ctx.db.get(voucherId);
        });

        expect(voucher).not.toBeNull();
        expect(voucher!.cancellationInitiator).toBe('SELLER');
        expect(voucher!.monetaryRefundEligibleAt).toBeDefined();

        // Should be exactly 14 days after creation
        const expectedEligibleAt = createdAt + MONETARY_REFUND_DELAY_MS;
        expect(voucher!.monetaryRefundEligibleAt).toBeCloseTo(expectedEligibleAt);
      });
    });

    describe('voucher usage tracking', () => {
      it('should prevent used voucher from being used again', async () => {
        const t = convexTest(schema, modules);

        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', createTestUserData());
        });

        const voucherId = await t.run(async (ctx) => {
          return await ctx.db.insert(
            'vouchers',
            createTestRefundVoucherData(userId, userId, 500, 'SELLER', {
              code: 'REFUND-SINGLE-USE',
              usageLimit: 1,
              usedCount: 0,
            })
          );
        });

        // First validation should pass
        const firstResult = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'REFUND-SINGLE-USE',
          userId,
          orderAmount: 1000,
        });
        expect(firstResult.valid).toBe(true);

        // Simulate usage by incrementing usedCount
        await t.run(async (ctx) => {
          await ctx.db.patch(voucherId, { usedCount: 1 });
        });

        // Second validation should fail
        const secondResult = await t.mutation(api.vouchers.mutations.index.validateVoucher, {
          code: 'REFUND-SINGLE-USE',
          userId,
          orderAmount: 500,
        });
        expect(secondResult.valid).toBe(false);
        expect(secondResult.errorCode).toBe('USAGE_LIMIT_REACHED');
      });
    });
  });
});
