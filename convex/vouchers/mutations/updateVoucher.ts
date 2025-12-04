import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';

export const updateVoucherArgs = {
  voucherId: v.id('vouchers'),
  
  // Voucher details
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  
  // Discount configuration (can't change type, only value and constraints)
  discountValue: v.optional(v.number()),
  
  // Constraints
  minOrderAmount: v.optional(v.number()),
  maxDiscountAmount: v.optional(v.number()),
  applicableProductIds: v.optional(v.array(v.id('products'))),
  applicableCategoryIds: v.optional(v.array(v.id('categories'))),
  
  // Usage limits
  usageLimit: v.optional(v.number()),
  usageLimitPerUser: v.optional(v.number()),
  
  // Validity
  validFrom: v.optional(v.number()),
  validUntil: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const updateVoucherHandler = async (
  ctx: MutationCtx,
  args: {
    voucherId: Id<'vouchers'>;
    name?: string;
    description?: string;
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    applicableProductIds?: Id<'products'>[];
    applicableCategoryIds?: Id<'categories'>[];
    usageLimit?: number;
    usageLimitPerUser?: number;
    validFrom?: number;
    validUntil?: number;
    isActive?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Get existing voucher
  const voucher = await ctx.db.get(args.voucherId);
  if (!voucher || voucher.isDeleted) {
    throw new Error('Voucher not found');
  }

  // Validate permissions
  if (voucher.organizationId) {
    await requireOrganizationPermission(ctx, voucher.organizationId, 'MANAGE_PRODUCTS', 'update');
  } else {
    if (!currentUser.isAdmin) {
      throw new Error('Only admins can update global vouchers');
    }
  }

  // Validate discount value if provided
  if (args.discountValue !== undefined) {
    if (voucher.discountType === 'PERCENTAGE') {
      if (args.discountValue <= 0 || args.discountValue > 100) {
        throw new Error('Percentage discount must be between 1 and 100');
      }
    } else if (voucher.discountType === 'FIXED_AMOUNT') {
      if (args.discountValue <= 0) {
        throw new Error('Fixed discount amount must be greater than 0');
      }
    }
  }

  // Validate dates
  const validFrom = args.validFrom ?? voucher.validFrom;
  const validUntil = args.validUntil ?? voucher.validUntil;
  if (validUntil && validUntil <= validFrom) {
    throw new Error('Validity end date must be after start date');
  }

  // Validate usage limits
  if (args.usageLimit !== undefined && args.usageLimit < voucher.usedCount) {
    throw new Error(`Usage limit cannot be less than current usage count (${voucher.usedCount})`);
  }

  const now = Date.now();

  // Build update object
  const updates: Partial<typeof voucher> = {
    updatedAt: now,
  };

  if (args.name !== undefined) updates.name = args.name;
  if (args.description !== undefined) updates.description = args.description;
  if (args.discountValue !== undefined) updates.discountValue = args.discountValue;
  if (args.minOrderAmount !== undefined) updates.minOrderAmount = args.minOrderAmount;
  if (args.maxDiscountAmount !== undefined) updates.maxDiscountAmount = args.maxDiscountAmount;
  if (args.applicableProductIds !== undefined) updates.applicableProductIds = args.applicableProductIds;
  if (args.applicableCategoryIds !== undefined) updates.applicableCategoryIds = args.applicableCategoryIds;
  if (args.usageLimit !== undefined) updates.usageLimit = args.usageLimit;
  if (args.usageLimitPerUser !== undefined) updates.usageLimitPerUser = args.usageLimitPerUser;
  if (args.validFrom !== undefined) updates.validFrom = args.validFrom;
  if (args.validUntil !== undefined) updates.validUntil = args.validUntil;
  if (args.isActive !== undefined) updates.isActive = args.isActive;

  await ctx.db.patch(args.voucherId, updates);

  // Log action
  await logAction(
    ctx,
    'update_voucher',
    'DATA_CHANGE',
    'MEDIUM',
    `Updated voucher "${voucher.name}" (${voucher.code})`,
    currentUser._id,
    voucher.organizationId,
    {
      voucherId: args.voucherId,
      code: voucher.code,
      changes: Object.keys(updates).filter((k) => k !== 'updatedAt'),
    }
  );

  return { success: true };
};
