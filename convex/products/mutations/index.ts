import { mutation, internalMutation } from '../../_generated/server';

// Import args and handlers
import { createProductArgs, createProductHandler } from './createProduct';
import { updateProductArgs, updateProductHandler } from './updateProduct';
import { deleteProductArgs, deleteProductHandler } from './deleteProduct';
import { restoreProductArgs, restoreProductHandler } from './restoreProduct';
import { updateProductStatsArgs, updateProductStatsHandler } from './updateProductStats';
import {
  addVariantArgs,
  addVariantHandler,
  removeVariantArgs,
  removeVariantHandler,
  updateVariantArgs,
  updateVariantHandler,
} from './manageVariants';
import { bulkUpdateInventoryArgs, bulkUpdateInventoryHandler, bulkUpdatePricesArgs, bulkUpdatePricesHandler } from './bulkOperations';
import {
  updateProductImagesArgs,
  updateProductImagesHandler,
  updateVariantImageArgs,
  updateVariantImageHandler,
  updateVariantStatusArgs,
  updateVariantStatusHandler,
} from './manageProductImages';

// Export mutation functions
export const createProduct = mutation({
  args: createProductArgs,
  handler: createProductHandler,
});

export const updateProduct = mutation({
  args: updateProductArgs,
  handler: updateProductHandler,
});

export const deleteProduct = mutation({
  args: deleteProductArgs,
  handler: deleteProductHandler,
});

export const restoreProduct = mutation({
  args: restoreProductArgs,
  handler: restoreProductHandler,
});

export const updateProductStats = internalMutation({
  args: updateProductStatsArgs,
  handler: updateProductStatsHandler,
});

// Variant management
export const addVariant = mutation({
  args: addVariantArgs,
  handler: addVariantHandler,
});

export const removeVariant = mutation({
  args: removeVariantArgs,
  handler: removeVariantHandler,
});

export const updateVariant = mutation({
  args: updateVariantArgs,
  handler: updateVariantHandler,
});

// Image management
export const updateProductImages = mutation({
  args: updateProductImagesArgs,
  handler: updateProductImagesHandler,
});

export const updateVariantImage = mutation({
  args: updateVariantImageArgs,
  handler: updateVariantImageHandler,
});

export const updateVariantStatus = mutation({
  args: updateVariantStatusArgs,
  handler: updateVariantStatusHandler,
});

// Bulk operations
export const bulkUpdateInventory = mutation({
  args: bulkUpdateInventoryArgs,
  handler: bulkUpdateInventoryHandler,
});

export const bulkUpdatePrices = mutation({
  args: bulkUpdatePricesArgs,
  handler: bulkUpdatePricesHandler,
});
