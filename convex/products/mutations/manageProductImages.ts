import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction, 
  validateProductExists,
  requireOrganizationPermission
} from "../../helpers";
import { r2 } from "../../files/r2";

// Update product images (handles file uploads and deletions)
export const updateProductImagesArgs = {
  productId: v.id("products"),
  imageUrls: v.array(v.string()),
  imagesToDelete: v.optional(v.array(v.string())),
};

export const updateProductImagesHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    imageUrls: string[];
    imagesToDelete?: string[];
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);
  
  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error("Permission denied: You can only update your own products");
  }

  if (args.imageUrls.length === 0) {
    throw new Error("Product must have at least one image");
  }

  // Update product images
  await ctx.db.patch(args.productId, {
    imageUrl: args.imageUrls,
    updatedAt: Date.now(),
  });

  // Delete removed images from storage (best-effort)
  if (args.imagesToDelete && args.imagesToDelete.length > 0) {
    for (const key of args.imagesToDelete) {
      try {
        await r2.deleteObject(ctx, key)
      } catch (err) {
        console.log('Failed to delete object from R2', key, err)
      }
    }
  }

  // Note: File metadata association handled by R2 sync hooks (if configured)

  // Log the action
  await logAction(
    ctx,
    "update_product_images",
    "DATA_CHANGE",
    "LOW",
    `Updated images for product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      imageCount: args.imageUrls.length,
      deletedImageCount: args.imagesToDelete?.length || 0
    }
  );

  return { success: true, imageUrls: args.imageUrls };
};

// Update variant image
export const updateVariantImageArgs = {
  productId: v.id("products"),
  variantId: v.string(),
  imageUrl: v.optional(v.string()),
  previousImageUrl: v.optional(v.string()),
};

export const updateVariantImageHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    variantId: string;
    imageUrl?: string;
    previousImageUrl?: string;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);
  
  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error("Permission denied: You can only update your own products");
  }

  // Find and update the variant
  const variants = product.variants.map(variant => {
    if (variant.variantId === args.variantId) {
      return {
        ...variant,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      };
    }
    return variant;
  });

  // Check if variant was found
  const variantExists = variants.some(v => v.variantId === args.variantId);
  if (!variantExists) {
    throw new Error("Variant not found");
  }

  // Update product with new variants
  await ctx.db.patch(args.productId, {
    variants,
    updatedAt: Date.now(),
  });

  // Handle previous image deletion from storage
  if (args.previousImageUrl) {
    try {
      await r2.deleteObject(ctx, args.previousImageUrl)
    } catch (err) {
      console.log('Failed to delete old variant image from R2', args.previousImageUrl, err)
    }
  }

  // Note: association handled by R2 sync hooks if needed

  // Log the action
  await logAction(
    ctx,
    "update_variant_image",
    "DATA_CHANGE",
    "LOW",
    `Updated image for variant: ${args.variantId} in product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      variantId: args.variantId,
      hasImage: !!args.imageUrl
    }
  );

  return { success: true, variantId: args.variantId, imageUrl: args.imageUrl };
};

// Update variant status (activate/deactivate)
export const updateVariantStatusArgs = {
  productId: v.id("products"),
  variantId: v.string(),
  isActive: v.boolean(),
};

export const updateVariantStatusHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    variantId: string;
    isActive: boolean;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);
  
  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, "MANAGE_PRODUCTS", "update");
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error("Permission denied: You can only update your own products");
  }

  // Find and update the variant
  const variants = product.variants.map(variant => {
    if (variant.variantId === args.variantId) {
      return {
        ...variant,
        isActive: args.isActive,
        updatedAt: Date.now(),
      };
    }
    return variant;
  });

  // Check if variant was found
  const variantExists = variants.some(v => v.variantId === args.variantId);
  if (!variantExists) {
    throw new Error("Variant not found");
  }

  // Ensure at least one variant remains active
  const activeVariants = variants.filter(v => v.isActive);
  if (activeVariants.length === 0) {
    throw new Error("At least one variant must remain active");
  }

  // Update product with new variants
  await ctx.db.patch(args.productId, {
    variants,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    "update_variant_status",
    "DATA_CHANGE",
    "LOW",
    `${args.isActive ? 'Activated' : 'Deactivated'} variant: ${args.variantId} in product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      variantId: args.variantId,
      isActive: args.isActive
    }
  );

  return { success: true, variantId: args.variantId, isActive: args.isActive };
};
