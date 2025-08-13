import { QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id, Doc } from "../../_generated/dataModel";

// Get product recommendations based on a product
export const getProductRecommendationsArgs = {
  productId: v.id("products"),
  limit: v.optional(v.number()),
  strategy: v.optional(v.union(
    v.literal("similar_category"),
    v.literal("same_organization"),
    v.literal("popular"),
    v.literal("price_range"),
    v.literal("tags")
  )),
};

export const getProductRecommendationsHandler = async (
  ctx: QueryCtx,
  args: {
    productId: Id<"products">;
    limit?: number;
    strategy?: "similar_category" | "same_organization" | "popular" | "price_range" | "tags";
  }
) => {
  const product = await ctx.db.get(args.productId);
  
  if (!product || product.isDeleted) {
    throw new Error("Product not found");
  }
  
  const limit = args.limit || 10;
  const strategy = args.strategy || "similar_category";
  
  let candidates: Doc<"products">[] = [];
  
  switch (strategy) {
    case "similar_category":
      if (product.categoryId) {
        candidates = await ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("categoryId", product.categoryId!))
          .filter((q) => q.and(
            q.eq(q.field("isDeleted"), false),
            q.neq(q.field("_id"), args.productId),
            q.gt(q.field("inventory"), 0)
          ))
          .collect();
      }
      break;
      
    case "same_organization":
      if (product.organizationId) {
        candidates = await ctx.db
          .query("products")
          .withIndex("by_organization", (q) => q.eq("organizationId", product.organizationId!))
          .filter((q) => q.and(
            q.eq(q.field("isDeleted"), false),
            q.neq(q.field("_id"), args.productId),
            q.gt(q.field("inventory"), 0)
          ))
          .collect();
      }
      break;
      
    case "popular":
      candidates = await ctx.db
        .query("products")
        .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
        .filter((q) => q.and(
          q.neq(q.field("_id"), args.productId),
          q.gt(q.field("inventory"), 0),
          q.gt(q.field("totalOrders"), 10) // Popular products have >10 orders
        ))
        .collect();
      break;
      
    case "price_range":
      const productMinPrice = product.minPrice || 0;
      const productMaxPrice = product.maxPrice || Number.MAX_VALUE;
      const priceBuffer = (productMaxPrice - productMinPrice) * 0.3; // 30% price range
      
      candidates = await ctx.db
        .query("products")
        .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
        .filter((q) => q.and(
          q.neq(q.field("_id"), args.productId),
          q.gt(q.field("inventory"), 0),
          q.gte(q.field("minPrice"), Math.max(0, productMinPrice - priceBuffer)),
          q.lte(q.field("maxPrice"), productMaxPrice + priceBuffer)
        ))
        .collect();
      break;
      
    case "tags":
      if (product.tags.length > 0) {
        candidates = await ctx.db
          .query("products")
          .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
          .filter((q) => q.and(
            q.neq(q.field("_id"), args.productId),
            q.gt(q.field("inventory"), 0)
          ))
          .collect();
        
        // Filter by shared tags in post-processing
        candidates = candidates.filter(candidate => 
          candidate.tags.some(tag => product.tags.includes(tag))
        );
      }
      break;
  }
  
  // If we don't have enough candidates, fall back to popular products
  if (candidates.length < limit) {
    const fallbackCandidates = await ctx.db
      .query("products")
      .withIndex("by_isDeleted", (q) => q.eq("isDeleted", false))
      .filter((q) => q.and(
        q.neq(q.field("_id"), args.productId),
        q.gt(q.field("inventory"), 0)
      ))
      .collect();
    
    // Add unique fallback candidates
    const existingIds = new Set(candidates.map(c => c._id));
    const uniqueFallbackCandidates = fallbackCandidates.filter(c => !existingIds.has(c._id));
    candidates = [...candidates, ...uniqueFallbackCandidates];
  }
  
  // Score and sort candidates
  const scoredCandidates = candidates.map(candidate => {
    let score = 0;
    
    // Base popularity score
    score += candidate.totalOrders * 0.3;
    score += candidate.viewCount * 0.1;
    score += candidate.rating * candidate.reviewsCount * 0.2;
    
    // Category similarity bonus
    if (candidate.categoryId === product.categoryId) {
      score += 50;
    }
    
    // Organization similarity bonus
    if (candidate.organizationId === product.organizationId) {
      score += 30;
    }
    
    // Tag similarity bonus
    const sharedTags = candidate.tags.filter((tag: string) => product.tags.includes(tag));
    score += sharedTags.length * 10;
    
    // Price similarity bonus (closer prices get higher scores)
    if (product.minPrice && candidate.minPrice) {
      const priceDiff = Math.abs(product.minPrice - candidate.minPrice);
      const maxPrice = Math.max(product.minPrice, candidate.minPrice);
      const priceSimilarity = 1 - (priceDiff / maxPrice);
      score += priceSimilarity * 20;
    }
    
    // Recent product bonus
    const daysSinceCreated = (Date.now() - candidate.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 30) {
      score += 15;
    }
    
    return {
      ...candidate,
      recommendationScore: score,
    };
  });
  
  // Sort by score and take top results
  scoredCandidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  
  const recommendations = scoredCandidates.slice(0, limit);
  
  // Remove the recommendation score from final results
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const finalRecommendations = recommendations.map(({ recommendationScore, ...product }) => product);
  
  return {
    products: finalRecommendations,
    strategy,
    basedOn: {
      productId: args.productId,
      title: product.title,
      categoryId: product.categoryId,
      organizationId: product.organizationId,
    },
    total: finalRecommendations.length,
  };
};
