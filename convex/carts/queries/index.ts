import { query } from '../../_generated/server';

// Import args and handlers
import { getCartByUserArgs, getCartByUserHandler } from './getCartByUser';
import { getCartByIdArgs, getCartByIdHandler } from './getCartById';
import { getCartSummaryArgs, getCartSummaryHandler } from './getCartSummary';
import { getAbandonedCartsArgs, getAbandonedCartsHandler } from './getAbandonedCarts';

// Export query functions
export const getCartByUser = query({
  args: getCartByUserArgs,
  handler: getCartByUserHandler,
});

export const getCartById = query({
  args: getCartByIdArgs,
  handler: getCartByIdHandler,
});

export const getCartSummary = query({
  args: getCartSummaryArgs,
  handler: getCartSummaryHandler,
});

export const getAbandonedCarts = query({
  args: getAbandonedCartsArgs,
  handler: getAbandonedCartsHandler,
});
