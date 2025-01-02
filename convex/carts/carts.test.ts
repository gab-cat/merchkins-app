import { convexTest } from 'convex-test';
import { describe, it, expect } from 'vitest';
import { api } from '../_generated/api';
import schema from '../schema';
import { modules } from '../test.setup';
import { createTestUserData, createTestOrganizationData, createTestProductData, createTestCartData } from '../testHelpers';

/**
 * Carts Domain Tests
 *
 * Tests the cart management system including:
 * - Adding items to cart
 * - Removing items by unique addedAt identifier
 * - Cart ownership validation
 * - Inventory checks (STOCK vs PREORDER)
 *
 * Business Rules:
 * - Each cart item has a unique addedAt timestamp for identification
 * - STOCK products check inventory limits
 * - PREORDER products have unlimited ordering
 * - Users can only modify their own carts
 */

describe('Carts Domain', () => {
  // =========================================================================
  // addItem Mutation Tests
  // =========================================================================
  describe('addItem', () => {
    it('should add item to cart successfully', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId),
          title: 'Test T-Shirt',
          isActive: true,
          inventoryType: 'STOCK',
          inventory: 100,
          minPrice: 500,
          variants: [],
        });
      });

      // Create cart for user
      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', createTestCartData(userId));
      });

      const asUser = t.withIdentity({ subject: 'test_clerk' });

      const resultCartId = await asUser.mutation(api.carts.mutations.index.addItem, {
        cartId,
        productId,
        quantity: 2,
      });

      expect(resultCartId).toBe(cartId);

      const cart = await t.run(async (ctx) => ctx.db.get(cartId));
      expect(cart!.embeddedItems.length).toBe(1);
      expect(cart!.embeddedItems[0].quantity).toBe(2);
      expect(cart!.totalItems).toBe(2);
    });

    it('should reject adding inactive product', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId),
          isActive: false, // Inactive
          inventory: 100,
          variants: [],
        });
      });

      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', createTestCartData(userId));
      });

      const asUser = t.withIdentity({ subject: 'test_clerk' });

      await expect(
        asUser.mutation(api.carts.mutations.index.addItem, {
          cartId,
          productId,
          quantity: 1,
        })
      ).rejects.toThrow('not available');
    });

    it('should reject out of stock STOCK products', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId),
          isActive: true,
          inventoryType: 'STOCK',
          inventory: 0, // Out of stock
          variants: [],
        });
      });

      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', createTestCartData(userId));
      });

      const asUser = t.withIdentity({ subject: 'test_clerk' });

      await expect(
        asUser.mutation(api.carts.mutations.index.addItem, {
          cartId,
          productId,
          quantity: 1,
        })
      ).rejects.toThrow('out of stock');
    });

    it('should allow adding PREORDER products regardless of inventory', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId),
          isActive: true,
          inventoryType: 'PREORDER', // Preorder allows unlimited
          inventory: 0,
          minPrice: 300,
          variants: [],
        });
      });

      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', createTestCartData(userId));
      });

      const asUser = t.withIdentity({ subject: 'test_clerk' });

      await asUser.mutation(api.carts.mutations.index.addItem, {
        cartId,
        productId,
        quantity: 100, // Can order any quantity
      });

      const cart = await t.run(async (ctx) => ctx.db.get(cartId));
      expect(cart!.totalItems).toBe(100);
    });
  });

  // =========================================================================
  // removeItem Mutation Tests
  // =========================================================================
  describe('removeItem', () => {
    it('should remove item by addedAt identifier', async () => {
      const t = convexTest(schema, modules);

      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'test_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId),
          isActive: true,
          inventory: 100,
          minPrice: 100,
          variants: [],
        });
      });

      const addedAt1 = Date.now();
      const addedAt2 = addedAt1 + 1000;

      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', {
          ...createTestCartData(userId),
          embeddedItems: [
            {
              productInfo: {
                productId,
                title: 'Test Product',
                slug: 'test-product',
                imageUrl: [],
                price: 100,
                inventory: 100,
              },
              quantity: 2,
              selected: true,
              addedAt: addedAt1,
            },
            {
              productInfo: {
                productId,
                title: 'Test Product',
                slug: 'test-product',
                imageUrl: [],
                price: 100,
                inventory: 100,
              },
              quantity: 3,
              selected: true,
              addedAt: addedAt2,
            },
          ],
          totalItems: 5,
          selectedItems: 5,
          totalValue: 500,
          selectedValue: 500,
        });
      });

      const asUser = t.withIdentity({ subject: 'test_clerk' });

      await asUser.mutation(api.carts.mutations.index.removeItem, {
        cartId,
        productId,
        addedAt: addedAt1, // Remove first item
      });

      const cart = await t.run(async (ctx) => ctx.db.get(cartId));
      expect(cart!.embeddedItems.length).toBe(1);
      expect(cart!.embeddedItems[0].addedAt).toBe(addedAt2); // Second item remains
      expect(cart!.totalItems).toBe(3);
    });

    it('should reject removing from another users cart', async () => {
      const t = convexTest(schema, modules);

      const userId1 = await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user1_clerk' }));
      });

      await t.run(async (ctx) => {
        return await ctx.db.insert('users', createTestUserData({ clerkId: 'user2_clerk' }));
      });

      const orgId = await t.run(async (ctx) => {
        return await ctx.db.insert('organizations', createTestOrganizationData());
      });

      const productId = await t.run(async (ctx) => {
        return await ctx.db.insert('products', {
          ...createTestProductData(orgId, userId1),
          isActive: true,
          variants: [],
        });
      });

      // Cart belongs to user1
      const cartId = await t.run(async (ctx) => {
        return await ctx.db.insert('carts', {
          ...createTestCartData(userId1),
          embeddedItems: [
            {
              productInfo: { productId, title: 'Test', slug: 'test', imageUrl: [], price: 100, inventory: 10 },
              quantity: 1,
              selected: true,
              addedAt: Date.now(),
            },
          ],
          totalItems: 1,
          selectedItems: 1,
          totalValue: 100,
          selectedValue: 100,
        });
      });

      // User2 tries to modify user1's cart
      const asUser2 = t.withIdentity({ subject: 'user2_clerk' });

      await expect(
        asUser2.mutation(api.carts.mutations.index.removeItem, {
          cartId,
          productId,
          addedAt: Date.now(),
        })
      ).rejects.toThrow("another user's cart");
    });
  });
});
