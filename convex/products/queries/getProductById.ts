import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get product by ID
export const getProductByIdArgs = {
  productId: v.id("products"),
  includeDeleted: v.optional(v.boolean()),
};

export const getProductByIdHandler = async (
  ctx: QueryCtx,
  args: {
    productId: Id<"products">;
    includeDeleted?: boolean;
  }
) => {
  const product = await ctx.db.get(args.productId);
  
  if (!product) {
    throw new Error("Product not found");
  }
  
  if (product.isDeleted && !args.includeDeleted) {
    throw new Error("Product not found");
  }
  
  return product;
};
