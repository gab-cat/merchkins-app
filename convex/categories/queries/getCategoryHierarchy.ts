import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";

// Get category hierarchy (category with its ancestors and descendants)
export const getCategoryHierarchyArgs = {
  categoryId: v.id("categories"),
  includeDescendants: v.optional(v.boolean()),
  includeAncestors: v.optional(v.boolean()),
};

export const getCategoryHierarchyHandler = async (
  ctx: QueryCtx,
  args: {
    categoryId: Id<"categories">;
    includeDescendants?: boolean;
    includeAncestors?: boolean;
  }
) => {
  const category = await ctx.db.get(args.categoryId);
  
  if (!category || category.isDeleted) {
    return null;
  }
  
  const result = {
    category,
    ancestors: [] as typeof category[],
    descendants: [] as typeof category[],
    children: [] as typeof category[],
  };
  
  // Get immediate children
  const children = await ctx.db
    .query("categories")
    .withIndex("by_parent", (q) => q.eq("parentCategoryId", args.categoryId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();
    
  result.children = children.sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder;
    }
    return a.name.localeCompare(b.name);
  });
  
  // Get ancestors if requested
  if (args.includeAncestors !== false) {
    let currentCategory = category;
    while (currentCategory.parentCategoryId) {
      const parent = await ctx.db.get(currentCategory.parentCategoryId);
      if (!parent || parent.isDeleted) break;
      
      result.ancestors.unshift(parent);
      currentCategory = parent;
    }
  }
  
  // Get all descendants if requested
  if (args.includeDescendants) {
    const getAllDescendants = async (parentId: Id<"categories">): Promise<typeof category[]> => {
      const directChildren = await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) => q.eq("parentCategoryId", parentId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();
      
      let allDescendants = [...directChildren];
      
      for (const child of directChildren) {
        const grandchildren = await getAllDescendants(child._id);
        allDescendants = [...allDescendants, ...grandchildren];
      }
      
      return allDescendants;
    };
    
    result.descendants = await getAllDescendants(args.categoryId);
    result.descendants.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }
  
  return result;
};
