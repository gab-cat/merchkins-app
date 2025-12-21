// Chatwoot Order Flow - Create Messenger Order
// Internal mutation to create orders from Messenger flow

import { v } from 'convex/values';
import { MutationCtx, internalMutation } from '../../_generated/server';
import { Id } from '../../_generated/dataModel';
import { processCreateOrder } from '../../orders/mutations/processCreateOrder';

export const createMessengerOrderArgs = {
  organizationId: v.optional(v.id('organizations')),
  customerId: v.id('users'),
  productId: v.id('products'),
  variantId: v.string(),
  sizeId: v.optional(v.string()),
  sizeLabel: v.optional(v.string()),
  quantity: v.number(),
  price: v.number(),
  notes: v.optional(v.string()),
  productTitle: v.string(),
  productSlug: v.string(),
  productImageUrl: v.array(v.string()),
  variantName: v.string(),
};

export const createMessengerOrderHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId?: Id<'organizations'>;
    customerId: Id<'users'>;
    productId: Id<'products'>;
    variantId: string;
    sizeId?: string;
    sizeLabel?: string;
    quantity: number;
    price: number;
    notes?: string;
    productTitle: string;
    productSlug: string;
    productImageUrl: string[];
    variantName: string;
  }
): Promise<Id<'orders'>> => {
  // Delegate to shared logic
  // Note: Messenger orders are created by the system/bot, so we don't pass an actingUser
  // The shared logic handles this by attributing actions to the customerId

  return await processCreateOrder(ctx, {
    organizationId: args.organizationId,
    customerId: args.customerId,
    items: [
      {
        productId: args.productId,
        variantId: args.variantId,
        size: args.sizeId && args.sizeLabel ? { id: args.sizeId, label: args.sizeLabel } : undefined,
        quantity: args.quantity,
        price: args.price, // Passing the price from session (which came from product lookup earlier in flow)
        customerNote: args.notes,
      },
    ],
    customerNotes: args.notes,
    orderSource: 'MESSENGER',
  });
};

export const createMessengerOrder = internalMutation({
  args: createMessengerOrderArgs,
  returns: v.id('orders'),
  handler: createMessengerOrderHandler,
});
