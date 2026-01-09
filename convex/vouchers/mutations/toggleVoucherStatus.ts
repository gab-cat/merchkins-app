import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

export const toggleVoucherStatusArgs = {
  voucherId: v.id('vouchers'),
  isActive: v.boolean(),
};

export const toggleVoucherStatusHandler = async (
  ctx: MutationCtx,
  args: {
    voucherId: Id<'vouchers'>;
    isActive: boolean;
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
    await requireOrganizationPermission(ctx, voucher.organizationId, PERMISSION_CODES.MANAGE_VOUCHERS, 'update');
  } else {
    if (!currentUser.isAdmin) {
      throw new Error('Only admins can update global vouchers');
    }
  }

  const now = Date.now();

  await ctx.db.patch(args.voucherId, {
    isActive: args.isActive,
    updatedAt: now,
  });

  // Log action
  await logAction(
    ctx,
    args.isActive ? 'activate_voucher' : 'deactivate_voucher',
    'DATA_CHANGE',
    'LOW',
    `${args.isActive ? 'Activated' : 'Deactivated'} voucher "${voucher.name}" (${voucher.code})`,
    currentUser._id,
    voucher.organizationId,
    {
      voucherId: args.voucherId,
      code: voucher.code,
      isActive: args.isActive,
    }
  );

  return { success: true };
};
