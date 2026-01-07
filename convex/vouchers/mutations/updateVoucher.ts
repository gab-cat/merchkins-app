import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, logAction, requireOrganizationPermission } from '../../helpers';

export const updateVoucherArgs = {
  voucherId: v.id('vouchers'),

  // Voucher details
  name: v.optional(v.string()),
  description: v.optional(v.string()),

  // Discount configuration
  discountType: v.optional(
    v.union(v.literal('PERCENTAGE'), v.literal('FIXED_AMOUNT'), v.literal('FREE_ITEM'), v.literal('FREE_SHIPPING'), v.literal('REFUND'))
  ),
  discountValue: v.optional(v.number()),

  // Constraints
  minOrderAmount: v.optional(v.number()),
  maxDiscountAmount: v.optional(v.number()),
  applicableProductIds: v.optional(v.array(v.id('products'))),
  applicableCategoryIds: v.optional(v.array(v.id('categories'))),

  // Free item configuration (for FREE_ITEM type)
  freeItemProductId: v.optional(v.id('products')),
  freeItemVariantId: v.optional(v.string()),
  freeItemQuantity: v.optional(v.number()),

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
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'FREE_SHIPPING' | 'REFUND';
    discountValue?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    applicableProductIds?: Id<'products'>[];
    applicableCategoryIds?: Id<'categories'>[];
    freeItemProductId?: Id<'products'>;
    freeItemVariantId?: string;
    freeItemQuantity?: number;
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

  // Determine effective discount type (from args or existing voucher)
  const effectiveDiscountType = args.discountType ?? voucher.discountType;

  // Validate discount value if provided
  if (args.discountValue !== undefined) {
    const discountTypeForValidation = effectiveDiscountType;
    if (discountTypeForValidation === 'PERCENTAGE') {
      if (args.discountValue <= 0 || args.discountValue > 100) {
        throw new Error('Percentage discount must be between 1 and 100');
      }
    } else if (discountTypeForValidation === 'FIXED_AMOUNT') {
      if (args.discountValue <= 0) {
        throw new Error('Fixed discount amount must be greater than 0');
      }
    }
  }

  // Validate and handle free-item fields
  // Only allow setting/updating free-item fields when discountType is/will be FREE_ITEM
  const hasFreeItemFields = args.freeItemProductId !== undefined || args.freeItemVariantId !== undefined || args.freeItemQuantity !== undefined;

  if (hasFreeItemFields && effectiveDiscountType !== 'FREE_ITEM') {
    throw new Error('Free-item fields can only be set when discountType is FREE_ITEM');
  }

  let validatedFreeItemProductId: Id<'products'> | undefined;
  let validatedFreeItemVariantId: string | undefined;
  let validatedFreeItemQuantity: number | undefined;

  if (effectiveDiscountType === 'FREE_ITEM') {
    // Validate freeItemProductId if provided
    if (args.freeItemProductId !== undefined) {
      const product = await ctx.db.get(args.freeItemProductId);
      if (!product) {
        throw new Error('Free item product not found');
      }
      if (product.isDeleted) {
        throw new Error('Free item product has been deleted');
      }
      validatedFreeItemProductId = args.freeItemProductId;

      // Validate freeItemVariantId if provided
      if (args.freeItemVariantId !== undefined) {
        const variantExists = product.variants.some((variant) => variant.variantId === args.freeItemVariantId);
        if (!variantExists) {
          throw new Error(`Free item variant "${args.freeItemVariantId}" does not exist on the product`);
        }
        validatedFreeItemVariantId = args.freeItemVariantId;
      }

      // Validate freeItemQuantity if provided
      if (args.freeItemQuantity !== undefined) {
        if (!Number.isInteger(args.freeItemQuantity) || args.freeItemQuantity <= 0) {
          throw new Error('Free item quantity must be a positive integer greater than 0');
        }
        validatedFreeItemQuantity = args.freeItemQuantity;
      }
    } else {
      // If productId is not provided but variant/quantity are, that's invalid
      if (args.freeItemVariantId !== undefined || args.freeItemQuantity !== undefined) {
        throw new Error('freeItemProductId is required when setting freeItemVariantId or freeItemQuantity');
      }
    }
  } else {
    // Clear free-item fields when discountType is not FREE_ITEM
    validatedFreeItemProductId = undefined;
    validatedFreeItemVariantId = undefined;
    validatedFreeItemQuantity = undefined;
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
  if (args.discountType !== undefined) updates.discountType = args.discountType;
  if (args.discountValue !== undefined) updates.discountValue = args.discountValue;
  if (args.minOrderAmount !== undefined) updates.minOrderAmount = args.minOrderAmount;
  if (args.maxDiscountAmount !== undefined) updates.maxDiscountAmount = args.maxDiscountAmount;
  if (args.applicableProductIds !== undefined) updates.applicableProductIds = args.applicableProductIds;
  if (args.applicableCategoryIds !== undefined) updates.applicableCategoryIds = args.applicableCategoryIds;

  // Handle free-item fields based on discountType
  if (effectiveDiscountType === 'FREE_ITEM') {
    // Only update free-item fields if they were provided in args
    if (validatedFreeItemProductId !== undefined) {
      updates.freeItemProductId = validatedFreeItemProductId;
    }
    if (validatedFreeItemVariantId !== undefined) {
      updates.freeItemVariantId = validatedFreeItemVariantId;
    }
    if (validatedFreeItemQuantity !== undefined) {
      updates.freeItemQuantity = validatedFreeItemQuantity;
    }
  } else {
    // Clear free-item fields when discountType is not/won't be FREE_ITEM
    // This prevents invalid state where free-item fields exist for non-FREE_ITEM vouchers
    // Clear them if discountType is being changed or if free-item fields are being set
    if (
      args.discountType !== undefined ||
      hasFreeItemFields ||
      voucher.freeItemProductId !== undefined ||
      voucher.freeItemVariantId !== undefined ||
      voucher.freeItemQuantity !== undefined
    ) {
      // Clear if: discountType is changing, free-item fields are being set, or voucher currently has free-item fields
      updates.freeItemProductId = undefined;
      updates.freeItemVariantId = undefined;
      updates.freeItemQuantity = undefined;
    }
  }

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
