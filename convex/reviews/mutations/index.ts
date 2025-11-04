import { mutation } from '../../_generated/server';

import { createReviewArgs, createReviewHandler } from './createReview';
import { updateReviewArgs, updateReviewHandler } from './updateReview';

export const createReview = mutation({
  args: createReviewArgs,
  handler: createReviewHandler,
});

export const updateReview = mutation({
  args: updateReviewArgs,
  handler: updateReviewHandler,
});
