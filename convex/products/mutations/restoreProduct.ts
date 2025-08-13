import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction, 
  requireOrganizationPermission
} from "../../helpers";

// Restore soft deleted product
export const restoreProductArgs = {
  productId: v.id("products"),
};

export const restoreProductHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Get product (including deleted ones)
  const product = await ctx.db.get(args.productId);
  
  if (!product) {
    throw new Error("Product not found");
  }
  
  if (!product.isDeleted) {
    throw new Error("Product is not deleted");
  }
  
  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error("Permission denied: You can only restore your own products");
  }
  
  // Restore the product
  await ctx.db.patch(args.productId, {
    isDeleted: false,
    updatedAt: Date.now(),
  });
  
  // Update category product count if category exists
  if (product.categoryId) {
    const category = await ctx.db.get(product.categoryId);
    if (category) {
      await ctx.db.patch(product.categoryId, {
        productCount: category.productCount + 1,
        activeProductCount: category.activeProductCount + 1,
        updatedAt: Date.now(),
      });
    }
  }
  
  // Log the action
  await logAction(
    ctx,
    "restore_product",
    "DATA_CHANGE",
    "MEDIUM",
    `Restored product: ${product.title}`,
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
