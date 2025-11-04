import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, logAction } from '../../helpers';
import { internal } from '../../_generated/api';

export const removeMultipleItemsArgs = {
  cartId: v.id('carts'),
  items: v.array(
    v.object({
      productId: v.id('products'),
      variantId: v.optional(v.string()),
    })
  ),
};

export const removeMultipleItemsHandler = async (
  ctx: MutationCtx,
  args: {
    cartId: Id<'carts'>;
    items: Array<{
      productId: Id<'products'>;
      variantId?: string;
    }>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) {
    throw new Error("Cannot modify another user's cart");
  }

  const now = Date.now();
  let totalRemovedQuantity = 0;
  const items = [...cart.embeddedItems];

  // Process each item to remove
  for (const itemToRemove of args.items) {
    const product = await validateProductExists(ctx, itemToRemove.productId);
    let variantName: string | undefined = undefined;
    let removedQuantity = 0;

    if (itemToRemove.variantId) {
      const variant = product.variants.find((v) => v.variantId === itemToRemove.variantId);
      if (variant) {
        variantName = variant.variantName;
      }
    }

    // Filter out the matching items
    const beforeLength = items.length;
    const filteredItems = items.filter((i) => {
      const sameProduct = i.productInfo.productId === itemToRemove.productId;
      let match = false;
      if (sameProduct) {
        if (itemToRemove.variantId != null) {
          match = (i.variantId ?? null) === itemToRemove.variantId;
        } else {
          match = (i.variantId ?? null) === null;
        }
      }
      if (match) {
        removedQuantity += i.quantity;
      }
      return !match;
    });

    if (filteredItems.length === beforeLength) {
      // Item not found, skip silently
      continue;
    }

    // Update the items array
    items.splice(0, items.length, ...filteredItems);

    // Decrease inCartCount for variant if applicable
    if (itemToRemove.variantId && removedQuantity > 0) {
      await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
        productId: product._id,
        variantUpdates: [{ variantId: itemToRemove.variantId, incrementInCart: -removedQuantity }],
      });
    }

    totalRemovedQuantity += removedQuantity;

    await logAction(
      ctx,
      'remove_cart_item',
      'DATA_CHANGE',
      'LOW',
      `Removed item from cart: ${product.title}${variantName ? ` (${variantName})` : ''}`,
      currentUser._id,
      undefined,
      {
        cartId: cart._id,
        productId: product._id,
        variantId: itemToRemove.variantId,
        quantity: removedQuantity,
      }
    );
  }

  // Recalculate cart stats
  let totalItems = 0;
  let selectedItems = 0;
  let totalValue = 0;
  let selectedValue = 0;
  for (const item of items) {
    totalItems += item.quantity;
    totalValue += item.productInfo.price * item.quantity;
    if (item.selected) {
      selectedItems += item.quantity;
      selectedValue += item.productInfo.price * item.quantity;
    }
  }

  await ctx.db.patch(cart._id, {
    embeddedItems: items,
    totalItems,
    selectedItems,
    totalValue,
    selectedValue,
    lastActivity: now,
    updatedAt: now,
  });

  return {
    cartId: cart._id,
    removedItemsCount: args.items.length,
    totalRemovedQuantity,
  };
};
