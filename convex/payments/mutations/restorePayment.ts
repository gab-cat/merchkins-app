import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';
import { internal } from '../../_generated/api';

export const restorePaymentArgs = {
  paymentId: v.id('payments'),
} as const;

export const restorePaymentHandler = async (ctx: MutationCtx, args: { paymentId: Id<'payments'> }) => {
  const currentUser = await requireAuthentication(ctx);

  const existing = await ctx.db.get(args.paymentId);
  if (!existing) throw new Error('Payment not found');
  if (!existing.isDeleted) return args.paymentId;

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_PAYMENTS', 'update');
  } else if (!currentUser.isAdmin && !currentUser.isStaff) {
    throw new Error('Permission denied');
  }

  await ctx.db.patch(args.paymentId, { isDeleted: false, updatedAt: Date.now() });

  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: existing.orderId,
  });

  await logAction(
    ctx,
    'restore_payment',
    'DATA_CHANGE',
    'LOW',
    `Restored payment ${String(args.paymentId)} for order ${existing.orderInfo.orderNumber ?? String(existing.orderId)}`,
    currentUser._id,
    existing.organizationId ?? undefined
  );

  return args.paymentId;
};
