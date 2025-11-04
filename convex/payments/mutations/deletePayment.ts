import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';
import { internal } from '../../_generated/api';

export const deletePaymentArgs = {
  paymentId: v.id('payments'),
} as const;

export const deletePaymentHandler = async (ctx: MutationCtx, args: { paymentId: Id<'payments'> }) => {
  const currentUser = await requireAuthentication(ctx);

  const existing = await ctx.db.get(args.paymentId);
  if (!existing || existing.isDeleted) {
    throw new Error('Payment not found');
  }

  if (existing.organizationId) {
    await requireOrganizationPermission(ctx, existing.organizationId, 'MANAGE_PAYMENTS', 'delete');
  } else if (currentUser._id !== existing.userId && !currentUser.isStaff && !currentUser.isAdmin) {
    throw new Error('Permission denied');
  }

  await ctx.db.patch(args.paymentId, { isDeleted: true, updatedAt: Date.now() });

  // Update order stats post-deletion
  await ctx.runMutation(internal.payments.mutations.index.updatePaymentStats, {
    orderId: existing.orderId,
  });

  await logAction(
    ctx,
    'delete_payment',
    'DATA_CHANGE',
    'MEDIUM',
    `Deleted payment ${String(args.paymentId)} for order ${existing.orderInfo.orderNumber ?? String(existing.orderId)}`,
    currentUser._id,
    existing.organizationId ?? undefined,
    { paymentId: args.paymentId, orderId: existing.orderId }
  );

  return args.paymentId;
};
