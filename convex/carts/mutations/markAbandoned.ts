import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { validateCartExists } from "../../helpers";

export const markAbandonedArgs = {
  cartId: v.id("carts"),
  isAbandoned: v.boolean(),
};

export const markAbandonedHandler = async (
  ctx: MutationCtx,
  args: { cartId: Id<"carts">; isAbandoned: boolean }
) => {
  const cart = await validateCartExists(ctx, args.cartId);
  const now = Date.now();
  await ctx.db.patch(cart._id, {
    isAbandoned: args.isAbandoned,
    abandonedAt: args.isAbandoned ? now : undefined,
    updatedAt: now,
  });
  return cart._id;
};


