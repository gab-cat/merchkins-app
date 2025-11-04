import { mutation, internalMutation } from '../../_generated/server';

// Import args and handlers
import { createCategoryArgs, createCategoryHandler } from './createCategory';
import { updateCategoryArgs, updateCategoryHandler } from './updateCategory';
import { deleteCategoryArgs, deleteCategoryHandler } from './deleteCategory';
import { restoreCategoryArgs, restoreCategoryHandler } from './restoreCategory';
import { updateCategoryStatsArgs, updateCategoryStatsHandler } from './updateCategoryStats';

// Export mutation functions
export const createCategory = mutation({
  args: createCategoryArgs,
  handler: createCategoryHandler,
});

export const updateCategory = mutation({
  args: updateCategoryArgs,
  handler: updateCategoryHandler,
});

export const deleteCategory = mutation({
  args: deleteCategoryArgs,
  handler: deleteCategoryHandler,
});

export const restoreCategory = mutation({
  args: restoreCategoryArgs,
  handler: restoreCategoryHandler,
});

export const updateCategoryStats = internalMutation({
  args: updateCategoryStatsArgs,
  handler: updateCategoryStatsHandler,
});
