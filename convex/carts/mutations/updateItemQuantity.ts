import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateCartExists, validateProductExists, validateNonNegativeNumber, logAction } from '../../helpers';
import { internal } from '../../_generated/api';
import { removeItemHandler } from './removeItem';
import { isOrganizationMember } from '../../helpers/organizations';

export const updateItemQuantityArgs = {
  cartId: v.id('carts'),
  productId: v.id('products'),
  variantId: v.optional(v.string()),
  quantity: v.number(),
};

export const updateItemQuantityHandler = async (
  ctx: MutationCtx,
  args: {
    cartId: Id<'carts'>;
    productId: Id<'products'>;
    variantId?: string;
    quantity: number;
  }
): Promise<Id<'carts'>> => {
  const currentUser = await requireAuthentication(ctx);
  validateNonNegativeNumber(args.quantity, 'Quantity');

  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) {
    throw new Error("Cannot modify another user's cart");
  }

  const product = await validateProductExists(ctx, args.productId);
  // Enforce organization visibility when adjusting quantities as well
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
  let variantInventory = product.inventory;
  let variantName: string | undefined;
  if (args.variantId) {
    const variant = product.variants.find((v) => v.variantId === args.variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
    variantInventory = variant.inventory;
    variantName = variant.variantName;
  }

  const now = Date.now();
  const items = [...cart.embeddedItems];
  // Match item: prefer variantId when provided; otherwise match only items without variantId by variantName
  const index = items.findIndex((i) => {
    if (i.productInfo.productId !== product._id) return false;
    if (args.variantId != null) {
      return (i.variantId ?? null) === args.variantId;
    }
    return (i.variantId ?? null) === null;
  });
  if (index === -1) {
    throw new Error('Item not found in cart');
  }

  // If quantity is 0, remove item
  if (args.quantity === 0) {
    return await removeItemHandler(ctx, {
      cartId: args.cartId,
      productId: args.productId,
      variantId: args.variantId,
    });
  }

  const newQuantity = Math.min(args.quantity, variantInventory);
  const existing = items[index];
  const quantityDiff = newQuantity - existing.quantity;
  items[index] = { ...existing, quantity: newQuantity, addedAt: now };

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

  if (args.variantId && quantityDiff !== 0) {
    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId: product._id,
      variantUpdates: [{ variantId: args.variantId, incrementInCart: quantityDiff }],
    });
  }

  await logAction(
    ctx,
    'update_cart_item_quantity',
    'DATA_CHANGE',
    'LOW',
    `Updated item quantity in cart: ${product.title}${variantName ? ` (${variantName})` : ''}`,
    currentUser._id,
    undefined,
    { cartId: cart._id, productId: product._id, variantId: args.variantId, quantity: newQuantity }
  );

  return cart._id;
};
