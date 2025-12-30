import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateArrayNotEmpty, validatePositiveNumber } from '../../helpers';
import { processCreateOrder, OrderItemInput } from './processCreateOrder';

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
  // Require authentication for normal checkout
  const currentUser = await requireAuthentication(ctx);

  // Basic validation
  validateArrayNotEmpty(args.items, 'Order items');
  for (const item of args.items) {
    validatePositiveNumber(item.quantity, 'Item quantity');
    if (item.price !== undefined) {
      validatePositiveNumber(item.price, 'Item price');
    }
  }

  // Delegate to shared order creation logic
  // All order processing logic is now in processCreateOrder to avoid duplication
  const orderId = await processCreateOrder(ctx, {
    organizationId: args.organizationId,
    customerId: args.customerId,
    processedById: args.processedById,
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
    actingUser: currentUser,
  });

  // Fetch the created order to return details
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
    xenditInvoiceUrl: createdOrder.xenditInvoiceUrl,
    xenditInvoiceId: createdOrder.xenditInvoiceId,
    totalAmount: createdOrder.totalAmount,
    voucherApplied: !!createdOrder.voucherCode,
    voucherDiscount: createdOrder.voucherDiscount,
    checkoutId: createdOrder.checkoutId,
  };
};
