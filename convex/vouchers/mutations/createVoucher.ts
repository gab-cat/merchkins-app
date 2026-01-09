import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrganizationExists, logAction, requireOrganizationPermission, PERMISSION_CODES } from '../../helpers';

/**
 * Generates a voucher code with prefix + random suffix
 * Format: PREFIX-XXXXXX (e.g., SAVE20-A1B2C3)
 */
function generateVoucherCode(prefix?: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  if (prefix) {
    // Clean prefix: uppercase, remove special chars, max 10 chars
    const cleanPrefix = prefix
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
    return `${cleanPrefix}-${randomPart}`;
  }
  return `VOUCHER-${randomPart}`;
}

export const createVoucherArgs = {
  organizationId: v.optional(v.id('organizations')),

  // Code options
  code: v.optional(v.string()), // Manual code entry
  codePrefix: v.optional(v.string()), // For auto-generation with prefix

  // Voucher details
  name: v.string(),
  description: v.optional(v.string()),

  // Discount configuration
  discountType: v.union(v.literal('PERCENTAGE'), v.literal('FIXED_AMOUNT'), v.literal('FREE_ITEM'), v.literal('FREE_SHIPPING')),
  discountValue: v.number(),

  // For FREE_ITEM type
  freeItemProductId: v.optional(v.id('products')),
  freeItemVariantId: v.optional(v.string()),
  freeItemQuantity: v.optional(v.number()),

  // Constraints
  minOrderAmount: v.optional(v.number()),
  maxDiscountAmount: v.optional(v.number()),
  applicableProductIds: v.optional(v.array(v.id('products'))),
  applicableCategoryIds: v.optional(v.array(v.id('categories'))),

  // Usage limits
  usageLimit: v.optional(v.number()),
  usageLimitPerUser: v.optional(v.number()),

  // Validity
  validFrom: v.number(),
  validUntil: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const createVoucherHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    code?: string;
    codePrefix?: string;
    name: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'FREE_SHIPPING';
    discountValue: number;
    freeItemProductId?: Id<'products'>;
    freeItemVariantId?: string;
    freeItemQuantity?: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    applicableProductIds?: Id<'products'>[];
    applicableCategoryIds?: Id<'categories'>[];
    usageLimit?: number;
    usageLimitPerUser?: number;
    validFrom: number;
    validUntil?: number;
    isActive?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Validate permissions - use MANAGE_VOUCHERS for voucher-specific operations
  if (args.organizationId) {
    await validateOrganizationExists(ctx, args.organizationId);
    await requireOrganizationPermission(ctx, args.organizationId, PERMISSION_CODES.MANAGE_VOUCHERS, 'create');
  } else {
    // Global vouchers require admin
    if (!currentUser.isAdmin) {
      throw new Error('Only admins can create global vouchers');
    }
  }

  // Validate discount value
  if (args.discountType === 'PERCENTAGE') {
    if (args.discountValue <= 0 || args.discountValue > 100) {
      throw new Error('Percentage discount must be between 1 and 100');
    }
  } else if (args.discountType === 'FIXED_AMOUNT') {
    if (args.discountValue <= 0) {
      throw new Error('Fixed discount amount must be greater than 0');
    }
  } else if (args.discountType === 'FREE_ITEM') {
    if (!args.freeItemProductId) {
      throw new Error('Free item voucher requires a product to be specified');
    }
    // Validate product exists
    const product = await ctx.db.get(args.freeItemProductId);
    if (!product || product.isDeleted) {
      throw new Error('Free item product not found');
    }
  }

  // Validate dates
  if (args.validUntil && args.validUntil <= args.validFrom) {
    throw new Error('Validity end date must be after start date');
  }

  // Generate or validate code
  let voucherCode: string;
  if (args.code) {
    // Manual code - clean and validate
    voucherCode = args.code.toUpperCase().trim();
    if (voucherCode.length < 3 || voucherCode.length > 30) {
      throw new Error('Voucher code must be between 3 and 30 characters');
    }
    if (!/^[A-Z0-9-_]+$/.test(voucherCode)) {
      throw new Error('Voucher code can only contain letters, numbers, hyphens, and underscores');
    }
  } else {
    // Auto-generate with optional prefix
    voucherCode = generateVoucherCode(args.codePrefix);
  }

  // Check code uniqueness
  const existingVoucher = await ctx.db
    .query('vouchers')
    .withIndex('by_code', (q) => q.eq('code', voucherCode))
    .first();

  if (existingVoucher) {
    throw new Error(`Voucher code "${voucherCode}" is already in use`);
  }

  // Get organization info if scoped
  let organizationInfo: { name: string; slug: string; logo?: string } | undefined;
  if (args.organizationId) {
    const org = await ctx.db.get(args.organizationId);
    if (org) {
      organizationInfo = {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
      };
    }
  }

  const now = Date.now();

  const voucherId = await ctx.db.insert('vouchers', {
    isDeleted: false,
    organizationId: args.organizationId,
    code: voucherCode,
    name: args.name,
    description: args.description,
    discountType: args.discountType,
    discountValue: args.discountValue,
    minOrderAmount: args.minOrderAmount,
    maxDiscountAmount: args.maxDiscountAmount,
    applicableProductIds: args.applicableProductIds,
    applicableCategoryIds: args.applicableCategoryIds,
    freeItemProductId: args.freeItemProductId,
    freeItemVariantId: args.freeItemVariantId,
    freeItemQuantity: args.freeItemQuantity,
    usageLimit: args.usageLimit,
    usageLimitPerUser: args.usageLimitPerUser ?? 1, // Default: once per user
    usedCount: 0,
    validFrom: args.validFrom,
    validUntil: args.validUntil,
    isActive: args.isActive ?? true,
    createdById: currentUser._id,
    creatorInfo: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
    },
    organizationInfo,
    createdAt: now,
    updatedAt: now,
  });

  // Log action
  await logAction(
    ctx,
    'create_voucher',
    'DATA_CHANGE',
    'MEDIUM',
    `Created voucher "${args.name}" with code ${voucherCode}`,
    currentUser._id,
    args.organizationId,
    {
      voucherId,
      code: voucherCode,
      discountType: args.discountType,
      discountValue: args.discountValue,
    }
  );

  return {
    voucherId,
    code: voucherCode,
  };
};
