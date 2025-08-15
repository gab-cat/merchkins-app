import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, validateCartExists, validateProductExists, logAction } from "../../helpers";

export const setItemSelectedArgs = {
  cartId: v.id("carts"),
  productId: v.id("products"),
  variantId: v.optional(v.string()),
  selected: v.boolean(),
};

export const setItemSelectedHandler = async (
  ctx: MutationCtx,
  args: { cartId: Id<"carts">; productId: Id<"products">; variantId?: string; selected: boolean }
) => {
  const currentUser = await requireAuthentication(ctx);
  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) throw new Error("Cannot modify another user's cart");

  const product = await validateProductExists(ctx, args.productId);
  const variantName = args.variantId ? product.variants.find((v) => v.variantId === args.variantId)?.variantName : undefined;

  const now = Date.now();
  const items = [...cart.embeddedItems];
  const index = items.findIndex((i) => {
    if (i.productInfo.productId !== product._id) return false;
    if (args.variantId != null) {
      return (i.variantId ?? null) === args.variantId;
    }
    return (i.variantId ?? null) === null;
  });
  if (index === -1) throw new Error("Item not found in cart");

  items[index] = { ...items[index], selected: args.selected, addedAt: now };

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

  await logAction(
    ctx,
    "set_cart_item_selected",
    "DATA_CHANGE",
    "LOW",
    `Set item selected=${args.selected} in cart: ${product.title}${variantName ? ` (${variantName})` : ""}`,
    currentUser._id,
    undefined,
    { cartId: cart._id, productId: product._id, variantId: args.variantId, selected: args.selected }
  );

  return cart._id;
};


