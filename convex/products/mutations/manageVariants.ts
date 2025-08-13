import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  requireAuthentication, 
  logAction, 
  validateNotEmpty,
  validateStringLength,
  validatePositiveNumber,
  validateNonNegativeNumber,
  sanitizeString,
  validateProductExists,
  requireOrganizationPermission
} from "../../helpers";

// Add variant to existing product
export const addVariantArgs = {
  productId: v.id("products"),
  variantName: v.string(),
  price: v.number(),
  inventory: v.number(),
  imageUrl: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

export const addVariantHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    variantName: string;
    price: number;
    inventory: number;
    imageUrl?: string;
    isActive?: boolean;
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
    throw new Error("Permission denied: You can only modify your own products");
  }
  
  // Validate inputs
  validateNotEmpty(args.variantName, "Variant name");
  validateStringLength(args.variantName, "Variant name", 1, 100);
  validatePositiveNumber(args.price, "Variant price");
  validateNonNegativeNumber(args.inventory, "Variant inventory");
  
  // Check if variant name is unique within the product
  const existingVariant = product.variants.find(
    v => v.variantName.toLowerCase() === args.variantName.toLowerCase()
  );
  
  if (existingVariant) {
    throw new Error("Variant name already exists for this product");
  }
  
  // Create new variant
  const now = Date.now();
  const newVariant = {
    variantId: `variant-${now}-${product.variants.length}`,
    variantName: sanitizeString(args.variantName),
    price: args.price,
    inventory: args.inventory,
    imageUrl: args.imageUrl,
    isActive: args.isActive !== undefined ? args.isActive : true,
    orderCount: 0,
    inCartCount: 0,
    isPopular: false,
    createdAt: now,
    updatedAt: now,
  };
  
  // Update product with new variant
  const updatedVariants = [...product.variants, newVariant];
  const variantPrices = updatedVariants.map(v => v.price);
  
  await ctx.db.patch(args.productId, {
    variants: updatedVariants,
    totalVariants: updatedVariants.length,
    minPrice: Math.min(...variantPrices),
    maxPrice: Math.max(...variantPrices),
    inventory: product.inventory + args.inventory,
    updatedAt: now,
  });
  
  // Log the action
  await logAction(
    ctx,
    "add_product_variant",
    "DATA_CHANGE",
    "MEDIUM",
    `Added variant to product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      variantId: newVariant.variantId,
      variantName: args.variantName
    }
  );
  
  return newVariant.variantId;
};

// Remove variant from product
export const removeVariantArgs = {
  productId: v.id("products"),
  variantId: v.string(),
};

export const removeVariantHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    variantId: string;
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
    throw new Error("Permission denied: You can only modify your own products");
  }
  
  // Find variant to remove
  const variantToRemove = product.variants.find(v => v.variantId === args.variantId);
  
  if (!variantToRemove) {
    throw new Error("Variant not found");
  }
  
  // Check if this is the last variant
  if (product.variants.length <= 1) {
    throw new Error("Cannot remove the last variant. Products must have at least one variant.");
  }
  
  // Remove variant
  const updatedVariants = product.variants.filter(v => v.variantId !== args.variantId);
  const variantPrices = updatedVariants.map(v => v.price);
  
  await ctx.db.patch(args.productId, {
    variants: updatedVariants,
    totalVariants: updatedVariants.length,
    minPrice: variantPrices.length > 0 ? Math.min(...variantPrices) : undefined,
    maxPrice: variantPrices.length > 0 ? Math.max(...variantPrices) : undefined,
    inventory: Math.max(0, product.inventory - variantToRemove.inventory),
    updatedAt: Date.now(),
  });
  
  // Log the action
  await logAction(
    ctx,
    "remove_product_variant",
    "DATA_CHANGE",
    "MEDIUM",
    `Removed variant from product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      variantId: args.variantId,
      variantName: variantToRemove.variantName
    }
  );
  
  return args.variantId;
};

// Update specific variant
export const updateVariantArgs = {
  productId: v.id("products"),
  variantId: v.string(),
  variantName: v.optional(v.string()),
  price: v.optional(v.number()),
  inventory: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
};

export const updateVariantHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    variantId: string;
    variantName?: string;
    price?: number;
    inventory?: number;
    imageUrl?: string;
    isActive?: boolean;
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
    throw new Error("Permission denied: You can only modify your own products");
  }
  
  // Find variant to update
  const variantIndex = product.variants.findIndex(v => v.variantId === args.variantId);
  
  if (variantIndex === -1) {
    throw new Error("Variant not found");
  }
  
  const existingVariant = product.variants[variantIndex];
  
  // Validate inputs
  if (args.variantName !== undefined) {
    validateNotEmpty(args.variantName, "Variant name");
    validateStringLength(args.variantName, "Variant name", 1, 100);
    
    // Check if new name conflicts with other variants
    const nameConflict = product.variants.find(
      (v, index) => index !== variantIndex && 
      v.variantName.toLowerCase() === args.variantName!.toLowerCase()
    );
    
    if (nameConflict) {
      throw new Error("Variant name already exists for this product");
    }
  }
  
  if (args.price !== undefined) {
    validatePositiveNumber(args.price, "Variant price");
  }
  
  if (args.inventory !== undefined) {
    validateNonNegativeNumber(args.inventory, "Variant inventory");
  }
  
  // Update variant
  const now = Date.now();
  const updatedVariant = {
    ...existingVariant,
    variantName: args.variantName !== undefined ? sanitizeString(args.variantName) : existingVariant.variantName,
    price: args.price !== undefined ? args.price : existingVariant.price,
    inventory: args.inventory !== undefined ? args.inventory : existingVariant.inventory,
    imageUrl: args.imageUrl !== undefined ? args.imageUrl : existingVariant.imageUrl,
    isActive: args.isActive !== undefined ? args.isActive : existingVariant.isActive,
    updatedAt: now,
  };
  
  // Update variants array
  const updatedVariants = [...product.variants];
  updatedVariants[variantIndex] = updatedVariant;
  
  // Recalculate price range and total inventory
  const variantPrices = updatedVariants.map(v => v.price);
  const inventoryDiff = args.inventory !== undefined ? args.inventory - existingVariant.inventory : 0;
  
  await ctx.db.patch(args.productId, {
    variants: updatedVariants,
    minPrice: Math.min(...variantPrices),
    maxPrice: Math.max(...variantPrices),
    inventory: product.inventory + inventoryDiff,
    updatedAt: now,
  });
  
  // Log the action
  await logAction(
    ctx,
    "update_product_variant",
    "DATA_CHANGE",
    "MEDIUM",
    `Updated variant in product: ${product.title}`,
    currentUser._id,
    product.organizationId,
    { 
      productId: args.productId,
      variantId: args.variantId,
      changes: {
        variantName: args.variantName,
        price: args.price,
        inventory: args.inventory,
        imageUrl: args.imageUrl,
        isActive: args.isActive
      }
    }
  );
  
  return args.variantId;
};
