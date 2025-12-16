import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';

export const deleteBatchArgs = {
  batchId: v.id('orderBatches'),
};

export const deleteBatchHandler = async (
  ctx: MutationCtx,
  args: {
    batchId: Id<'orderBatches'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.isDeleted) {
    throw new Error('Batch already deleted');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'delete');

  // Soft delete - mark as deleted but keep batch info in orders
  await ctx.db.patch(args.batchId, {
    isDeleted: true,
    isActive: false,
    updatedAt: Date.now(),
  });

  // Log action
  await logAction(ctx, 'delete_batch', 'DATA_CHANGE', 'MEDIUM', `Deleted batch "${batch.name}"`, currentUser._id, batch.organizationId, {
    batchId: args.batchId,
    name: batch.name,
  });

  return args.batchId;
};
