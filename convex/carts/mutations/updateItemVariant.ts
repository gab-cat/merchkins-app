import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, logAction } from '../../helpers';
import { isOrganizationMember } from '../../helpers/organizations';
import { internal } from '../../_generated/api';

export const updateItemVariantArgs = {
  cartId: v.id('carts'),
  productId: v.id('products'),
  oldVariantId: v.optional(v.string()),
  newVariantId: v.optional(v.string()),
  oldSize: v.optional(
    v.object({
      id: v.string(),
      label: v.string(),
      price: v.optional(v.number()),
    })
  ),
  newSize: v.optional(
    v.object({
      id: v.string(),
      label: v.string(),
      price: v.optional(v.number()),
    })
  ),
};

export const updateItemVariantHandler = async (
  ctx: MutationCtx,
  args: {
    cartId: Id<'carts'>;
    productId: Id<'products'>;
    oldVariantId?: string;
    newVariantId?: string;
    oldSize?: {
      id: string;
      label: string;
      price?: number;
    };
    newSize?: {
      id: string;
      label: string;
      price?: number;
    };
  }
): Promise<Id<'carts'>> => {
  const currentUser = await requireAuthentication(ctx);

  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) {
    throw new Error("Cannot modify another user's cart");
  }

  // If old and new variant/size are the same, do nothing
  const oldSizeId = args.oldSize?.id ?? null;
  const newSizeId = args.newSize?.id ?? null;
  if ((args.oldVariantId ?? null) === (args.newVariantId ?? null) && oldSizeId === newSizeId) {
    return cart._id;
  }

  const product = await validateProductExists(ctx, args.productId);

  // Enforce organization visibility
  if (product.organizationId) {
    const org = await ctx.db.get(product.organizationId);
    if (org && !org.isDeleted && org.organizationType !== 'PUBLIC') {
      const isPrivileged = currentUser.isAdmin || currentUser.isStaff;
      if (!isPrivileged) {
        const member = await isOrganizationMember(ctx, currentUser._id, product.organizationId);
        if (!member) {
          if (org.organizationType === 'PRIVATE') {
            throw new Error('Membership required to purchase from this private organization.');
          }
          throw new Error('This organization is invite-only. You must join via invite to purchase.');
        }
      }
    }
  }

  // Get variant info for new variant
  let newPrice = product.minPrice ?? product.maxPrice ?? product.supposedPrice ?? 0;
  let newVariantName: string | undefined;
  let newVariantInventory = product.inventory;

  if (args.newVariantId) {
    const variant = product.variants.find((v) => v.variantId === args.newVariantId);
    if (!variant) {
      throw new Error('New variant not found');
    }
    if (!variant.isActive) {
      throw new Error('New variant is not available');
    }

    // Validate size selection if variant has sizes
    if (variant.sizes && variant.sizes.length > 0) {
      if (!args.newSize) {
        throw new Error('Size selection required for this variant');
      }
      const sizeExists = variant.sizes.some((s) => s.id === args.newSize!.id);
      if (!sizeExists) {
        throw new Error('Selected size not found for this variant');
      }
    }

    // Compute effective price: size.price || variant.price
    newPrice = args.newSize?.price ?? variant.price;
    newVariantName = variant.variantName;
    newVariantInventory = variant.inventory;
  }

  if (newVariantInventory <= 0) {
    throw new Error('New variant is out of stock');
  }

  const now = Date.now();
  const items = [...cart.embeddedItems];

  // Find the item with the old variant and size
  const index = items.findIndex((i) => {
    if (i.productInfo.productId !== product._id) return false;
    if ((i.variantId ?? null) !== (args.oldVariantId ?? null)) return false;
    const itemSizeId = i.size?.id ?? null;
    return itemSizeId === (args.oldSize?.id ?? null);
  });

  if (index === -1) {
    throw new Error('Item not found in cart');
  }

  // Update the item with new variant and size info
  const existingItem = items[index];
  const newQuantity = Math.min(existingItem.quantity, newVariantInventory);

  items[index] = {
    ...existingItem,
    variantId: args.newVariantId,
    size: args.newSize,
    quantity: newQuantity,
    productInfo: {
      ...existingItem.productInfo,
      variantName: newVariantName,
      price: newPrice,
      inventory: newVariantInventory,
    },
    addedAt: now,
  };

  // Recompute cart totals
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

  // Update product stats - decrement old variant, increment new variant
  // Note: We don't track size-level inventory separately, only variant-level
  const variantUpdates: Array<{ variantId: string; incrementInCart: number }> = [];

  if (args.oldVariantId) {
    variantUpdates.push({ variantId: args.oldVariantId, incrementInCart: -existingItem.quantity });
  }

  if (args.newVariantId) {
    variantUpdates.push({ variantId: args.newVariantId, incrementInCart: newQuantity });
  }

  if (variantUpdates.length > 0) {
    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId: product._id,
      variantUpdates,
    });
  }

  await logAction(
    ctx,
    'update_cart_item_variant',
    'DATA_CHANGE',
    'LOW',
    `Updated item variant in cart: ${product.title}${newVariantName ? ` (${newVariantName})` : ''}${args.newSize ? ` - ${args.newSize.label}` : ''}`,
    currentUser._id,
    undefined,
    {
      cartId: cart._id,
      productId: product._id,
      oldVariantId: args.oldVariantId,
      oldSize: args.oldSize,
      newVariantId: args.newVariantId,
      newSize: args.newSize,
    }
  );

  return cart._id;
};
