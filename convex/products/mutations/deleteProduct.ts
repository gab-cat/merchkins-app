import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction, 
  validateProductExists,
  requireOrganizationPermission
} from "../../helpers";

// Soft delete product
export const deleteProductArgs = {
  productId: v.id("products"),
};

export const deleteProductHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);
  
  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "delete");
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error("Permission denied: You can only delete your own products");
  }
  
  // Soft delete the product
  await ctx.db.patch(args.productId, {
    isDeleted: true,
    updatedAt: Date.now(),
  });
  
  // Update category product count if category exists
  if (product.categoryId) {
    const category = await ctx.db.get(product.categoryId);
    if (category) {
      await ctx.db.patch(product.categoryId, {
        productCount: Math.max(0, category.productCount - 1),
        activeProductCount: Math.max(0, category.activeProductCount - 1),
        updatedAt: Date.now(),
      });
    }
  }
  
  // Log the action
  await logAction(
    ctx,
    "delete_product",
    "DATA_CHANGE",
    "HIGH",
    `Deleted product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      productSlug: product.slug,
      categoryId: product.categoryId
    }
  );
  
  return args.productId;
};
