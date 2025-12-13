import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, validatePositiveNumber, logAction } from '../../helpers';
import { isOrganizationMember } from '../../helpers/organizations';
import { createOrGetCartHandler } from './createOrGetCart';
import { internal } from '../../_generated/api';

export const addItemArgs = {
  cartId: v.optional(v.id('carts')),
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
};

export const addItemHandler = async (
  ctx: MutationCtx,
  args: {
    cartId?: Id<'carts'>;
    productId: Id<'products'>;
    variantId?: string;
    size?: {
      id: string;
      label: string;
      price?: number;
    };
    quantity: number;
    selected?: boolean;
    note?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  validatePositiveNumber(args.quantity, 'Quantity');

  // Resolve or create cart
  let cart = null;
  if (args.cartId) {
    cart = await validateCartExists(ctx, args.cartId);
    if (cart.userId !== currentUser._id) {
      throw new Error("Cannot modify another user's cart");
    }
  } else {
    // Try to use user's cart or create a new one
    const newCartId = await createOrGetCartHandler(ctx, { userId: currentUser._id });
    cart = await validateCartExists(ctx, newCartId);
  }

  const product = await validateProductExists(ctx, args.productId);
  if (!product.isActive) {
    throw new Error('Product is not available');
  }

  // Enforce organization visibility for purchasing
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
          // SECRET
          throw new Error('This organization is invite-only. You must join via invite to purchase.');
        }
      }
    }
  }

  // Determine price/inventory and variant info
  let price = product.minPrice ?? product.maxPrice ?? product.supposedPrice ?? 0;
  const originalPrice = undefined as number | undefined;
  let variantName = undefined as string | undefined;
  let variantInventory = product.inventory;

  if (args.variantId) {
    const variant = product.variants.find((v) => v.variantId === args.variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
    if (!variant.isActive) {
      throw new Error('Variant is not available');
    }

    // Validate size selection if variant has sizes
    if (variant.sizes && variant.sizes.length > 0) {
      if (!args.size) {
        throw new Error('Size selection required for this variant');
      }
      const selectedSize = variant.sizes.find((s) => s.id === args.size!.id);
      if (!selectedSize) {
        throw new Error('Selected size not found for this variant');
      }

      // Use size-level inventory if available, otherwise use variant inventory
      if (selectedSize.inventory !== undefined) {
        variantInventory = selectedSize.inventory;
      }
    }

    // Compute effective price: size.price || variant.price
    price = args.size?.price ?? variant.price;
    variantName = variant.variantName;
    // Only use variant inventory if not already set by size
    if (!args.size || !(variant.sizes?.find((s) => s.id === args.size!.id)?.inventory !== undefined)) {
      variantInventory = variant.inventory;
    }
  }

  // Only check inventory for STOCK items, PREORDER items have infinite stock
  if (product.inventoryType === 'STOCK' && variantInventory <= 0) {
    throw new Error('Item is out of stock');
  }

  // Only limit quantity for STOCK items, PREORDER items can have any quantity
  const quantityToAdd = product.inventoryType === 'STOCK' ? Math.min(args.quantity, variantInventory) : args.quantity;

  const now = Date.now();
  const selected = args.selected ?? true;
  const note = args.note;

  // Always create a new cart item (no merging)
  const newItems = [...cart.embeddedItems];
  newItems.push({
    variantId: args.variantId,
    size: args.size,
    productInfo: {
      productId: product._id,
      organizationId: product.organizationId,
      organizationName: product.organizationInfo?.name,
      title: product.title,
      slug: product.slug,
      imageUrl: product.imageUrl,
      variantName,
      price,
      originalPrice,
      inventory: variantInventory,
    },
    quantity: quantityToAdd,
    selected,
    note,
    addedAt: now,
  });

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

  // Update product variant inCartCount metric via internal mutation
  if (args.variantId) {
    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId: product._id,
      variantUpdates: [{ variantId: args.variantId, incrementInCart: quantityToAdd }],
    });
  }

  await logAction(
    ctx,
    'add_cart_item',
    'DATA_CHANGE',
    'LOW',
    `Added item to cart: ${product.title}${variantName ? ` (${variantName})` : ''}${args.size ? ` - ${args.size.label}` : ''}`,
    currentUser._id,
    undefined,
    { cartId: cart._id, productId: product._id, variantId: args.variantId, size: args.size, quantity: quantityToAdd }
  );

  return cart._id;
};
