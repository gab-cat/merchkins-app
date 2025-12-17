import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, logAction } from '../../helpers';
import { internal } from '../../_generated/api';

export const removeItemArgs = {
  cartId: v.id('carts'),
  productId: v.id('products'),
  variantId: v.optional(v.string()),
  sizeId: v.optional(v.string()),
};

export const removeItemHandler = async (
  ctx: MutationCtx,
  args: {
    cartId: Id<'carts'>;
    productId: Id<'products'>;
    variantId?: string;
    sizeId?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) {
    throw new Error("Cannot modify another user's cart");
  }

  const product = await validateProductExists(ctx, args.productId);
  // No org visibility check needed for removal; allow removing inaccessible items gracefully
  let variantName: string | undefined = undefined;
  if (args.variantId) {
    const variant = product.variants.find((v) => v.variantId === args.variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
    variantName = variant.variantName;
  }

  const now = Date.now();
  const beforeLength = cart.embeddedItems.length;
  let removedQuantity = 0;
  const items = cart.embeddedItems.filter((i) => {
    const sameProduct = i.productInfo.productId === args.productId;
    let match = false;
    if (sameProduct) {
      if (args.variantId != null) {
        if ((i.variantId ?? null) === args.variantId) {
          // Also match by sizeId
          const itemSizeId = i.size?.id ?? null;
          const argsSizeId = args.sizeId ?? null;
          match = itemSizeId === argsSizeId;
        }
      } else {
        match = (i.variantId ?? null) === null;
      }
    }
    if (match) {
      removedQuantity += i.quantity;
    }
    return !match;
  });
  if (items.length === beforeLength) {
    throw new Error('Item not found in cart');
  }

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

  // Decrease inCartCount for variant if applicable by removed quantity
  if (args.variantId && removedQuantity > 0) {
    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId: product._id,
      variantUpdates: [{ variantId: args.variantId, incrementInCart: -removedQuantity }],
    });
  }

  await logAction(ctx, 'remove_cart_item', 'DATA_CHANGE', 'LOW', `Removed item from cart: ${product.title}`, currentUser._id, undefined, {
    cartId: cart._id,
    productId: product._id,
    variantId: args.variantId,
  });

  return cart._id;
};
