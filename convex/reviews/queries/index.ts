import { query } from '../../_generated/server';

import { getUserReviewArgs, getUserReviewHandler } from './getUserReview';
import { getReviewsByProductArgs, getReviewsByProductHandler } from './getReviewsByProduct';

export const getUserReview = query({
  args: getUserReviewArgs,
  handler: getUserReviewHandler,
});

export const getReviewsByProduct = query({
  args: getReviewsByProductArgs,
  handler: getReviewsByProductHandler,
});
