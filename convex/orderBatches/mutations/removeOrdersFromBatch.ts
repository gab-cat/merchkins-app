import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const removeOrdersFromBatchArgs = {
  batchId: v.id('orderBatches'),
  orderIds: v.array(v.id('orders')),
};

export const removeOrdersFromBatchHandler = async (
  ctx: MutationCtx,
  args: {
    batchId: Id<'orderBatches'>;
    orderIds: Id<'orders'>[];
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'update');

  const now = Date.now();
  let removedCount = 0;

  for (const orderId of args.orderIds) {
    const order = await ctx.db.get(orderId);

    if (!order) {
      continue;
    }

    // Verify order belongs to same organization
    if (order.organizationId !== batch.organizationId) {
      continue;
    }

    const existingBatchIds = order.batchIds || [];
    if (existingBatchIds.includes(args.batchId)) {
      const updatedBatchIds = existingBatchIds.filter((id) => id !== args.batchId);
      const updatedBatchInfo = (order.batchInfo || []).filter((info) => info.id !== args.batchId);

      await ctx.db.patch(orderId, {
        batchIds: updatedBatchIds.length > 0 ? updatedBatchIds : undefined,
        batchInfo: updatedBatchInfo.length > 0 ? updatedBatchInfo : undefined,
        updatedAt: now,
      });

      // Log in order's activity log
      await createSystemOrderLog(ctx, {
        orderId,
        logType: 'SYSTEM_UPDATE',
        reason: 'Removed from batch',
        message: `Order removed from batch: ${batch.name}`,
        isPublic: false,
        actorId: currentUser._id,
      });

      removedCount++;
    }
  }

  // Log action
  await logAction(
    ctx,
    'remove_orders_from_batch',
    'DATA_CHANGE',
    'MEDIUM',
    `Removed ${removedCount} order(s) from batch "${batch.name}"`,
    currentUser._id,
    batch.organizationId,
    {
      batchId: args.batchId,
      orderIds: args.orderIds,
      removedCount,
    }
  );

  return {
    batchId: args.batchId,
    removedCount,
  };
};
