import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { 
  validateProductExists,
  validateNonNegativeNumber
} from "../../helpers";

// Update product statistics (views, orders, etc.)
export const updateProductStatsArgs = {
  productId: v.id("products"),
  incrementViews: v.optional(v.number()),
  incrementOrders: v.optional(v.number()),
  newRating: v.optional(v.number()),
  newReviewsCount: v.optional(v.number()),
  variantUpdates: v.optional(v.array(v.object({
    variantId: v.string(),
    incrementOrders: v.optional(v.number()),
    incrementInCart: v.optional(v.number()),
    newInventory: v.optional(v.number()),
  }))),
};

export const updateProductStatsHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    incrementViews?: number;
    incrementOrders?: number;
    newRating?: number;
    newReviewsCount?: number;
    variantUpdates?: Array<{
      variantId: string;
      incrementOrders?: number;
      incrementInCart?: number;
      newInventory?: number;
    }>;
  }
) => {
  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);
  
  // Validate inputs
  if (args.incrementViews !== undefined) {
    validateNonNegativeNumber(args.incrementViews, "View increment");
  }
  
  if (args.incrementOrders !== undefined) {
    validateNonNegativeNumber(args.incrementOrders, "Order increment");
  }
  
  if (args.newRating !== undefined) {
    if (args.newRating < 0 || args.newRating > 5) {
      throw new Error("Rating must be between 0 and 5");
    }
  }
  
  if (args.newReviewsCount !== undefined) {
    validateNonNegativeNumber(args.newReviewsCount, "Reviews count");
  }
  
  // Prepare update object
  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };
  
  // Update view count
  if (args.incrementViews !== undefined && args.incrementViews > 0) {
    updates.viewCount = product.viewCount + args.incrementViews;
  }
  
  // Update order count
  if (args.incrementOrders !== undefined && args.incrementOrders > 0) {
    updates.totalOrders = product.totalOrders + args.incrementOrders;
  }
  
  // Update rating
  if (args.newRating !== undefined) {
    updates.rating = args.newRating;
  }
  
  // Update reviews count
  if (args.newReviewsCount !== undefined) {
    updates.reviewsCount = args.newReviewsCount;
  }
  
  // Update variants if provided
  if (args.variantUpdates && args.variantUpdates.length > 0) {
    const updatedVariants = product.variants.map(variant => {
      const variantUpdate = args.variantUpdates!.find(
        update => update.variantId === variant.variantId
      );
      
      if (!variantUpdate) {
        return variant;
      }
      
      const updatedVariant = { ...variant };
      
      if (variantUpdate.incrementOrders !== undefined && variantUpdate.incrementOrders > 0) {
        updatedVariant.orderCount += variantUpdate.incrementOrders;
      }
      
      if (variantUpdate.incrementInCart !== undefined) {
        updatedVariant.inCartCount = Math.max(0, updatedVariant.inCartCount + variantUpdate.incrementInCart);
      }
      
      if (variantUpdate.newInventory !== undefined) {
        validateNonNegativeNumber(variantUpdate.newInventory, "Variant inventory");
        updatedVariant.inventory = variantUpdate.newInventory;
      }
      
      updatedVariant.updatedAt = Date.now();
      
      return updatedVariant;
    });
    
    updates.variants = updatedVariants;
    
    // Determine popular variants (top 20% by order count or those with >10 orders)
    const sortedByOrders = [...updatedVariants].sort((a, b) => b.orderCount - a.orderCount);
    const popularThreshold = Math.max(10, Math.ceil(updatedVariants.length * 0.2));
    
    updates.variants = updatedVariants.map(variant => ({
      ...variant,
      isPopular: sortedByOrders.slice(0, popularThreshold).some(v => v.variantId === variant.variantId)
    }));
  }
  
  // Apply updates
  await ctx.db.patch(args.productId, updates);
  
  return args.productId;
};
