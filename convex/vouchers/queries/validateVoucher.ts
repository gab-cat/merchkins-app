import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const validateVoucherArgs = {
  code: v.string(),
  userId: v.optional(v.id('users')),
  organizationId: v.optional(v.id('organizations')),
  orderAmount: v.number(),
  productIds: v.optional(v.array(v.id('products'))),
  categoryIds: v.optional(v.array(v.id('categories'))),
};

type ValidationResult = {
  valid: boolean;
  voucher?: {
    _id: Id<'vouchers'>;
    code: string;
    name: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'FREE_SHIPPING';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
  };
  discountAmount?: number;
  error?: string;
  errorCode?: 
    | 'NOT_FOUND'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'NOT_STARTED'
    | 'USAGE_LIMIT_REACHED'
    | 'USER_USAGE_LIMIT_REACHED'
    | 'MIN_ORDER_NOT_MET'
    | 'PRODUCTS_NOT_APPLICABLE'
    | 'ORGANIZATION_MISMATCH';
};

export const validateVoucherHandler = async (
  ctx: QueryCtx,
  args: {
    code: string;
    userId?: Id<'users'>;
    organizationId?: Id<'organizations'>;
    orderAmount: number;
    productIds?: Id<'products'>[];
    categoryIds?: Id<'categories'>[];
  }
): Promise<ValidationResult> => {
  const now = Date.now();
  
  // Normalize code
  const normalizedCode = args.code.toUpperCase().trim();
  
  // Find voucher by code
  const voucher = await ctx.db
    .query('vouchers')
    .withIndex('by_code', (q) => q.eq('code', normalizedCode))
    .first();
  
  if (!voucher || voucher.isDeleted) {
    return {
      valid: false,
      error: 'Voucher code not found',
      errorCode: 'NOT_FOUND',
    };
  }

  // Check if voucher is active
  if (!voucher.isActive) {
    return {
      valid: false,
      error: 'This voucher is no longer active',
      errorCode: 'INACTIVE',
    };
  }

  // Check if voucher has started
  if (voucher.validFrom > now) {
    const startDate = new Date(voucher.validFrom).toLocaleDateString();
    return {
      valid: false,
      error: `This voucher is not valid yet. It starts on ${startDate}`,
      errorCode: 'NOT_STARTED',
    };
  }

  // Check if voucher has expired
  if (voucher.validUntil && voucher.validUntil < now) {
    return {
      valid: false,
      error: 'This voucher has expired',
      errorCode: 'EXPIRED',
    };
  }

  // Check overall usage limit
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    return {
      valid: false,
      error: 'This voucher has reached its usage limit',
      errorCode: 'USAGE_LIMIT_REACHED',
    };
  }

  // Check per-user usage limit
  if (args.userId && voucher.usageLimitPerUser) {
    const userUsages = await ctx.db
      .query('voucherUsages')
      .withIndex('by_voucher_user', (q) => 
        q.eq('voucherId', voucher._id).eq('userId', args.userId!)
      )
      .collect();
    
    if (userUsages.length >= voucher.usageLimitPerUser) {
      return {
        valid: false,
        error: `You've already used this voucher${voucher.usageLimitPerUser === 1 ? '' : ` ${voucher.usageLimitPerUser} times`}`,
        errorCode: 'USER_USAGE_LIMIT_REACHED',
      };
    }
  }

  // Check organization scope
  if (voucher.organizationId) {
    if (!args.organizationId || args.organizationId !== voucher.organizationId) {
      return {
        valid: false,
        error: 'This voucher is only valid for a specific store',
        errorCode: 'ORGANIZATION_MISMATCH',
      };
    }
  }

  // Check minimum order amount
  if (voucher.minOrderAmount && args.orderAmount < voucher.minOrderAmount) {
    const minAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(voucher.minOrderAmount);
    return {
      valid: false,
      error: `Minimum order of ${minAmount} required to use this voucher`,
      errorCode: 'MIN_ORDER_NOT_MET',
    };
  }

  // Check applicable products
  if (voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
    if (!args.productIds || args.productIds.length === 0) {
      return {
        valid: false,
        error: 'This voucher is only valid for specific products',
        errorCode: 'PRODUCTS_NOT_APPLICABLE',
      };
    }
    
    const hasApplicableProduct = args.productIds.some((pid) =>
      voucher.applicableProductIds!.includes(pid)
    );
    
    if (!hasApplicableProduct) {
      return {
        valid: false,
        error: 'This voucher is only valid for specific products not in your order',
        errorCode: 'PRODUCTS_NOT_APPLICABLE',
      };
    }
  }

  // Check applicable categories
  if (voucher.applicableCategoryIds && voucher.applicableCategoryIds.length > 0) {
    if (!args.categoryIds || args.categoryIds.length === 0) {
      return {
        valid: false,
        error: 'This voucher is only valid for specific categories',
        errorCode: 'PRODUCTS_NOT_APPLICABLE',
      };
    }
    
    const hasApplicableCategory = args.categoryIds.some((cid) =>
      voucher.applicableCategoryIds!.includes(cid)
    );
    
    if (!hasApplicableCategory) {
      return {
        valid: false,
        error: 'This voucher is only valid for specific categories not in your order',
        errorCode: 'PRODUCTS_NOT_APPLICABLE',
      };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  
  switch (voucher.discountType) {
    case 'PERCENTAGE':
      discountAmount = (args.orderAmount * voucher.discountValue) / 100;
      // Apply max discount cap if set
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
      break;
    
    case 'FIXED_AMOUNT':
      discountAmount = Math.min(voucher.discountValue, args.orderAmount);
      break;
    
    case 'FREE_SHIPPING':
      // Free shipping - set a fixed value or handle separately
      discountAmount = 0; // Shipping handling would be separate
      break;
    
    case 'FREE_ITEM':
      // Free item discount is the value of the item (handled during order creation)
      discountAmount = voucher.discountValue; // This should be the item price
      break;
  }

  return {
    valid: true,
    voucher: {
      _id: voucher._id,
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderAmount: voucher.minOrderAmount,
      maxDiscountAmount: voucher.maxDiscountAmount,
    },
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
  };
};
