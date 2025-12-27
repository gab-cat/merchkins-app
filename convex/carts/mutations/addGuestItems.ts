import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, validatePositiveNumber, logAction } from '../../helpers';
import { createOrGetCartHandler } from './createOrGetCart';
import { internal } from '../../_generated/api';

export const addGuestItemsArgs = {
  items: v.array(
    v.object({
      productId: v.id('products'),
      variantId: v.optional(v.string()),
      size: v.optional(
        v.object({
          id: v.string(),
          label: v.string(),
          price: v.optional(v.number()),
        })
      ),
      quantity: v.number(),
      selected: v.optional(v.boolean()),
      note: v.optional(v.string()),
    })
  ),
};

export const addGuestItems = mutation({
  args: addGuestItemsArgs,
  returns: v.id('carts'),
  handler: async (ctx, args) => {
    const currentUser = await requireAuthentication(ctx);

    // Validate all items
    for (const item of args.items) {
      validatePositiveNumber(item.quantity, 'Item quantity');
    }

    // Get or create cart for the authenticated user
    const cartId = await createOrGetCartHandler(ctx, { userId: currentUser._id });
    const cart = await validateCartExists(ctx, cartId);

    const now = Date.now();
    const newItems = [...cart.embeddedItems];

    // Add each guest item to the cart
    for (const item of args.items) {
      const product = await validateProductExists(ctx, item.productId);
      if (!product.isActive) {
        continue; // Skip inactive products
      }

      // Enforce organization visibility for purchasing
      if (product.organizationId) {
        const org = await ctx.db.get(product.organizationId);
        if (org && !org.isDeleted && org.organizationType !== 'PUBLIC') {
          // Skip non-public org products - user should already be a member if authenticated
          continue;
        }
      }

      // Determine price/inventory and variant info
      let price = product.minPrice ?? product.maxPrice ?? product.supposedPrice ?? 0;
      let variantName = undefined as string | undefined;
      let variantInventory = product.inventory;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.variantId === item.variantId);
        if (!variant || !variant.isActive) {
          continue; // Skip invalid/inactive variants
        }

        // Validate size selection if variant has sizes
        if (variant.sizes && variant.sizes.length > 0) {
          if (!item.size) {
            continue; // Skip items without required size
          }
          const selectedSize = variant.sizes.find((s) => s.id === item.size!.id);
          if (!selectedSize) {
            continue; // Skip invalid size
          }

          // Use size-level inventory if available
          if (selectedSize.inventory !== undefined) {
            variantInventory = selectedSize.inventory;
          }
        }

        // Compute effective price: size.price || variant.price
        price = item.size?.price ?? variant.price;
        variantName = variant.variantName;
        if (!item.size || !(variant.sizes?.find((s) => s.id === item.size!.id)?.inventory !== undefined)) {
          variantInventory = variant.inventory;
        }
      }

      // Only check inventory for STOCK items
      if (product.inventoryType === 'STOCK' && variantInventory <= 0) {
        continue; // Skip out of stock items
      }

      // Only limit quantity for STOCK items
      const quantityToAdd = product.inventoryType === 'STOCK' ? Math.min(item.quantity, variantInventory) : item.quantity;

      // Add item to cart
      newItems.push({
        variantId: item.variantId,
        size: item.size,
        productInfo: {
          productId: product._id,
          organizationId: product.organizationId,
          organizationName: product.organizationInfo?.name,
          title: product.title,
          slug: product.slug,
          imageUrl: product.imageUrl,
          variantName,
          price,
          originalPrice: undefined,
          inventory: variantInventory,
        },
        quantity: quantityToAdd,
        selected: item.selected ?? true,
        note: item.note,
        addedAt: now,
      });

      // Update product variant inCartCount metric via internal mutation
      if (item.variantId) {
        await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
          productId: product._id,
          variantUpdates: [{ variantId: item.variantId, incrementInCart: quantityToAdd }],
        });
      }
    }

    // Recompute cart totals
    let totalItems = 0;
    let selectedItems = 0;
    let totalValue = 0;
    let selectedValue = 0;

    for (const item of newItems) {
      totalItems += item.quantity;
      totalValue += item.productInfo.price * item.quantity;
      if (item.selected) {
        selectedItems += item.quantity;
        selectedValue += item.productInfo.price * item.quantity;
      }
    }

    await ctx.db.patch(cart._id, {
      embeddedItems: newItems,
      totalItems,
      selectedItems,
      totalValue,
      selectedValue,
      lastActivity: now,
      updatedAt: now,
    });

    await logAction(
      ctx,
      'merge_guest_cart',
      'DATA_CHANGE',
      'LOW',
      `Merged ${args.items.length} guest cart items into authenticated cart`,
      currentUser._id,
      undefined,
      { cartId: cart._id, itemCount: args.items.length }
    );

    return cart._id;
  },
});
