import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
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
  validateProductExists,
  validateCategoryExists,
  requireOrganizationPermission,
  isProductSlugUnique,
  isProductCodeUnique,
} from '../../helpers';

// Update existing product
export const updateProductArgs = {
  productId: v.id('products'),
  categoryId: v.optional(v.id('categories')),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  slug: v.optional(v.string()),
  code: v.optional(v.string()),
  discountLabel: v.optional(v.string()),
  supposedPrice: v.optional(v.number()),
  imageUrl: v.optional(v.array(v.string())),
  tags: v.optional(v.array(v.string())),
  isBestPrice: v.optional(v.boolean()),
  isActive: v.optional(v.boolean()),
  inventory: v.optional(v.number()),
  inventoryType: v.optional(v.union(v.literal('PREORDER'), v.literal('STOCK'))),
  fulfillmentDays: v.optional(v.number()),
  variants: v.optional(
    v.array(
      v.object({
        variantId: v.optional(v.string()),
        variantName: v.string(),
        price: v.number(),
        inventory: v.number(),
        imageUrl: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
      })
    )
  ),
};

export const updateProductHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<'products'>;
    categoryId?: Id<'categories'>;
    title?: string;
    description?: string;
    slug?: string;
    code?: string;
    discountLabel?: string;
    supposedPrice?: number;
    imageUrl?: string[];
    tags?: string[];
    isBestPrice?: boolean;
    isActive?: boolean;
    inventory?: number;
    inventoryType?: 'PREORDER' | 'STOCK';
    fulfillmentDays?: number;
    variants?: Array<{
      variantId?: string;
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

  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);

  // Check permissions
  if (product.organizationId) {
    await requireOrganizationPermission(ctx, product.organizationId, 'MANAGE_PRODUCTS', 'update');
  } else if (!currentUser.isAdmin && product.postedById !== currentUser._id) {
    throw new Error('Permission denied: You can only update your own products');
  }

  // Validate inputs if provided
  if (args.title) {
    validateNotEmpty(args.title, 'Product title');
    validateStringLength(args.title, 'Product title', 2, 200);
  }

  if (args.description !== undefined) {
    if (args.description) {
      validateStringLength(args.description, 'Product description', 0, 2000);
    }
  }

  if (args.discountLabel !== undefined) {
    if (args.discountLabel) {
      validateStringLength(args.discountLabel, 'Discount label', 0, 50);
    }
  }

  if (args.supposedPrice !== undefined) {
    if (args.supposedPrice) {
      validatePositiveNumber(args.supposedPrice, 'Supposed price');
    }
  }

  if (args.imageUrl) {
    validateArrayNotEmpty(args.imageUrl, 'Product images');
  }

  if (args.inventory !== undefined) {
    validateNonNegativeNumber(args.inventory, 'Inventory');
  }

  if (args.variants) {
    validateArrayNotEmpty(args.variants, 'Product variants');

    // Validate each variant
    args.variants.forEach((variant, index) => {
      validateNotEmpty(variant.variantName, `Variant ${index + 1} name`);
      validateStringLength(variant.variantName, `Variant ${index + 1} name`, 1, 100);
      validatePositiveNumber(variant.price, `Variant ${index + 1} price`);
      validateNonNegativeNumber(variant.inventory, `Variant ${index + 1} inventory`);
    });

    // Check for duplicate variant names
    const variantNames = args.variants.map((v) => v.variantName.toLowerCase());
    const uniqueVariantNames = new Set(variantNames);
    if (variantNames.length !== uniqueVariantNames.size) {
      throw new Error('Variant names must be unique');
    }
  }

  // Prepare update object
  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  // Handle slug update
  if (args.slug !== undefined) {
    const newSlug = args.slug ? sanitizeString(args.slug.toLowerCase()) : generateSlug(args.title || product.title);

    // Check if slug is unique (excluding current product)
    if (product.organizationId) {
      const isUnique = await isProductSlugUnique(ctx, newSlug, product.organizationId, args.productId);
      if (!isUnique) {
        throw new Error('Product slug already exists in this organization');
      }
    }

    updates.slug = newSlug;
  }

  // Handle title update
  if (args.title) {
    updates.title = sanitizeString(args.title);
  }

  // Handle code update
  if (args.code !== undefined) {
    if (args.code) {
      // Validate code uniqueness (codes are globally unique)
      const sanitizedCode = sanitizeString(args.code).toUpperCase();
      const isUnique = await isProductCodeUnique(ctx, sanitizedCode, args.productId);
      if (!isUnique) {
        throw new Error('Product code already exists. Please use a unique code.');
      }
      updates.code = sanitizedCode;
    } else {
      // Allow clearing the code
      updates.code = undefined;
    }
  }

  // Handle description update
  if (args.description !== undefined) {
    updates.description = args.description ? sanitizeString(args.description) : undefined;
  }

  // Handle other simple fields
  if (args.discountLabel !== undefined) {
    updates.discountLabel = args.discountLabel ? sanitizeString(args.discountLabel) : undefined;
  }

  if (args.supposedPrice !== undefined) {
    updates.supposedPrice = args.supposedPrice;
  }

  if (args.imageUrl) {
    updates.imageUrl = args.imageUrl;
  }

  if (args.tags) {
    updates.tags = args.tags;
  }

  if (args.isBestPrice !== undefined) {
    updates.isBestPrice = args.isBestPrice;
  }

  if (args.isActive !== undefined) {
    updates.isActive = args.isActive;
  }

  if (args.inventory !== undefined) {
    updates.inventory = args.inventory;
  }

  if (args.inventoryType) {
    updates.inventoryType = args.inventoryType;
  }

  if (args.fulfillmentDays !== undefined) {
    updates.fulfillmentDays = args.fulfillmentDays || undefined;
  }

  // Handle category update
  if (args.categoryId !== undefined) {
    let categoryInfo = undefined;

    if (args.categoryId) {
      const category = await validateCategoryExists(ctx, args.categoryId);

      // Ensure category belongs to same organization (or both are global)
      if (category.organizationId !== product.organizationId) {
        throw new Error('Category must belong to the same organization');
      }

      categoryInfo = {
        name: category.name,
        description: category.description,
      };
    }

    updates.categoryId = args.categoryId;
    updates.categoryInfo = categoryInfo;

    // Update category product counts
    if (product.categoryId && product.categoryId !== args.categoryId) {
      // Remove from old category
      const oldCategory = await ctx.db.get(product.categoryId);
      if (oldCategory) {
        await ctx.db.patch(product.categoryId, {
          productCount: Math.max(0, oldCategory.productCount - 1),
          activeProductCount: Math.max(0, oldCategory.activeProductCount - 1),
          updatedAt: Date.now(),
        });
      }
    }

    if (args.categoryId && args.categoryId !== product.categoryId) {
      // Add to new category
      const newCategory = await ctx.db.get(args.categoryId);
      if (newCategory) {
        await ctx.db.patch(args.categoryId, {
          productCount: newCategory.productCount + 1,
          activeProductCount: newCategory.activeProductCount + 1,
          updatedAt: Date.now(),
        });
      }
    }
  }

  // Handle variants update
  if (args.variants) {
    const now = Date.now();
    const existingVariants = product.variants;

    const processedVariants = args.variants.map((variant, index) => {
      // Try to find existing variant by ID or name
      const existingVariant = variant.variantId
        ? existingVariants.find((v) => v.variantId === variant.variantId)
        : existingVariants.find((v) => v.variantName.toLowerCase() === variant.variantName.toLowerCase());

      return {
        variantId: variant.variantId || existingVariant?.variantId || `variant-${now}-${index}`,
        variantName: sanitizeString(variant.variantName),
        price: variant.price,
        inventory: variant.inventory,
        imageUrl: variant.imageUrl || existingVariant?.imageUrl,
        isActive: variant.isActive !== undefined ? variant.isActive : (existingVariant?.isActive ?? true),
        orderCount: existingVariant?.orderCount || 0,
        inCartCount: existingVariant?.inCartCount || 0,
        isPopular: existingVariant?.isPopular || false,
        createdAt: existingVariant?.createdAt || now,
        updatedAt: now,
      };
    });

    updates.variants = processedVariants;
    updates.totalVariants = processedVariants.length;

    // Calculate new price range
    const variantPrices = processedVariants.map((v) => v.price);
    updates.minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : undefined;
    updates.maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : undefined;
  }

  // Update product
  await ctx.db.patch(args.productId, updates);

  // Log the action
  await logAction(
    ctx,
    'update_product',
    'DATA_CHANGE',
    'MEDIUM',
    `Updated product: ${updates.title || product.title}`,
    currentUser._id,
    product.organizationId,
    {
      productId: args.productId,
      updatedFields: Object.keys(updates).filter((key) => key !== 'updatedAt'),
    }
  );

  return args.productId;
};
