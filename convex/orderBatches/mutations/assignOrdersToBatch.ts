import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';
import { createSystemOrderLog } from '../../orders/mutations/createOrderLog';

export const assignOrdersToBatchArgs = {
  batchId: v.id('orderBatches'),
  orderIds: v.array(v.id('orders')),
};

export const assignOrdersToBatchHandler = async (
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

  if (batch.isDeleted) {
    throw new Error('Cannot assign orders to deleted batch');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'update');

  const now = Date.now();
  let assignedCount = 0;

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
    if (!existingBatchIds.includes(args.batchId)) {
      const updatedBatchIds = [...existingBatchIds, args.batchId];
      const updatedBatchInfo = [
        ...(order.batchInfo || []),
        {
          id: args.batchId,
          name: batch.name,
        },
      ];

      await ctx.db.patch(orderId, {
        batchIds: updatedBatchIds,
        batchInfo: updatedBatchInfo,
        updatedAt: now,
      });

      // Log in order's activity log
      await createSystemOrderLog(ctx, {
        orderId,
        logType: 'SYSTEM_UPDATE',
        reason: 'Added to batch',
        message: `Order added to batch: ${batch.name}`,
        isPublic: false,
        actorId: currentUser._id,
      });

      assignedCount++;
    }
  }

  // Log action
  await logAction(
    ctx,
    'assign_orders_to_batch',
    'DATA_CHANGE',
    'MEDIUM',
    `Assigned ${assignedCount} order(s) to batch "${batch.name}"`,
    currentUser._id,
    batch.organizationId,
    {
      batchId: args.batchId,
      orderIds: args.orderIds,
      assignedCount,
    }
  );

  return {
    batchId: args.batchId,
    assignedCount,
  };
};
