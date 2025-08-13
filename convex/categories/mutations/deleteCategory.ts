import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction,
  requireOrganizationPermission
} from "../../helpers";

// Delete category (soft delete)
export const deleteCategoryArgs = {
  categoryId: v.id("categories"),
  force: v.optional(v.boolean()), // For hard delete (admin only)
};

export const deleteCategoryHandler = async (
  ctx: MutationCtx,
  args: {
    categoryId: Id<"categories">;
    force?: boolean;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Get existing category
  const existingCategory = await ctx.db.get(args.categoryId);
  if (!existingCategory) {
    throw new Error("Category not found");
  }
  
  if (existingCategory.isDeleted && !args.force) {
    throw new Error("Category is already deleted");
  }
  
  // Check permissions
  if (existingCategory.organizationId) {
    await requireOrganizationPermission(ctx, existingCategory.organizationId, "MANAGE_CATEGORIES", "delete");
  } else {
    // For global categories, only system admins can delete
    if (!currentUser.isAdmin) {
      throw new Error("Only system administrators can delete global categories");
    }
  }
  
  // Check if category has active products
  if (existingCategory.activeProductCount > 0) {
    throw new Error("Cannot delete category with active products. Move or delete products first.");
  }
  
  // Check if category has subcategories
  const hasSubcategories = await ctx.db
    .query("categories")
    .withIndex("by_parent", (q) => q.eq("parentCategoryId", args.categoryId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .first();
    
  if (hasSubcategories) {
    throw new Error("Cannot delete category with subcategories. Delete or move subcategories first.");
  }
  
  if (args.force && currentUser.isAdmin) {
    // Hard delete - completely remove from database
    await ctx.db.delete(args.categoryId);
    
    await logAction(
      ctx,
      "hard_delete_category",
      "DATA_CHANGE",
      "HIGH",
      `Hard deleted category: ${existingCategory.name}`,
      currentUser._id,
      existingCategory.organizationId,
      { 
        categoryId: args.categoryId,
        categoryName: existingCategory.name,
        categorySlug: existingCategory.slug
      }
    );
  } else {
    // Soft delete - mark as deleted
    await ctx.db.patch(args.categoryId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
    
    await logAction(
      ctx,
      "delete_category",
      "DATA_CHANGE",
      "MEDIUM",
      `Deleted category: ${existingCategory.name}`,
      currentUser._id,
      existingCategory.organizationId,
      { 
        categoryId: args.categoryId,
        categoryName: existingCategory.name,
        categorySlug: existingCategory.slug
      }
    );
  }
  
  return { success: true };
};
