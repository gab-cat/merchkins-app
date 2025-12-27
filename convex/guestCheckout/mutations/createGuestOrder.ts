import { mutation } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { validateUserExists, validateOrganizationExists, validateProductExists, validateArrayNotEmpty, validatePositiveNumber } from '../../helpers';
import { internal } from '../../_generated/api';
import { processCreateOrder } from '../../orders/mutations/processCreateOrder';

export const createGuestOrder = mutation({
  args: {
    userId: v.id('users'),
    items: v.array(
      v.object({
        productId: v.id('products'),
        variantId: v.optional(v.string()),
        size: v.optional(
          v.object({
            id: v.string(),
            label: v.string(),
            price: v.optional(v.number()),
          })
        ),
        quantity: v.number(),
        price: v.optional(v.number()),
        customerNote: v.optional(v.string()),
      })
    ),
    organizationId: v.optional(v.id('organizations')),
    paymentPreference: v.optional(v.union(v.literal('FULL'), v.literal('DOWNPAYMENT'))),
    estimatedDelivery: v.optional(v.number()),
    customerNotes: v.optional(v.string()),
    voucherCode: v.optional(v.string()),
    voucherProportionalShare: v.optional(v.number()),
    checkoutId: v.optional(v.string()),
  },
  returns: v.object({
    orderId: v.id('orders'),
    orderNumber: v.string(),
    totalAmount: v.number(),
    voucherApplied: v.boolean(),
    voucherDiscount: v.optional(v.number()),
    checkoutId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Validate user exists
    const customer = await validateUserExists(ctx, args.userId);

    // Basic validation
    validateArrayNotEmpty(args.items, 'Order items');
    for (const item of args.items) {
      validatePositiveNumber(item.quantity, 'Item quantity');
    }

    // Validate organization if provided
    if (args.organizationId) {
      await validateOrganizationExists(ctx, args.organizationId);
    }

    // Validate all products exist and are active
    for (const item of args.items) {
      const product = await validateProductExists(ctx, item.productId);
      if (!product.isActive) {
        throw new Error(`Product ${product.title} is not available`);
      }

      // For guest checkout, only allow PUBLIC orgs
      if (product.organizationId) {
        const org = await ctx.db.get(product.organizationId);
        if (org && !org.isDeleted && org.organizationType !== 'PUBLIC') {
          throw new Error('This product is only available to organization members. Please sign in to purchase.');
        }
      }
    }

    // Use the existing processCreateOrder function which handles all the order creation logic
    // We pass the customer as the acting user since they're creating their own order
    const orderId = await processCreateOrder(ctx, {
      organizationId: args.organizationId,
      customerId: customer._id,
      processedById: undefined, // Guest orders don't have a processor
      items: args.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        customerNote: item.customerNote,
      })),
      paymentPreference: args.paymentPreference,
      estimatedDelivery: args.estimatedDelivery,
      customerNotes: args.customerNotes,
      voucherCode: args.voucherCode,
      voucherProportionalShare: args.voucherProportionalShare,
      checkoutId: args.checkoutId,
      orderSource: 'WEB',
      actingUser: customer, // Guest user creating their own order
    });

    // Fetch the created order to get all details
    const createdOrder = await ctx.db.get(orderId);
    if (!createdOrder) {
      throw new Error('Order creation failed');
    }

    if (!createdOrder.orderNumber) {
      throw new Error('Order number not found');
    }

    return {
      orderId,
      orderNumber: createdOrder.orderNumber,
      totalAmount: createdOrder.totalAmount,
      voucherApplied: !!args.voucherCode,
      voucherDiscount: createdOrder.voucherDiscount,
      checkoutId: createdOrder.checkoutId,
    };
  },
});
