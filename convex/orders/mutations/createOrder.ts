import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
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

type OrderItemInput = {
  productId: Id<'products'>;
  variantId?: string;
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
      quantity: v.number(),
      price: v.optional(v.number()),
      customerNote: v.optional(v.string()),
    })
  ),
  paymentPreference: v.optional(v.union(v.literal('FULL'), v.literal('DOWNPAYMENT'))),
  estimatedDelivery: v.optional(v.number()),
  customerNotes: v.optional(v.string()),
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
  // Track per-product/variant totals for inventory updates and stats
  const productIdToQty: Map<string, number> = new Map();
  const productIdToVariantQty: Map<string, Map<string, number>> = new Map();

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
    }
  }

  // Compute totals
  let totalAmount = 0;
  let discountAmount = 0;
  for (const it of preparedItems) {
    totalAmount += it.price * it.quantity;
    discountAmount += Math.max(0, it.originalPrice - it.price) * it.quantity;
  }

  const now = Date.now();
  const orderNumber = generateOrderNumber(now);

  // Prepare order document
  const orderDoc = {
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
    status: 'PENDING' as const,
    paymentStatus: 'PENDING' as const,
    cancellationReason: undefined,
    embeddedItems:
      preparedItems.length <= 20
        ? preparedItems.map((it) => ({
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
            appliedRole: it.appliedRole,
            customerNote: it.customerNote,
          }))
        : undefined,
    totalAmount,
    discountAmount,
    itemCount: preparedItems.reduce((sum, it) => sum + it.quantity, 0),
    uniqueProductCount: new Set(preparedItems.map((it) => String(it.productId))).size,
    estimatedDelivery: args.estimatedDelivery,
    customerSatisfactionSurveyId: undefined,
    customerNotes: args.customerNotes,
    paymentPreference: args.paymentPreference,
    recentStatusHistory: [
      {
        status: 'PENDING',
        changedBy: currentUser._id,
        changedByName: `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() || currentUser.email,
        reason: 'Order created',
        changedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
    orderNumber,
  };

  // Insert order
  const orderId = await ctx.db.insert('orders', orderDoc);

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
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Update product stats and inventory, and category/org/user stats
  // - Increment product totalOrders once per product present in order
  // - Increment variant orderCount by quantity
  // - Decrement inventory for STOCK items
  for (const [productIdStr, totalQty] of productIdToQty.entries()) {
    const productId = productIdStr as unknown as Id<'products'>;
    const product = await ctx.db.get(productId);
    if (!product) continue;

    const variantMap = productIdToVariantQty.get(productIdStr);
    const variantUpdates: Array<{ variantId: string; incrementOrders?: number; newInventory?: number }> = [];

    if (variantMap) {
      for (const [variantId, qty] of variantMap.entries()) {
        const existing = product.variants.find((vx) => vx.variantId === variantId);
        let newInventory: number | undefined = undefined;
        if (existing && product.inventoryType === 'STOCK') {
          newInventory = Math.max(0, existing.inventory - qty);
        }
        variantUpdates.push({ variantId, incrementOrders: qty, newInventory });
      }
    }

    await ctx.runMutation(internal.products.mutations.index.updateProductStats, {
      productId,
      incrementOrders: 1,
      variantUpdates: variantUpdates.length > 0 ? variantUpdates : undefined,
    });

    // Update product-level inventory if STOCK and product tracks aggregate inventory
    if (product.inventoryType === 'STOCK') {
      const aggregateQty = totalQty;
      const newProductInventory = Math.max(0, (product.inventory || 0) - aggregateQty);
      await ctx.db.patch(productId, { inventory: newProductInventory, updatedAt: now });
    }

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
    `Created order ${orderNumber} for ${customer.email}`,
    currentUser._id,
    args.organizationId,
    {
      orderId,
      orderNumber,
      customerId: customer._id,
      itemCount: preparedItems.length,
      totalAmount,
    }
  );

  // Return order details including Xendit invoice info
  const createdOrder = await ctx.db.get(orderId);
  if (!createdOrder) {
    throw new Error('Order creation failed');
  }

  return {
    orderId,
    orderNumber: createdOrder.orderNumber,
    xenditInvoiceUrl: createdOrder.xenditInvoiceUrl,
    xenditInvoiceId: createdOrder.xenditInvoiceId,
    totalAmount: createdOrder.totalAmount,
  };
};
