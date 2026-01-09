import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

export const deleteVoucherArgs = {
  voucherId: v.id('vouchers'),
};

export const deleteVoucherHandler = async (
  ctx: MutationCtx,
  args: {
    voucherId: Id<'vouchers'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Get existing voucher
  const voucher = await ctx.db.get(args.voucherId);
  if (!voucher || voucher.isDeleted) {
    throw new Error('Voucher not found');
  }

  // Validate permissions - use MANAGE_VOUCHERS for voucher-specific operations
  if (voucher.organizationId) {
    await requireOrganizationPermission(ctx, voucher.organizationId, PERMISSION_CODES.MANAGE_VOUCHERS, 'delete');
  } else {
    if (!currentUser.isAdmin) {
      throw new Error('Only admins can delete global vouchers');
    }
  }

  const now = Date.now();

  // Soft delete
  await ctx.db.patch(args.voucherId, {
    isDeleted: true,
    isActive: false,
    updatedAt: now,
  });

  // Log action
  await logAction(
    ctx,
    'delete_voucher',
    'DATA_CHANGE',
    'HIGH',
    `Deleted voucher "${voucher.name}" (${voucher.code})`,
    currentUser._id,
    voucher.organizationId,
    {
      voucherId: args.voucherId,
      code: voucher.code,
    }
  );

  return { success: true };
};
