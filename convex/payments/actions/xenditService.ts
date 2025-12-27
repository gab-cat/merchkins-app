'use node';

import { internalAction } from '../../_generated/server';
import { v } from 'convex/values';
import { Xendit } from 'xendit-node';
import { Doc, Id } from '../../_generated/dataModel';
import { api } from '../../_generated/api';

/**
 * Helper function to check if an invoice is expired (more than 24 hours old)
 */
export function checkInvoiceExpiry(createdAt: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return now - createdAt > twentyFourHours;
}

/**
 * Create a Xendit invoice for payment
 * Supports both single orders and grouped orders (checkout sessions)
 *
 * Note: merchant_name is set in the Xendit dashboard account settings, not via API.
 * Ensure the merchant_name in the Xendit dashboard matches your business name configuration
 * (e.g., your app's BUSINESS_NAME or brand name) for Xendit verification requirements.
 */
export const createXenditInvoice = internalAction({
  args: {
    orderId: v.optional(v.id('orders')), // Optional for backward compatibility
    orderIds: v.optional(v.array(v.id('orders'))), // For grouped payments
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
    invoiceId: v.string(),
    invoiceUrl: v.string(),
    expiryDate: v.number(),
  }),
  handler: async (ctx, args) => {
    const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!xenditSecretKey) {
      throw new Error('XENDIT_SECRET_KEY environment variable is not set');
    }

    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    // Build items array if orderIds provided but items not provided
    let invoiceItems: Array<{ name: string; quantity: number; price: number; category?: string; url?: string }> | undefined = args.items;
    const ordersByStore: Map<
      string,
      { name: string; items: Array<{ name: string; quantity: number; price: number; category?: string; url?: string }>; subtotal: number }
    > = new Map();
    let totalVoucherDiscount = 0;
    const orderNumbers: string[] = [];
    let customerName = args.customerName;

    if (!invoiceItems && args.orderIds && args.orderIds.length > 0) {
      // Fetch all orders and build items array with store grouping
      const orders = (await Promise.all(
        args.orderIds.map((orderId) => ctx.runQuery(api.orders.queries.index.getOrderById, { orderId, includeItems: true }))
      )) as Array<Doc<'orders'> | null>;

      invoiceItems = [];
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

        // Get items from embeddedItems or orderItems table
        type OrderWithItems = {
          items?: Array<{
            productInfo: { title: string; slug: string; variantName?: string; categoryName?: string };
            quantity: number;
            price: number;
            variantName?: string;
          }>;
        };
        const orderItems = order.embeddedItems || (order as OrderWithItems).items || [];

        for (const item of orderItems) {
          const variantName = 'variantName' in item ? item.variantName : item.productInfo.variantName;
          const itemName = variantName ? `${item.productInfo.title} - ${variantName}` : item.productInfo.title;
          const prefixedItemName = `[${storeName}] ${itemName}`;
          const category = ('categoryName' in item.productInfo ? item.productInfo.categoryName : undefined) || 'General';
          const productUrl = `${appUrl}/products/${item.productInfo.slug}`;

          const invoiceItem = {
            name: prefixedItemName,
            quantity: item.quantity,
            price: item.price,
            category,
            url: productUrl,
          };

          invoiceItems.push(invoiceItem);
          storeGroup.items.push(invoiceItem);
          storeGroup.subtotal += item.price * item.quantity;
        }
      }

      // Build final items array (without store subtotals)
      const finalItems: Array<{ name: string; quantity: number; price: number; category?: string; url?: string }> = [];

      // Group items by store
      for (const [storeKey, storeGroup] of ordersByStore.entries()) {
        // Add all items for this store
        for (const item of storeGroup.items) {
          finalItems.push(item);
        }
      }

      // Add voucher discount if applicable
      if (totalVoucherDiscount > 0) {
        // Find voucher code from orders
        const voucherCode = orders.find((o: import('../../_generated/dataModel').Doc<'orders'> | null) => o?.voucherCode)?.voucherCode || 'VOUCHER';
        finalItems.push({
          name: `Voucher Discount (${voucherCode})`,
          quantity: 1,
          price: -totalVoucherDiscount,
          category: 'Discount',
        });
      }

      invoiceItems = finalItems;
    } else if (!invoiceItems && args.orderId) {
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

        type OrderWithItems = {
          items?: Array<{
            productInfo: { title: string; slug: string; variantName?: string; categoryName?: string };
            quantity: number;
            price: number;
            variantName?: string;
          }>;
        };
        const orderItems = order.embeddedItems || (order as OrderWithItems).items || [];

        invoiceItems = orderItems.map(
          (item: {
            productInfo: { title: string; slug: string; variantName?: string; categoryName?: string };
            quantity: number;
            price: number;
            variantName?: string;
          }) => {
            const variantName = 'variantName' in item ? item.variantName : item.productInfo.variantName;
            const itemName = variantName ? `${item.productInfo.title} - ${variantName}` : item.productInfo.title;
            const category = ('categoryName' in item.productInfo ? item.productInfo.categoryName : undefined) || 'General';
            const productUrl = `${appUrl}/products/${item.productInfo.slug}`;

            return {
              name: itemName,
              quantity: item.quantity,
              price: item.price,
              category,
              url: productUrl,
            };
          }
        );

        // Add voucher discount if applicable
        if (totalVoucherDiscount > 0 && order.voucherCode && invoiceItems) {
          invoiceItems.push({
            name: `Voucher Discount (${order.voucherCode})`,
            quantity: 1,
            price: -totalVoucherDiscount,
            category: 'Discount',
          });
        }
      }
    }

    // Build description
    let description = `Payment for Order #${args.externalId}`;
    if (args.orderIds && args.orderIds.length > 1) {
      const storeNames = Array.from(ordersByStore.values()).map((s) => s.name);
      const uniqueStores = Array.from(new Set(storeNames));
      description = `Payment for ${args.orderIds.length} orders from ${uniqueStores.length} store${uniqueStores.length > 1 ? 's' : ''}: ${orderNumbers.join(', ')}`;
      if (uniqueStores.length > 0) {
        description += ` (${uniqueStores.join(', ')})`;
      }
      if (totalVoucherDiscount > 0) {
        description += ` - Total discount: ₱${totalVoucherDiscount.toFixed(2)}`;
      }
    } else if (orderNumbers.length > 0) {
      description = `Payment for Order ${orderNumbers[0]}`;
      if (totalVoucherDiscount > 0) {
        description += ` - Discount: ₱${totalVoucherDiscount.toFixed(2)}`;
      }
    }

    // Build redirect URLs
    const orderIdForRedirect = args.orderId || (args.orderIds && args.orderIds[0]);
    const successRedirectUrl = args.checkoutId
      ? `${appUrl}/orders/payment/success?checkoutId=${args.checkoutId}`
      : `${appUrl}/orders/payment/success?orderId=${orderIdForRedirect}`;
    const failureRedirectUrl = args.checkoutId
      ? `${appUrl}/orders/payment/failure?checkoutId=${args.checkoutId}`
      : `${appUrl}/orders/payment/failure?orderId=${orderIdForRedirect}`;

    const xenditClient = new Xendit({
      secretKey: xenditSecretKey,
    });

    try {
      const invoiceData: {
        externalId: string;
        amount: number;
        payerEmail: string;
        description: string;
        successRedirectUrl: string;
        failureRedirectUrl: string;
        customerName?: string;
        items?: Array<{ name: string; quantity: number; price: number; category?: string; url?: string }>;
      } = {
        externalId: args.externalId,
        amount: args.amount,
        payerEmail: args.customerEmail,
        description,
        successRedirectUrl,
        failureRedirectUrl,
      };

      // Add customer name if available
      if (customerName) {
        invoiceData.customerName = customerName;
      }

      // Add items if available
      if (invoiceItems && invoiceItems.length > 0) {
        invoiceData.items = invoiceItems;
      }

      const invoiceResponse = await xenditClient.Invoice.createInvoice({
        data: invoiceData,
      });

      if (!invoiceResponse.invoiceUrl || !invoiceResponse.id) {
        throw new Error('Invalid invoice response from Xendit');
      }

      // Xendit invoices expire after 24 hours
      const createdAt = Date.now();
      const expiryDate = createdAt + 24 * 60 * 60 * 1000; // 24 hours from now

      return {
        invoiceId: invoiceResponse.id,
        invoiceUrl: invoiceResponse.invoiceUrl,
        expiryDate,
      };
    } catch (error) {
      console.error('Error creating Xendit invoice:', error);
      throw new Error('Failed to create payment invoice');
    }
  },
});
