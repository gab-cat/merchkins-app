'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { Doc } from '../../_generated/dataModel';
import { api } from '../../_generated/api';
import type { PaymongoCheckoutSession, PaymongoLineItem, CreateCheckoutSessionRequest, PaymongoApiResponse } from '../../../types/paymongo';
import { buildPublicUrl } from '../../helpers/utils';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

/**
 * Default payment methods for Paymongo checkout
 * These are the most common payment methods in the Philippines
 */
const DEFAULT_PAYMENT_METHODS = [
  'gcash',
  'grab_pay',
  'paymaya',
  'card',
  'dob', // Direct online banking
  'dob_ubp', // Union Bank
  'brankas_bdo',
  'brankas_landbank',
  'brankas_metrobank',
];

/**
 * Type definition for order items used in checkout processing
 */
type OrderItem = {
  productInfo: {
    title: string;
    slug: string;
    variantName?: string;
    categoryName?: string;
    imageUrl?: string[];
  };
  quantity: number;
  price: number;
  variantName?: string;
};

/**
 * Helper function to check if checkout is expired
 * Paymongo checkout sessions expire after 24 hours by default
 */
export function checkCheckoutExpiry(createdAt: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - createdAt > twentyFourHours;
}

/**
 * Converts amount in pesos to centavos (Paymongo uses centavos)
 */
function toCentavos(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Create a Paymongo checkout session for payment
 * Supports both single orders and grouped orders (checkout sessions)
 */
export const createPaymongoCheckout = internalAction({
  args: {
    orderId: v.optional(v.id('orders')),
    orderIds: v.optional(v.array(v.id('orders'))),
    amount: v.number(),
    customerEmail: v.string(),
    externalId: v.string(),
    checkoutId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    items: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.number(),
          price: v.number(),
          category: v.optional(v.string()),
          url: v.optional(v.string()),
        })
      )
    ),
  },
  returns: v.object({
    checkoutId: v.string(),
    checkoutUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx, args) => {
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!paymongoSecretKey) {
      throw new Error('PAYMONGO_SECRET_KEY environment variable is not set');
    }

    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    // Build line items array if orderIds provided but items not provided
    let lineItems: PaymongoLineItem[] = [];
    const ordersByStore: Map<string, { name: string; items: PaymongoLineItem[]; subtotal: number }> = new Map();
    let totalVoucherDiscount = 0;
    const orderNumbers: string[] = [];
    let customerName = args.customerName;

    if (!args.items && args.orderIds && args.orderIds.length > 0) {
      // Fetch all orders and build items array with store grouping
      const orders = (await Promise.all(
        args.orderIds.map((orderId) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId, includeItems: true }))
      )) as Array<Doc<'orders'> | null>;

      for (const order of orders) {
        if (!order) continue;

        // Get customer name from first order if not provided
        if (!customerName && order.customerInfo) {
          const firstName = order.customerInfo.firstName || '';
          const lastName = order.customerInfo.lastName || '';
          customerName = firstName && lastName ? `${firstName} ${lastName}`.trim() : order.customerInfo.email;
        }

        // Track order number
        if (order.orderNumber) {
          orderNumbers.push(order.orderNumber);
        }

        // Track voucher discount
        if (order.voucherDiscount && order.voucherDiscount > 0) {
          totalVoucherDiscount += order.voucherDiscount;
        }

        // Get store/organization name
        const storeName = order.organizationInfo?.name || 'Storefront';
        const storeKey = order.organizationId ? String(order.organizationId) : 'global';

        // Initialize store group if not exists
        if (!ordersByStore.has(storeKey)) {
          ordersByStore.set(storeKey, {
            name: storeName,
            items: [],
            subtotal: 0,
          });
        }

        const storeGroup = ordersByStore.get(storeKey)!;

        // Get items from embeddedItems
        const orderItems: OrderItem[] = order.embeddedItems || [];

        for (const item of orderItems) {
          const variantName = 'variantName' in item ? item.variantName : item.productInfo.variantName;
          const itemName = variantName ? `${item.productInfo.title} - ${variantName}` : item.productInfo.title;
          const prefixedItemName = args.orderIds && args.orderIds.length > 1 ? `[${storeName}] ${itemName}` : itemName;
          const imageKey = item.productInfo.imageUrl?.[0];
          const imageUrl = imageKey ? buildPublicUrl(imageKey) : undefined;

          const lineItem: PaymongoLineItem = {
            name: prefixedItemName,
            quantity: item.quantity,
            amount: toCentavos(item.price), // Paymongo uses centavos
            currency: 'PHP',
            description: item.productInfo.categoryName || 'Product',
            images: imageUrl ? [imageUrl] : undefined,
          };

          lineItems.push(lineItem);
          storeGroup.items.push(lineItem);
          storeGroup.subtotal += item.price * item.quantity;
        }
      }

      // Apply voucher discount proportionally to line items (Paymongo doesn't allow negative amounts)
      if (totalVoucherDiscount > 0 && lineItems.length > 0) {
        // Calculate original subtotal from line items
        const originalSubtotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
        
        if (originalSubtotal > 0) {
          // Calculate discount ratio
          const discountRatio = (originalSubtotal - toCentavos(totalVoucherDiscount)) / originalSubtotal;
          
          // Apply discount proportionally to each line item
          for (const lineItem of lineItems) {
            // Round to nearest centavo to avoid floating point issues
            lineItem.amount = Math.round(lineItem.amount * discountRatio);
          }
        }
      }
    } else if (!args.items && args.orderId) {
      // Single order - build items from order
      const order = await ctx.runQuery(api.orders.queries.index.getOrderById, {
        orderId: args.orderId,
        includeItems: true,
      });

      if (order) {
        // Get customer name if not provided
        if (!customerName && order.customerInfo) {
          const firstName = order.customerInfo.firstName || '';
          const lastName = order.customerInfo.lastName || '';
          customerName = firstName && lastName ? `${firstName} ${lastName}`.trim() : order.customerInfo.email;
        }

        // Track order number
        if (order.orderNumber) {
          orderNumbers.push(order.orderNumber);
        }

        // Track voucher discount
        if (order.voucherDiscount && order.voucherDiscount > 0) {
          totalVoucherDiscount = order.voucherDiscount;
        }

        const orderItems: OrderItem[] = order.embeddedItems || [];

        lineItems = orderItems.map((item) => {
          const variantName = 'variantName' in item ? item.variantName : item.productInfo.variantName;
          const itemName = variantName ? `${item.productInfo.title} - ${variantName}` : item.productInfo.title;
          const imageKey = item.productInfo.imageUrl?.[0];
          const imageUrl = imageKey ? buildPublicUrl(imageKey) : undefined;

          return {
            name: itemName,
            quantity: item.quantity,
            amount: toCentavos(item.price),
            currency: 'PHP',
            description: item.productInfo.categoryName || 'Product',
            images: imageUrl ? [imageUrl] : undefined,
          };
        });

        // Apply voucher discount proportionally to line items (Paymongo doesn't allow negative amounts)
        if (totalVoucherDiscount > 0 && lineItems.length > 0) {
          // Calculate original subtotal from line items
          const originalSubtotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
          
          if (originalSubtotal > 0) {
            // Calculate discount ratio
            const discountRatio = (originalSubtotal - toCentavos(totalVoucherDiscount)) / originalSubtotal;
            
            // Apply discount proportionally to each line item
            for (const lineItem of lineItems) {
              // Round to nearest centavo to avoid floating point issues
              lineItem.amount = Math.round(lineItem.amount * discountRatio);
            }
          }
        }
      }
    } else if (args.items) {
      // Use provided items
      lineItems = args.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        amount: toCentavos(item.price),
        currency: 'PHP',
        description: item.category || 'Product',
      }));
    }

    // If no line items, create a single line item for the total
    if (lineItems.length === 0) {
      lineItems = [
        {
          name: `Order ${args.externalId}`,
          quantity: 1,
          amount: toCentavos(args.amount),
          currency: 'PHP',
          description: 'Order payment',
        },
      ];
    }

    // Validate that line items total matches the amount parameter
    // PayMongo charges based on line_items, so this validation is critical
    // Allow ±2 centavos tolerance for rounding errors when dealing with multiple orders and discounts
    const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
    const expectedAmount = toCentavos(args.amount);
    const difference = Math.abs(lineItemsTotal - expectedAmount);
    const ROUNDING_TOLERANCE = 2; // Allow up to 2 centavos difference for rounding errors
    
    if (difference > ROUNDING_TOLERANCE) {
      throw new Error(
        `Line items total (${lineItemsTotal} centavos) does not match amount parameter (${expectedAmount} centavos). ` +
          `Difference: ${difference} centavos. ` +
          `This mismatch would cause incorrect charges. Please verify the order totals and voucher discounts.`
      );
    }

    // Build description
    let description = `Payment for Order #${args.externalId}`;
    if (args.orderIds && args.orderIds.length > 1) {
      const storeNames = Array.from(ordersByStore.values()).map((s) => s.name);
      const uniqueStores = Array.from(new Set(storeNames));
      description = `Payment for ${args.orderIds.length} orders from ${uniqueStores.length} store${uniqueStores.length > 1 ? 's' : ''}: ${orderNumbers.join(', ')}`;
    } else if (orderNumbers.length > 0) {
      description = `Payment for Order ${orderNumbers[0]}`;
    }

    // Build redirect URLs
    // Validate that at least one identifier exists to prevent "undefined" in URLs
    if (!args.checkoutId && !args.orderId && !args.orderIds && !args.externalId) {
      throw new Error('Missing required parameter: at least one of checkoutId, orderId, orderIds, or externalId must be provided');
    }

    // Compute orderIdForRedirect with fallback to externalId
    const orderIdForRedirect = args.orderId || (args.orderIds && args.orderIds[0]) || args.externalId;
    const successUrl = args.checkoutId
      ? `${appUrl}/orders/payment/success?checkoutId=${args.checkoutId}`
      : `${appUrl}/orders/payment/success?orderId=${orderIdForRedirect}`;
    const cancelUrl = args.checkoutId
      ? `${appUrl}/orders/payment/failure?checkoutId=${args.checkoutId}`
      : `${appUrl}/orders/payment/failure?orderId=${orderIdForRedirect}`;

    // Build metadata for tracking
    const metadata: Record<string, string> = {
      external_id: args.externalId,
      customer_email: args.customerEmail,
    };
    if (args.orderId) {
      metadata.order_id = args.orderId;
    }
    if (args.orderIds) {
      metadata.order_ids = args.orderIds.join(',');
    }
    if (args.checkoutId) {
      metadata.checkout_id = args.checkoutId;
    }

    // Create checkout session request
    const requestBody: CreateCheckoutSessionRequest = {
      data: {
        attributes: {
          billing: customerName
            ? {
                name: customerName,
                email: args.customerEmail,
              }
            : undefined,
          description,
          line_items: lineItems,
          payment_method_types: DEFAULT_PAYMENT_METHODS,
          reference_number: args.externalId,
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata,
        },
      },
    };

    try {
      const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(paymongoSecretKey + ':').toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Paymongo API error:', errorData);
        throw new Error(`Paymongo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const responseData: PaymongoApiResponse<PaymongoCheckoutSession> = await response.json();
      const checkoutSession = responseData.data;

      if (!checkoutSession.attributes.checkout_url || !checkoutSession.id) {
        throw new Error('Invalid checkout session response from Paymongo');
      }

      // Paymongo checkout sessions expire after 24 hours
      const createdAt = Date.now();
      const expiryDate = createdAt + 24 * 60 * 60 * 1000;

      return {
        checkoutId: checkoutSession.id,
        checkoutUrl: checkoutSession.attributes.checkout_url,
        expiryDate,
      };
    } catch (error) {
      console.error('Error creating Paymongo checkout session:', error);
      
      // Preserve the original error message if it's an Error instance
      if (error instanceof Error) {
        // If it's already a validation error or API error, preserve the message
        if (error.message.includes('Line items total') || error.message.includes('Paymongo API error')) {
          throw error;
        }
        // Otherwise, wrap with context
        throw new Error(`Failed to create payment checkout session: ${error.message}`);
      }
      
      // Fallback for non-Error instances
      throw new Error(`Failed to create payment checkout session: ${String(error)}`);
    }
  },
});
