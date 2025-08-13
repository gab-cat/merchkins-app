import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, validateCartExists, validateProductExists, logAction, validateStringLength, sanitizeString } from "../../helpers";

export const setItemNoteArgs = {
  cartId: v.id("carts"),
  productId: v.id("products"),
  variantId: v.optional(v.string()),
  note: v.optional(v.string()),
};

export const setItemNoteHandler = async (
  ctx: MutationCtx,
  args: { cartId: Id<"carts">; productId: Id<"products">; variantId?: string; note?: string }
) => {
  const currentUser = await requireAuthentication(ctx);
  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) throw new Error("Cannot modify another user's cart");

  const product = await validateProductExists(ctx, args.productId);
  const variantName = args.variantId ? product.variants.find((v) => v.variantId === args.variantId)?.variantName : undefined;

  if (args.note !== undefined) {
    validateStringLength(args.note, "Note", 0, 500);
  }

  const sanitized = args.note ? sanitizeString(args.note) : undefined;

  const now = Date.now();
  const items = [...cart.embeddedItems];
  const index = items.findIndex(
    (i) => i.productInfo.productId === product._id && (i.productInfo.variantName ?? null) === (variantName ?? null)
  );
  if (index === -1) throw new Error("Item not found in cart");

  items[index] = { ...items[index], note: sanitized, addedAt: now };

  await ctx.db.patch(cart._id, {
    embeddedItems: items,
    lastActivity: now,
    updatedAt: now,
  });

  await logAction(
    ctx,
    "set_cart_item_note",
    "DATA_CHANGE",
    "LOW",
    `Set note on cart item: ${product.title}${variantName ? ` (${variantName})` : ""}`,
    currentUser._id,
    undefined,
    { cartId: cart._id, productId: product._id, variantId: args.variantId }
  );

  return cart._id;
};


