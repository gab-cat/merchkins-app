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
  validateArrayNotEmpty,
  sanitizeString,
  generateSlug,
  validateOrganizationExists,
  validateCategoryExists,
  requireOrganizationPermission,
  isProductSlugUnique
} from "../../helpers";

// Create new product
export const createProductArgs = {
  organizationId: v.optional(v.id("organizations")),
  categoryId: v.optional(v.id("categories")),
  title: v.string(),
  description: v.optional(v.string()),
  slug: v.optional(v.string()),
  discountLabel: v.optional(v.string()),
  supposedPrice: v.optional(v.number()),
  imageUrl: v.array(v.string()),
  tags: v.optional(v.array(v.string())),
  isBestPrice: v.optional(v.boolean()),
  inventory: v.number(),
  inventoryType: v.union(v.literal("PREORDER"), v.literal("STOCK")),
  variants: v.array(v.object({
    variantName: v.string(),
    price: v.number(),
    inventory: v.number(),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  })),
};

export const createProductHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<"organizations">;
    categoryId?: Id<"categories">;
    title: string;
    description?: string;
    slug?: string;
    discountLabel?: string;
    supposedPrice?: number;
    imageUrl: string[];
    tags?: string[];
    isBestPrice?: boolean;
    inventory: number;
    inventoryType: "PREORDER" | "STOCK";
    variants: Array<{
      variantName: string;
      price: number;
      inventory: number;
      imageUrl?: string;
      isActive?: boolean;
    }>;
  }
) => {
  // Require authentication
  const currentUser = await requireAuthentication(ctx);
  
  // Validate required inputs
  validateNotEmpty(args.title, "Product title");
  validateStringLength(args.title, "Product title", 2, 200);
  validateArrayNotEmpty(args.imageUrl, "Product images");
  validateArrayNotEmpty(args.variants, "Product variants");
  validateNonNegativeNumber(args.inventory, "Inventory");
  
  if (args.description) {
    validateStringLength(args.description, "Product description", 0, 2000);
  }
  
  if (args.discountLabel) {
    validateStringLength(args.discountLabel, "Discount label", 0, 50);
  }
  
  if (args.supposedPrice) {
    validatePositiveNumber(args.supposedPrice, "Supposed price");
  }
  
  // Validate variants
  args.variants.forEach((variant, index) => {
    validateNotEmpty(variant.variantName, `Variant ${index + 1} name`);
    validateStringLength(variant.variantName, `Variant ${index + 1} name`, 1, 100);
    validatePositiveNumber(variant.price, `Variant ${index + 1} price`);
    validateNonNegativeNumber(variant.inventory, `Variant ${index + 1} inventory`);
  });
  
  // Check for duplicate variant names
  const variantNames = args.variants.map(v => v.variantName.toLowerCase());
  const uniqueVariantNames = new Set(variantNames);
  if (variantNames.length !== uniqueVariantNames.size) {
    throw new Error("Variant names must be unique");
  }
  
  // Sanitize inputs
  const productData = {
    title: sanitizeString(args.title),
    description: args.description ? sanitizeString(args.description) : undefined,
    slug: args.slug ? sanitizeString(args.slug.toLowerCase()) : generateSlug(args.title),
    discountLabel: args.discountLabel ? sanitizeString(args.discountLabel) : undefined,
    supposedPrice: args.supposedPrice,
    imageUrl: args.imageUrl,
    tags: args.tags || [],
    isBestPrice: args.isBestPrice || false,
    inventory: args.inventory,
    inventoryType: args.inventoryType,
  };
  
  let organizationInfo = undefined;
  let categoryInfo = undefined;
  
  // Validate organization if provided
  if (args.organizationId) {
    const organization = await validateOrganizationExists(ctx, args.organizationId);
    
    // Check if user has permission to create products in this organization
    await requireOrganizationPermission(ctx, args.organizationId, "MANAGE_PRODUCTS", "create");
    
    organizationInfo = {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    };
    
    // Check if slug is unique within organization
    const isUnique = await isProductSlugUnique(ctx, productData.slug, args.organizationId);
    if (!isUnique) {
      throw new Error("Product slug already exists in this organization");
    }
  } else {
    // For global products, only system admins can create
    if (!currentUser.isAdmin) {
      throw new Error("Only system administrators can create global products");
    }
  }
  
  // Validate category if provided
  if (args.categoryId) {
    const category = await validateCategoryExists(ctx, args.categoryId);
    
    // Ensure category belongs to same organization (or both are global)
    if (category.organizationId !== args.organizationId) {
      throw new Error("Category must belong to the same organization");
    }
    
    categoryInfo = {
      name: category.name,
      description: category.description,
    };
  }
  
  // Prepare creator info
  const creatorInfo = {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    imageUrl: currentUser.imageUrl,
  };
  
  // Calculate variant metrics
  const variantPrices = args.variants.map(v => v.price);
  const minPrice = Math.min(...variantPrices);
  const maxPrice = Math.max(...variantPrices);
  
  // Prepare variants with additional data
  const now = Date.now();
  const processedVariants = args.variants.map((variant, index) => ({
    variantId: `variant-${now}-${index}`,
    variantName: sanitizeString(variant.variantName),
    price: variant.price,
    inventory: variant.inventory,
    imageUrl: variant.imageUrl,
    isActive: variant.isActive !== undefined ? variant.isActive : true,
    orderCount: 0,
    inCartCount: 0,
    isPopular: false,
    createdAt: now,
    updatedAt: now,
  }));
  
  // Create product
  const productId = await ctx.db.insert("products", {
    isDeleted: false,
    categoryId: args.categoryId,
    postedById: currentUser._id,
    organizationId: args.organizationId,
    categoryInfo,
    creatorInfo,
    organizationInfo,
    slug: productData.slug,
    title: productData.title,
    isActive: true,
    description: productData.description,
    discountLabel: productData.discountLabel,
    supposedPrice: productData.supposedPrice,
    rating: 0,
    reviewsCount: 0,
    imageUrl: productData.imageUrl,
    tags: productData.tags,
    isBestPrice: productData.isBestPrice,
    inventory: productData.inventory,
    inventoryType: productData.inventoryType,
    variants: processedVariants,
    recentReviews: [],
    totalVariants: processedVariants.length,
    minPrice: variantPrices.length > 0 ? minPrice : undefined,
    maxPrice: variantPrices.length > 0 ? maxPrice : undefined,
    totalOrders: 0,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  
  // Update category product count if category exists
  if (args.categoryId) {
    const category = await ctx.db.get(args.categoryId);
    if (category) {
      await ctx.db.patch(args.categoryId, {
        productCount: category.productCount + 1,
        activeProductCount: category.activeProductCount + 1,
        updatedAt: now,
      });
    }
  }
  
  // Log the action
  await logAction(
    ctx,
    "create_product",
    "DATA_CHANGE",
    "MEDIUM",
    `Created product: ${productData.title}`,
    currentUser._id,
    args.organizationId,
    { 
      productId,
      productSlug: productData.slug,
      categoryId: args.categoryId,
      variantCount: processedVariants.length
    }
  );
  
  return productId;
};
