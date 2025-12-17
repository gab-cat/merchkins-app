import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Doc, Id } from '../../_generated/dataModel';
import {
  requireAuthentication,
  validateUserExists,
  validateOrganizationExists,
  validateProductExists,
  validateArrayNotEmpty,
  validatePositiveNumber,
  logAction,
  requireOrganizationPermission,
} from '../../helpers';
import { internal } from '../../_generated/api';
import { createSystemOrderLog } from './createOrderLog';

type OrderItemInput = {
  productId: Id<'products'>;
  variantId?: string;
  size?: {
    id: string;
    label: string;
  };
  quantity: number;
  price?: number; // Optional override for staff/admin custom pricing
  customerNote?: string;
};

export const createOrderArgs = {
  organizationId: v.optional(v.id('organizations')),
  customerId: v.id('users'),
  processedById: v.optional(v.id('users')),
  items: v.array(
    v.object({
      productId: v.id('products'),
      variantId: v.optional(v.string()),
      size: v.optional(
        v.object({
          id: v.string(),
          label: v.string(),
        })
      ),
      quantity: v.number(),
      price: v.optional(v.number()),
      customerNote: v.optional(v.string()),
    })
  ),
  paymentPreference: v.optional(v.union(v.literal('FULL'), v.literal('DOWNPAYMENT'))),
  estimatedDelivery: v.optional(v.number()),
  customerNotes: v.optional(v.string()),
  // Voucher support
  voucherCode: v.optional(v.string()),
  voucherProportionalShare: v.optional(v.number()),
  // Checkout session for grouped payments
  checkoutId: v.optional(v.string()),
};

function generateOrderNumber(now: number): string {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${y}${m}${day}-${rand}`;
}

export const createOrderHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    customerId: Id<'users'>;
    processedById?: Id<'users'>;
    items: Array<OrderItemInput>;
    paymentPreference?: 'FULL' | 'DOWNPAYMENT';
    estimatedDelivery?: number;
    customerNotes?: string;
    voucherCode?: string;
    voucherProportionalShare?: number;
    checkoutId?: string;
  }
) => {
  const currentUser = await requireAuthentication(ctx);

  // Basic validation
  validateArrayNotEmpty(args.items, 'Order items');
  for (const item of args.items) {
    validatePositiveNumber(item.quantity, 'Item quantity');
    if (item.price !== undefined) {
      validatePositiveNumber(item.price, 'Item price');
    }
  }

  // Validate customer
  const customer = await validateUserExists(ctx, args.customerId);

  // Permission checks
  let organizationInfo: { name: string; slug: string; logo?: string } | undefined;
  if (args.organizationId) {
    const organization = await validateOrganizationExists(ctx, args.organizationId);
    // Enforce organization visibility for purchase
    if (organization.organizationType !== 'PUBLIC') {
      const isPrivileged = currentUser.isAdmin || currentUser.isStaff;
      if (!isPrivileged) {
        // Customer must be a member to order within private/secret org scope
        const membership = await ctx.db
          .query('organizationMembers')
          .withIndex('by_user_organization', (q) => q.eq('userId', customer._id).eq('organizationId', args.organizationId!))
          .filter((q) => q.eq(q.field('isActive'), true))
          .first();
        if (!membership) {
          if (organization.organizationType === 'PRIVATE') {
            throw new Error('Membership required to place orders in this private organization.');
          }
          throw new Error('This organization is invite-only. You must join via invite to place orders.');
        }
      }
    }
    organizationInfo = {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    };
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ORDERS', 'create');
  } else {
    // If no organization scope, allow placing orders for self; staff/admin can place for others
    if (currentUser._id !== args.customerId && !currentUser.isStaff && !currentUser.isAdmin) {
      throw new Error('You can only create orders for yourself');
    }
  }

  // If processedById provided, ensure it's a valid user
  let processorInfo: { firstName?: string; lastName?: string; email: string; imageUrl?: string } | undefined;
  if (args.processedById) {
    const processor = await validateUserExists(ctx, args.processedById);
    processorInfo = {
      firstName: processor.firstName,
      lastName: processor.lastName,
      email: processor.email,
      imageUrl: processor.imageUrl,
    };
  } else if (currentUser.isStaff || currentUser.isAdmin) {
    processorInfo = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      imageUrl: currentUser.imageUrl,
    };
  }

  // Build item snapshots and validate inventory
  type PreparedItem = {
    variantId?: string;
    size?: { id: string; label: string };
    productId: Id<'products'>;
    quantity: number;
    price: number;
    originalPrice: number;
    appliedRole: string;
    customerNote?: string;
    productSnapshot: {
      title: string;
      slug: string;
      imageUrl: string[];
      variantName?: string;
      categoryName?: string;
      organizationId?: Id<'organizations'>;
    };
  };

  const preparedItems: Array<PreparedItem> = [];
  // Track per-product/variant/size totals for inventory updates and stats
  const productIdToQty: Map<string, number> = new Map();
  const productIdToVariantQty: Map<string, Map<string, number>> = new Map();
  // Track size-level quantities: productId -> variantId -> sizeId -> quantity
  const productIdToVariantSizeQty: Map<string, Map<string, Map<string, number>>> = new Map();

  for (const item of args.items) {
    const product = await validateProductExists(ctx, item.productId);

    // If organization-scoped, ensure product belongs to same organization (or product is global)
    if (args.organizationId && product.organizationId && product.organizationId !== args.organizationId) {
      throw new Error('All items must belong to the same organization as the order');
    }

    // If not organization-scoped (global order), enforce org visibility per product
    if (!args.organizationId && product.organizationId) {
      const org = await ctx.db.get(product.organizationId);
      if (org && !org.isDeleted && org.organizationType !== 'PUBLIC') {
        const isPrivileged = currentUser.isAdmin || currentUser.isStaff;
        if (!isPrivileged) {
          const membership = await ctx.db
            .query('organizationMembers')
            .withIndex('by_user_organization', (q) => q.eq('userId', customer._id).eq('organizationId', product.organizationId!))
            .filter((q) => q.eq(q.field('isActive'), true))
            .first();
          if (!membership) {
            if (org.organizationType === 'PRIVATE') {
              throw new Error('Membership required to buy from this private organization.');
            }
            throw new Error('This organization is invite-only. You must join via invite to buy.');
          }
        }
      }
    }

    let basePrice = product.minPrice ?? product.maxPrice ?? product.supposedPrice ?? 0;
    let variantName: string | undefined = undefined;
    let availableInventory = product.inventory;

    if (item.variantId) {
      const variant = product.variants.find((vx) => vx.variantId === item.variantId);
      if (!variant) {
        throw new Error('Variant not found for product');
      }
      if (!variant.isActive) {
        throw new Error('Variant is not available');
      }
      basePrice = variant.price;
      variantName = variant.variantName;
      availableInventory = variant.inventory;

      // Check size-level inventory if a size is selected
      if (item.size && variant.sizes && variant.sizes.length > 0) {
        const selectedSize = variant.sizes.find((s) => s.id === item.size!.id);
        if (!selectedSize) {
          throw new Error('Selected size not found for this variant');
        }
        // Use size inventory if available, otherwise fall back to variant inventory
        if (selectedSize.inventory !== undefined) {
          availableInventory = selectedSize.inventory;
        }
        // Use size price if available
        if (selectedSize.price !== undefined) {
          basePrice = selectedSize.price;
        }
      }
    }

    // Enforce inventory for STOCK items
    if (product.inventoryType === 'STOCK') {
      if (availableInventory < item.quantity) {
        throw new Error('Insufficient inventory for one or more items');
      }
    }

    const allowOverride = currentUser.isStaff || currentUser.isAdmin;
    const priceToCharge = item.price !== undefined && allowOverride ? item.price : basePrice;
    const appliedRole = priceToCharge !== basePrice ? 'STAFF_OVERRIDE' : 'STANDARD';

    preparedItems.push({
      variantId: item.variantId,
      size: item.size,
      productId: product._id,
      quantity: item.quantity,
      price: priceToCharge,
      originalPrice: basePrice,
      appliedRole,
      customerNote: item.customerNote,
      productSnapshot: {
        title: product.title,
        slug: product.slug,
        imageUrl: product.imageUrl,
        variantName,
        categoryName: product.categoryInfo?.name,
        organizationId: product.organizationId,
      },
    });

    // Accumulate for stats/inventory
    productIdToQty.set(String(product._id), (productIdToQty.get(String(product._id)) || 0) + item.quantity);
    if (item.variantId) {
      if (!productIdToVariantQty.has(String(product._id))) {
        productIdToVariantQty.set(String(product._id), new Map());
      }
      const vmap = productIdToVariantQty.get(String(product._id))!;
      vmap.set(item.variantId, (vmap.get(item.variantId) || 0) + item.quantity);

      // Track size-level quantities if a size is selected
      if (item.size) {
        if (!productIdToVariantSizeQty.has(String(product._id))) {
          productIdToVariantSizeQty.set(String(product._id), new Map());
        }
        const vsmap = productIdToVariantSizeQty.get(String(product._id))!;
        if (!vsmap.has(item.variantId)) {
          vsmap.set(item.variantId, new Map());
        }
        const smap = vsmap.get(item.variantId)!;
        smap.set(item.size.id, (smap.get(item.size.id) || 0) + item.quantity);
      }
    }
  }

  // Compute totals
  let totalAmount = 0;
  let discountAmount = 0;
  for (const it of preparedItems) {
    totalAmount += it.price * it.quantity;
    discountAmount += Math.max(0, it.originalPrice - it.price) * it.quantity;
  }

  // Voucher validation and processing
  let voucherId: Id<'vouchers'> | undefined;
  let voucherCode: string | undefined;
  let voucherDiscount = 0;
  let voucherSnapshot: { code: string; name: string; discountType: string; discountValue: number } | undefined;

  if (args.voucherCode) {
    const normalizedCode = args.voucherCode.toUpperCase().trim();

    // Find voucher
    const voucher = await ctx.db
      .query('vouchers')
      .withIndex('by_code', (q) => q.eq('code', normalizedCode))
      .first();

    if (!voucher || voucher.isDeleted) {
      throw new Error('Invalid voucher code');
    }

    // Validate voucher is active
    if (!voucher.isActive) {
      throw new Error('This voucher is no longer active');
    }

    const now = Date.now();

    // Check validity period
    if (voucher.validFrom > now) {
      throw new Error('This voucher is not valid yet');
    }
    if (voucher.validUntil && voucher.validUntil < now) {
      throw new Error('This voucher has expired');
    }

    // Check overall usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new Error('This voucher has reached its usage limit');
    }

    // Check per-user usage limit
    if (voucher.usageLimitPerUser) {
      const userUsages = await ctx.db
        .query('voucherUsages')
        .withIndex('by_voucher_user', (q) => q.eq('voucherId', voucher._id).eq('userId', args.customerId))
        .collect();

      if (userUsages.length >= voucher.usageLimitPerUser) {
        throw new Error('You have already used this voucher the maximum number of times');
      }
    }

    // Special handling for REFUND vouchers
    if (voucher.discountType === 'REFUND') {
      // REFUND vouchers are personal - must be assigned to the user
      if (voucher.assignedToUserId && voucher.assignedToUserId !== args.customerId) {
        throw new Error('This voucher is not assigned to you');
      }
      // REFUND vouchers are platform-wide (no organization restriction)
      // Skip organization check for REFUND type
    } else {
      // Check organization scope for non-REFUND vouchers
      if (voucher.organizationId && voucher.organizationId !== args.organizationId) {
        throw new Error('This voucher is only valid for a specific store');
      }
    }

    // Check minimum order amount (before voucher discount)
    if (voucher.minOrderAmount && totalAmount < voucher.minOrderAmount) {
      throw new Error(`Minimum order of ₱${voucher.minOrderAmount.toFixed(2)} required`);
    }

    // Check applicable products
    if (voucher.applicableProductIds && voucher.applicableProductIds.length > 0) {
      const orderProductIds = preparedItems.map((it) => it.productId);
      const hasApplicable = orderProductIds.some((pid) => voucher.applicableProductIds!.some((apid) => String(apid) === String(pid)));
      if (!hasApplicable) {
        throw new Error('This voucher is not valid for the products in your order');
      }
    }

    // Calculate voucher discount
    // Calculate voucher discount
    if (args.voucherProportionalShare !== undefined) {
      // Use pre-calculated proportional share
      // Ensure we don't exceed the total amount of this order
      voucherDiscount = Math.min(args.voucherProportionalShare, totalAmount);
    } else {
      // Standard calculation (single order or legacy)
      switch (voucher.discountType) {
        case 'PERCENTAGE':
          voucherDiscount = (totalAmount * voucher.discountValue) / 100;
          if (voucher.maxDiscountAmount && voucherDiscount > voucher.maxDiscountAmount) {
            voucherDiscount = voucher.maxDiscountAmount;
          }
          break;
        case 'FIXED_AMOUNT':
        case 'REFUND':
          // REFUND vouchers work like FIXED_AMOUNT
          voucherDiscount = Math.min(voucher.discountValue, totalAmount);
          break;
        case 'FREE_SHIPPING':
          // Free shipping handled separately if applicable
          voucherDiscount = 0;
          break;
        case 'FREE_ITEM':
          // For free item, the discount value represents the item value
          voucherDiscount = Math.min(voucher.discountValue, totalAmount);
          break;
      }
    }

    voucherDiscount = Math.round(voucherDiscount * 100) / 100;
    voucherId = voucher._id;
    voucherCode = voucher.code;
    voucherSnapshot = {
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
    };

    // Apply voucher discount to total
    totalAmount = Math.max(0, totalAmount - voucherDiscount);
    discountAmount += voucherDiscount;
  }

  const now = Date.now();
  const orderNumber = generateOrderNumber(now);

  // Determine payment status: if total is 0 and voucher was applied, mark as PAID
  const paymentStatusToUse = totalAmount === 0 && voucherDiscount > 0 ? 'PAID' : 'PENDING';
  const orderStatusToUse = totalAmount === 0 && voucherDiscount > 0 ? 'PROCESSING' : 'PENDING';
  // Set paidAt if order is paid via voucher
  const paidAtToUse = paymentStatusToUse === 'PAID' ? now : undefined;

  // Prepare order document
  const orderDoc: Omit<Doc<'orders'>, '_id' | '_creationTime'> = {
    isDeleted: false,
    organizationId: args.organizationId,
    customerId: customer._id,
    processedById: args.processedById ?? (currentUser.isStaff || currentUser.isAdmin ? currentUser._id : undefined),
    customerInfo: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      imageUrl: customer.imageUrl,
    },
    processorInfo,
    organizationInfo,
    orderDate: now,
    status: orderStatusToUse,
    paymentStatus: paymentStatusToUse,
    cancellationReason: undefined,
    embeddedItems:
      preparedItems.length <= 20
        ? preparedItems.map((it) => ({
            variantId: it.variantId,
            size: it.size,
            productInfo: {
              productId: it.productId,
              title: it.productSnapshot.title,
              slug: it.productSnapshot.slug,
              imageUrl: it.productSnapshot.imageUrl,
              variantName: it.productSnapshot.variantName,
              categoryName: it.productSnapshot.categoryName,
            },
            quantity: it.quantity,
            price: it.price,
            originalPrice: it.originalPrice,
            appliedRole: it.appliedRole,
            customerNote: it.customerNote,
          }))
        : undefined,
    totalAmount,
    discountAmount,
    itemCount: preparedItems.reduce((sum, it) => sum + it.quantity, 0),
    uniqueProductCount: new Set(preparedItems.map((it) => String(it.productId))).size,
    // Voucher information
    voucherId,
    voucherCode,
    voucherDiscount: voucherDiscount > 0 ? voucherDiscount : undefined,
    voucherSnapshot,
    estimatedDelivery: args.estimatedDelivery,
    customerSatisfactionSurveyId: undefined,
    customerNotes: args.customerNotes,
    paymentPreference: args.paymentPreference,
    checkoutId: args.checkoutId,
    recentStatusHistory: [
      {
        status: 'PENDING',
        changedBy: currentUser._id,
        changedByName: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email,
        reason: 'Order created',
        changedAt: now,
      },
    ],
    paidAt: paidAtToUse, // Set payment timestamp if paid via voucher
    createdAt: now,
    updatedAt: now,
    orderNumber,
  };

  // Insert order
  const orderId = await ctx.db.insert('orders', orderDoc);

  // Record voucher usage if voucher was applied
  if (voucherId && voucherSnapshot) {
    // Create voucher usage record
    await ctx.db.insert('voucherUsages', {
      voucherId,
      orderId,
      userId: customer._id,
      organizationId: args.organizationId,
      voucherSnapshot,
      discountAmount: voucherDiscount,
      userInfo: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      createdAt: now,
    });

    // Increment voucher usage count
    const currentVoucher = await ctx.db.get(voucherId);
    if (currentVoucher) {
      await ctx.db.patch(voucherId, {
        usedCount: currentVoucher.usedCount + 1,
        updatedAt: now,
      });

      // Track redemption cost for REFUND vouchers (platform absorbs cost)
      if (currentVoucher.discountType === 'REFUND' && args.organizationId && organizationInfo) {
        await ctx.db.insert('voucherRedemptionCosts', {
          isDeleted: false,
          voucherId,
          orderId,
          sellerOrganizationId: args.organizationId,
          amountCovered: voucherDiscount,
          voucherInfo: {
            code: currentVoucher.code,
            discountType: currentVoucher.discountType,
            discountValue: currentVoucher.discountValue,
            sourceRefundRequestId: currentVoucher.sourceRefundRequestId ? String(currentVoucher.sourceRefundRequestId) : undefined,
          },
          orderInfo: {
            orderNumber,
            totalAmount,
            orderDate: now,
          },
          sellerOrgInfo: {
            name: organizationInfo.name,
            slug: organizationInfo.slug,
          },
          createdAt: now,
        });
      }
    }
  }

  // For large orders, insert separate order items
  if (!orderDoc.embeddedItems) {
    for (const it of preparedItems) {
      await ctx.db.insert('orderItems', {
        orderId,
        variantId: it.variantId,
        productInfo: {
          productId: it.productId,
          title: it.productSnapshot.title,
          slug: it.productSnapshot.slug,
          imageUrl: it.productSnapshot.imageUrl,
          variantName: it.productSnapshot.variantName,
          categoryName: it.productSnapshot.categoryName,
        },
        quantity: it.quantity,
        price: it.price,
        originalPrice: it.originalPrice,
        appliedRole: 'STANDARD',
        customerNote: it.customerNote,
        size: it.size?.label, // Store size label for orderItems table
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Update product stats and inventory, and category/org/user stats
  // - Increment product totalOrders once per product present in order
  // - Increment variant orderCount by quantity
  // - Decrement inventory for STOCK items (including size-level inventory)
  for (const [productIdStr, totalQty] of productIdToQty.entries()) {
    const productId = productIdStr as unknown as Id<'products'>;
    const product = await ctx.db.get(productId);
    if (!product) continue;

    const variantMap = productIdToVariantQty.get(productIdStr);
    const sizeMap = productIdToVariantSizeQty.get(productIdStr);
    const variantUpdates: Array<{ variantId: string; incrementOrders?: number; newInventory?: number }> = [];

    // Build updated variants array with size inventory deductions
    let updatedVariants = product.variants;

    if (variantMap && product.inventoryType === 'STOCK') {
      updatedVariants = product.variants.map((v) => {
        const variantQty = variantMap.get(v.variantId);
        if (!variantQty) return v;

        // Check if there are size-level quantities for this variant
        const variantSizeMap = sizeMap?.get(v.variantId);

        let updatedSizes = v.sizes;
        if (variantSizeMap && v.sizes) {
          // Deduct from size inventories
          updatedSizes = v.sizes.map((s) => {
            const sizeQty = variantSizeMap.get(s.id);
            if (!sizeQty || s.inventory === undefined) return s;
            return {
              ...s,
              inventory: Math.max(0, s.inventory - sizeQty),
            };
          });
        }

        // Calculate variant inventory deduction
        // Only deduct from variant inventory if size doesn't have its own inventory
        let variantInventoryDeduction = 0;
        if (variantSizeMap) {
          for (const [sizeId, sizeQty] of variantSizeMap.entries()) {
            const size = v.sizes?.find((s) => s.id === sizeId);
            // If size doesn't have its own inventory, deduct from variant
            if (!size || size.inventory === undefined) {
              variantInventoryDeduction += sizeQty;
            }
          }
          // Also account for items without size selection
          const totalSizeQty = Array.from(variantSizeMap.values()).reduce((sum, q) => sum + q, 0);
          variantInventoryDeduction += variantQty - totalSizeQty;
        } else {
          // No size selection, deduct full quantity from variant
          variantInventoryDeduction = variantQty;
        }

        return {
          ...v,
          inventory: Math.max(0, v.inventory - variantInventoryDeduction),
          sizes: updatedSizes,
          updatedAt: now,
        };
      });
    }

    if (variantMap) {
      for (const [variantId, qty] of variantMap.entries()) {
        const existing = product.variants.find((vx) => vx.variantId === variantId);
        let newInventory: number | undefined = undefined;
        if (existing && product.inventoryType === 'STOCK') {
          const updatedVariant = updatedVariants.find((vx) => vx.variantId === variantId);
          newInventory = updatedVariant?.inventory ?? Math.max(0, existing.inventory - qty);
        }
        variantUpdates.push({ variantId, incrementOrders: qty, newInventory });
      }
    }

    // Patch product with updated variants (including size inventories)
    if (product.inventoryType === 'STOCK') {
      const aggregateQty = totalQty;
      const newProductInventory = Math.max(0, (product.inventory || 0) - aggregateQty);
      await ctx.db.patch(productId, {
        inventory: newProductInventory,
        variants: updatedVariants,
        updatedAt: now,
      });
    }

    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId,
      incrementOrders: 1,
      variantUpdates: variantUpdates.length > 0 ? variantUpdates : undefined,
    });

    // Update category stats (order count + revenue)
    if (product.categoryId) {
      // Compute revenue contributed by this product
      let revenue = 0;
      for (const it of preparedItems) {
        if (String(it.productId) === String(product._id)) {
          revenue += it.price * it.quantity;
        }
      }
      await ctx.runMutation(internal.categories.mutations.index.updateCategoryStats, {
        categoryId: product.categoryId,
        orderCountDelta: 1,
        revenueDelta: revenue,
      });
    }
  }

  // Update user order stats
  await ctx.runMutation(internal.users.mutations.index.updateOrderStats, {
    userId: customer._id,
    orderValue: totalAmount,
    incrementOrders: true,
  });

  // Update organization stats
  if (args.organizationId) {
    await ctx.runMutation(internal.organizations.mutations.index.updateOrganizationStats, {
      organizationId: args.organizationId,
      incrementOrders: true,
    });
    // Increment org member activity for processor/current user
    try {
      const memberId = args.processedById ?? (currentUser.isStaff || currentUser.isAdmin ? currentUser._id : undefined);
      if (memberId) {
        await ctx.runMutation(internal.organizations.mutations.index.updateMemberActivity, {
          userId: memberId,
          organizationId: args.organizationId,
          incrementOrders: true,
        });
      }
    } catch {
      // Best-effort; do not fail order creation if member activity update fails
    }
  }

  // Create Xendit payment invoice
  let xenditInvoice;
  try {
    // Note: We can't call runAction from a mutation in Convex
    // The invoice creation will be handled by the frontend or a separate action
    console.log('Xendit invoice creation will be handled by frontend');
  } catch (error) {
    console.error('Failed to create Xendit invoice:', error);
    // Don't fail order creation if payment invoice creation fails
    // User can still pay manually or refresh invoice later
  }

  // Log action
  await logAction(
    ctx,
    'create_order',
    'DATA_CHANGE',
    'MEDIUM',
    `Created order ${orderNumber} for ${customer.email}${voucherCode ? ` with voucher ${voucherCode}` : ''}`,
    currentUser._id,
    args.organizationId,
    {
      orderId,
      orderNumber,
      customerId: customer._id,
      itemCount: preparedItems.length,
      totalAmount,
      voucherCode,
      voucherDiscount,
    }
  );

  // Create order log for order creation
  const voucherMessage = voucherCode && voucherDiscount > 0 ? ` (Voucher ${voucherCode} applied: -₱${voucherDiscount.toFixed(2)})` : '';
  const paymentStatusMessage = paymentStatusToUse === 'PAID' && voucherDiscount > 0 ? ' - Paid in full by voucher' : '';
  await createSystemOrderLog(ctx, {
    orderId,
    logType: 'ORDER_CREATED',
    reason: `Order ${orderNumber} created`,
    message: `Order placed with ${preparedItems.length} item(s) totaling ₱${totalAmount.toFixed(2)}${voucherMessage}${paymentStatusMessage}`,
    isPublic: true,
    actorId: currentUser._id,
  });

  // Auto-assign to batches based on order date
  if (args.organizationId) {
    try {
      // Find all active batches for this organization where orderDate falls within range
      const batches = await ctx.db
        .query('orderBatches')
        .withIndex('by_organization_active', (q) => q.eq('organizationId', args.organizationId!).eq('isActive', true))
        .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.lte(q.field('startDate'), now), q.gte(q.field('endDate'), now)))
        .collect();

      if (batches.length > 0) {
        const batchIds: Id<'orderBatches'>[] = [];
        const batchInfo: Array<{ id: Id<'orderBatches'>; name: string }> = [];

        for (const batch of batches) {
          batchIds.push(batch._id);
          batchInfo.push({
            id: batch._id,
            name: batch.name,
          });
        }

        await ctx.db.patch(orderId, {
          batchIds,
          batchInfo,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      // Best-effort; do not fail order creation if batch assignment fails
      console.error('Failed to auto-assign order to batches:', error);
    }
  }

  // Return order details including Xendit invoice info
  const createdOrder = await ctx.db.get(orderId);
  if (!createdOrder) {
    throw new Error('Order creation failed');
  }

  // Schedule order confirmation email (non-blocking)
  if (customer.email) {
    await ctx.scheduler.runAfter(0, internal.orders.actions.sendOrderConfirmationEmail.sendOrderConfirmationEmail, {
      orderId,
    });
    console.log('Order confirmation email scheduled for:', customer.email);
  }

  return {
    orderId,
    orderNumber: createdOrder.orderNumber,
    xenditInvoiceUrl: createdOrder.xenditInvoiceUrl,
    xenditInvoiceId: createdOrder.xenditInvoiceId,
    totalAmount: createdOrder.totalAmount,
    voucherApplied: !!voucherCode,
    voucherDiscount: voucherDiscount > 0 ? voucherDiscount : undefined,
    checkoutId: createdOrder.checkoutId,
  };
};
