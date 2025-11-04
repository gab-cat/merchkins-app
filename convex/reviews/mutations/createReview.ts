import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication } from '../../helpers/auth';
import { validateProductExists, validateStringLength } from '../../helpers/validation';
import { internal } from '../../_generated/api';

export const createReviewArgs = {
  productId: v.id('products'),
  rating: v.number(),
  comment: v.optional(v.string()),
};

export const createReviewHandler = async (
  ctx: MutationCtx,
  args: {
    productId: Id<'products'>;
    rating: number;
    comment?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Validate product exists
  const product = await validateProductExists(ctx, args.productId);

  // Validate rating (1-5)
  if (args.rating < 1 || args.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate comment length if provided
  if (args.comment) {
    validateStringLength(args.comment, 'Comment', 0, 2000);
  }

  // Check if user already has a review for this product using compound index
  const existingReview = await ctx.db
    .query('reviews')
    .withIndex('by_user_product', (q) => q.eq('userId', currentUser._id).eq('productId', args.productId))
    .first();

  if (existingReview) {
    throw new Error('You have already reviewed this product. Please edit your existing review instead.');
  }

  // Check if user has purchased this product (for verified purchase badge)
  const userOrders = await ctx.db
    .query('orders')
    .withIndex('by_customer', (q) => q.eq('customerId', currentUser._id))
    .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('status'), 'DELIVERED')))
    .collect();

  let isVerifiedPurchase = false;
  let orderId: Id<'orders'> | undefined;

  // Check if any order contains this product
  for (const order of userOrders) {
    if (order.embeddedItems) {
      const hasProduct = order.embeddedItems.some((item) => item.productInfo.productId === args.productId);
      if (hasProduct) {
        isVerifiedPurchase = true;
        orderId = order._id;
        break;
      }
    }
  }

  // Build user info
  const userInfo = {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    imageUrl: currentUser.imageUrl,
    courses: currentUser.email, // Using email as courses field placeholder
  };

  // Build product info
  const productInfo = {
    title: product.title,
    slug: product.slug,
    imageUrl: product.imageUrl,
    organizationId: product.organizationId,
    organizationName: product.organizationInfo?.name,
  };

  const now = Date.now();

  // Create review
  const reviewId = await ctx.db.insert('reviews', {
    productId: args.productId,
    userId: currentUser._id,
    userInfo,
    productInfo,
    rating: args.rating,
    comment: args.comment,
    isVerifiedPurchase,
    orderId,
    helpfulCount: 0,
    reportCount: 0,
    isModerated: false,
    createdAt: now,
    updatedAt: now,
  });

  // Calculate new average rating and update product stats
  const allReviews = await ctx.db
    .query('reviews')
    .withIndex('by_product', (q) => q.eq('productId', args.productId))
    .filter((q) => q.eq(q.field('isModerated'), false))
    .collect();

  const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
  const newRating = totalRating / allReviews.length;
  const newReviewsCount = allReviews.length;

  // Update product stats
  await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
    productId: args.productId,
    newRating,
    newReviewsCount,
  });

  return reviewId;
};
