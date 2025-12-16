import { mutation } from '../../_generated/server';
import { createBatchHandler, createBatchArgs } from './createBatch';
import { updateBatchHandler, updateBatchArgs } from './updateBatch';
import { deleteBatchHandler, deleteBatchArgs } from './deleteBatch';
import { assignOrdersToBatchHandler, assignOrdersToBatchArgs } from './assignOrdersToBatch';
import { removeOrdersFromBatchHandler, removeOrdersFromBatchArgs } from './removeOrdersFromBatch';
import { bulkUpdateBatchOrdersHandler, bulkUpdateBatchOrdersArgs } from './bulkUpdateBatchOrders';

export const createBatch = mutation({
  args: createBatchArgs,
  handler: createBatchHandler,
});

export const updateBatch = mutation({
  args: updateBatchArgs,
  handler: updateBatchHandler,
});

export const deleteBatch = mutation({
  args: deleteBatchArgs,
  handler: deleteBatchHandler,
});

export const assignOrdersToBatch = mutation({
  args: assignOrdersToBatchArgs,
  handler: assignOrdersToBatchHandler,
});

export const removeOrdersFromBatch = mutation({
  args: removeOrdersFromBatchArgs,
  handler: removeOrdersFromBatchHandler,
});

export const bulkUpdateBatchOrders = mutation({
  args: bulkUpdateBatchOrdersArgs,
  handler: bulkUpdateBatchOrdersHandler,
});
