import { MutationCtx } from "../../_generated/server";
import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { requireAuthentication } from "../../helpers/auth";
import { validateProductExists, validateStringLength } from "../../helpers/validation";
import { internal } from "../../_generated/api";

export const updateReviewArgs = {
  reviewId: v.id("reviews"),
  rating: v.optional(v.number()),
  comment: v.optional(v.string()),
};

export const updateReviewHandler = async (
  ctx: MutationCtx,
  args: {
    reviewId: Id<"reviews">;
    rating?: number;
    comment?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  
  // Get review
  const review = await ctx.db.get(args.reviewId);
  if (!review) {
    throw new Error("Review not found");
  }
  
  // Verify user owns this review
  if (review.userId !== currentUser._id) {
    throw new Error("You can only edit your own reviews");
  }
  
  // Validate product still exists
  await validateProductExists(ctx, review.productId);
  
  // Validate rating if provided
  if (args.rating !== undefined) {
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
  }
  
  // Validate comment length if provided
  if (args.comment !== undefined) {
    validateStringLength(args.comment, "Comment", 0, 2000);
  }
  
  // Prepare update object
  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };
  
  if (args.rating !== undefined) {
    updates.rating = args.rating;
  }
  
  if (args.comment !== undefined) {
    updates.comment = args.comment;
  }
  
  // Update review
  await ctx.db.patch(args.reviewId, updates);
  
  // Recalculate product stats
  const allReviews = await ctx.db
    .query("reviews")
    .withIndex("by_product", (q) => q.eq("productId", review.productId))
    .filter((q) => q.eq(q.field("isModerated"), false))
    .collect();
  
  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const newRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
  const newReviewsCount = allReviews.length;
  
  // Update product stats
  await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
    productId: review.productId,
    newRating,
    newReviewsCount,
  });
  
  return args.reviewId;
};
