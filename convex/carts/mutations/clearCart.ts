import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication, validateCartExists, logAction } from "../../helpers";

export const clearCartArgs = {
  cartId: v.id("carts"),
};

export const clearCartHandler = async (
  ctx: MutationCtx,
  args: { cartId: Id<"carts"> }
) => {
  const currentUser = await requireAuthentication(ctx);
  const cart = await validateCartExists(ctx, args.cartId);
  if (cart.userId !== currentUser._id) throw new Error("Cannot modify another user's cart");

  const now = Date.now();
  await ctx.db.patch(cart._id, {
    embeddedItems: [],
    totalItems: 0,
    selectedItems: 0,
    totalValue: 0,
    selectedValue: 0,
    lastActivity: now,
    updatedAt: now,
  });

  await logAction(ctx, "clear_cart", "DATA_CHANGE", "LOW", "Cleared cart", currentUser._id, undefined, {
    cartId: cart._id,
  });

  return cart._id;
};


