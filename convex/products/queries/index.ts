import { query } from '../../_generated/server';

// Import args and handlers
import { getProductsArgs, getProductsHandler } from './getProducts';
import { getProductByIdArgs, getProductByIdHandler } from './getProductById';
import { getProductBySlugArgs, getProductBySlugHandler } from './getProductBySlug';
import { searchProductsArgs, searchProductsHandler } from './searchProducts';
import { getPopularProductsArgs, getPopularProductsHandler } from './getPopularProducts';
import { getProductAnalyticsArgs, getProductAnalyticsHandler } from './getProductAnalytics';
import { getProductRecommendationsArgs, getProductRecommendationsHandler } from './getProductRecommendations';

// Export query functions
export const getProducts = query({
  args: getProductsArgs,
  handler: getProductsHandler,
});

export const getProductById = query({
  args: getProductByIdArgs,
  handler: getProductByIdHandler,
});

export const getProductBySlug = query({
  args: getProductBySlugArgs,
  handler: getProductBySlugHandler,
});

export const searchProducts = query({
  args: searchProductsArgs,
  handler: searchProductsHandler,
});

export const getPopularProducts = query({
  args: getPopularProductsArgs,
  handler: getPopularProductsHandler,
});

export const getProductAnalytics = query({
  args: getProductAnalyticsArgs,
  handler: getProductAnalyticsHandler,
});

export const getProductRecommendations = query({
  args: getProductRecommendationsArgs,
  handler: getProductRecommendationsHandler,
});
