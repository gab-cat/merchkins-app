import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get category by ID
export const getCategoryByIdArgs = {
  categoryId: v.id("categories"),
};

export const getCategoryByIdHandler = async (
  ctx: QueryCtx,
  args: { categoryId: Id<"categories"> }
) => {
  const category = await ctx.db.get(args.categoryId);
  
  if (!category || category.isDeleted) {
    return null;
  }
  
  return category;
};
