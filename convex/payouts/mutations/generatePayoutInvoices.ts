import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';

/**
 * Generate payout invoices for all organizations for a given period.
 * This is called by the cron job every Wednesday.
 *
 * Period: Previous Wednesday 00:00 UTC to Tuesday 23:59:59 UTC
 */
export const generatePayoutInvoicesArgs = {
  periodStart: v.number(), // Wednesday 00:00:00 UTC timestamp
  periodEnd: v.number(), // Tuesday 23:59:59 UTC timestamp
};

export const generatePayoutInvoicesHandler = async (
  ctx: MutationCtx,
  args: {
    periodStart: number;
    periodEnd: number;
  }
) => {
  const now = Date.now();
  const invoicesCreated: string[] = [];

  console.log(`[generatePayoutInvoices] Starting generation for period:`, {
    periodStart: new Date(args.periodStart).toISOString(),
    periodEnd: new Date(args.periodEnd).toISOString(),
    periodStartTimestamp: args.periodStart,
    periodEndTimestamp: args.periodEnd,
  });

  // Get platform payout settings
  const settings = await ctx.db.query('payoutSettings').first();
  const defaultFeePercentage = settings?.defaultPlatformFeePercentage ?? 15;
  const minimumPayout = settings?.minimumPayoutAmount ?? 0;

  console.log(`[generatePayoutInvoices] Settings:`, {
    defaultFeePercentage,
    minimumPayout,
  });

  // Get all active organizations
  const organizations = await ctx.db
    .query('organizations')
    .withIndex('by_isDeleted', (q) => q.eq('isDeleted', false))
    .collect();

  console.log(`[generatePayoutInvoices] Found ${organizations.length} active organizations`);

  for (const org of organizations) {
    // Check if an invoice already exists for this period and org
    const existingInvoice = await ctx.db
      .query('payoutInvoices')
      .withIndex('by_organization_period', (q) => q.eq('organizationId', org._id).eq('periodStart', args.periodStart))
      .first();

    if (existingInvoice) {
      // Skip - invoice already generated for this period
      console.log(`[generatePayoutInvoices] Skipping ${org.name} - invoice already exists for this period`);
      continue;
    }

    // Get all PAID orders for this organization in the period
    // CRITICAL: Filter by paidAt (when payment was received), not orderDate (when order was placed)
    // This ensures orders are assigned to the correct payout period based on when money was actually received

    // Get all PAID orders for this organization (we'll filter by paidAt/orderDate in JS)
    // Note: We can't use compound index with range queries directly, so we fetch all and filter
    const allPaidOrders = await ctx.db
      .query('orders')
      .withIndex('by_organization', (q) => q.eq('organizationId', org._id))
      .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.eq(q.field('paymentStatus'), 'PAID')))
      .collect();

    // Filter orders by paidAt if set (preferred), otherwise fallback to orderDate (legacy)
    // Also exclude orders already included in an invoice
    const orders = allPaidOrders.filter((order) => {
      // Skip if already in an invoice
      if (order.payoutInvoiceId) {
        return false;
      }

      // Use paidAt if available (new orders)
      if (order.paidAt) {
        return order.paidAt >= args.periodStart && order.paidAt <= args.periodEnd;
      }

      // Fallback to orderDate for legacy orders (before paidAt was added)
      return order.orderDate >= args.periodStart && order.orderDate <= args.periodEnd;
    });

    const allOrders = orders;

    console.log(`[generatePayoutInvoices] ${org.name}: Found ${allOrders.length} PAID orders in period`);

    if (allOrders.length === 0) {
      // No paid orders in this period - skip
      continue;
    }

    // Get pending adjustments for this organization (refunds/cancellations from previous payouts)
    const pendingAdjustments = await ctx.db
      .query('payoutAdjustments')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', org._id).eq('status', 'PENDING'))
      .collect();

    const adjustmentTotal = pendingAdjustments.reduce((sum, adj) => sum + adj.amount, 0);
    console.log(`[generatePayoutInvoices] ${org.name}: Found ${pendingAdjustments.length} pending adjustments totaling ${adjustmentTotal}`);

    // Calculate totals
    // For REFUND vouchers: seller gets full original value (platform absorbs voucher cost)
    // For regular vouchers: seller gets discounted value (seller provides discount)
    const grossAmount = allOrders.reduce((sum, order) => {
      // For REFUND voucher orders, seller gets full original value
      if (order.voucherSnapshot?.discountType === 'REFUND' && order.voucherDiscount) {
        return sum + order.totalAmount + order.voucherDiscount;
      }
      return sum + order.totalAmount;
    }, 0);
    const itemCount = allOrders.reduce((sum, order) => sum + order.itemCount, 0);

    // Calculate total voucher discounts from non-refund vouchers (seller absorbs these)
    const totalVoucherDiscount = allOrders.reduce((sum, order) => {
      // Only count non-refund voucher discounts
      if (order.voucherDiscount && order.voucherSnapshot?.discountType !== 'REFUND') {
        return sum + order.voucherDiscount;
      }
      return sum;
    }, 0);

    // Check minimum payout threshold
    if (grossAmount < minimumPayout) {
      console.log(`[generatePayoutInvoices] ${org.name}: Skipping - grossAmount ${grossAmount} < minimumPayout ${minimumPayout}`);
      continue;
    }

    // Get platform fee percentage (org custom or default)
    const feePercentage = org.platformFeePercentage ?? defaultFeePercentage;
    const platformFeeAmount = Math.round(((grossAmount * feePercentage) / 100) * 100) / 100;
    const netAmountBeforeAdjustments = grossAmount - platformFeeAmount;

    // Apply adjustments (adjustmentTotal is negative, so this deducts from net amount)
    const adjustedNetAmount = netAmountBeforeAdjustments + adjustmentTotal;

    // Ensure net amount doesn't go negative (adjustments can't exceed payout)
    const netAmount = Math.max(0, adjustedNetAmount);

    console.log(`[generatePayoutInvoices] ${org.name}: Creating invoice`, {
      grossAmount,
      platformFeeAmount,
      netAmountBeforeAdjustments,
      adjustmentTotal,
      netAmount,
      orderCount: allOrders.length,
      adjustmentCount: pendingAdjustments.length,
    });

    // Build order summary with voucher info
    const orderSummary = allOrders.map((order) => {
      const hasRefundVoucher = order.voucherSnapshot?.discountType === 'REFUND';
      // For display: show original amount before voucher for REFUND vouchers
      const displayAmount = hasRefundVoucher && order.voucherDiscount ? order.totalAmount + order.voucherDiscount : order.totalAmount;

      return {
        orderId: order._id,
        orderNumber: order.orderNumber || `ORD-${order._id.slice(-8)}`,
        orderDate: order.orderDate,
        customerName: `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() || order.customerInfo.email,
        totalAmount: displayAmount,
        itemCount: order.itemCount,
        voucherDiscount: order.voucherDiscount,
        voucherCode: order.voucherCode,
        hasRefundVoucher,
      };
    });

    // Build product summary by aggregating all items across orders
    // Map structure: productId -> { productTitle, variants: Map<variantId, { variantName, sizes: Map<size, { quantity, amount }> }> }
    type SizeMap = Map<string, { quantity: number; amount: number }>;
    type VariantData = { variantName: string; sizes: SizeMap; totalQuantity: number; totalAmount: number };
    type ProductData = { productTitle: string; variants: Map<string, VariantData>; totalQuantity: number; totalAmount: number };
    const productMap = new Map<string, ProductData>();

    for (const order of allOrders) {
      // Get items from embeddedItems
      const embeddedItems = order.embeddedItems || [];

      // For large orders, also fetch from orderItems table
      const orderItemsFromDb = await ctx.db
        .query('orderItems')
        .withIndex('by_order', (q) => q.eq('orderId', order._id))
        .collect();

      // Combine items (embeddedItems for small orders, orderItems for large ones)
      const allItems = embeddedItems.length > 0 ? embeddedItems : orderItemsFromDb;

      for (const item of allItems) {
        const productId = item.productInfo.productId as string;
        const productTitle = item.productInfo.title;
        // Handle variantId - ensure it's a string
        const variantId = item.variantId && typeof item.variantId === 'string' ? item.variantId : 'default';
        const variantName = item.productInfo.variantName || 'Default';
        // Handle size - could be object (from embeddedItems) or string (from orderItems)
        let size = 'One Size';
        if ('size' in item && item.size) {
          if (typeof item.size === 'string') {
            // orderItems table stores size as string
            size = item.size;
          } else if (typeof item.size === 'object' && 'label' in item.size) {
            // embeddedItems stores size as { id, label }
            size = (item.size as { id: string; label: string }).label;
          }
        }
        const quantity = item.quantity;
        const amount = item.price * item.quantity;

        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productTitle,
            variants: new Map(),
            totalQuantity: 0,
            totalAmount: 0,
          });
        }

        const product = productMap.get(productId)!;
        product.totalQuantity += quantity;
        product.totalAmount += amount;

        if (!product.variants.has(variantId)) {
          product.variants.set(variantId, {
            variantName,
            sizes: new Map(),
            totalQuantity: 0,
            totalAmount: 0,
          });
        }

        const variant = product.variants.get(variantId)!;
        variant.totalQuantity += quantity;
        variant.totalAmount += amount;

        if (!variant.sizes.has(size)) {
          variant.sizes.set(size, { quantity: 0, amount: 0 });
        }

        const sizeData = variant.sizes.get(size)!;
        sizeData.quantity += quantity;
        sizeData.amount += amount;
      }
    }

    // Convert maps to arrays, filtering out items with 0 quantity
    const productSummary = Array.from(productMap.entries())
      .map(([productId, product]) => ({
        productId,
        productTitle: product.productTitle,
        totalQuantity: product.totalQuantity,
        totalAmount: product.totalAmount,
        variants: Array.from(product.variants.entries())
          .map(([variantId, variant]) => ({
            variantId,
            variantName: variant.variantName,
            totalQuantity: variant.totalQuantity,
            totalAmount: variant.totalAmount,
            sizes: Array.from(variant.sizes.entries())
              .map(([size, data]) => ({
                size,
                quantity: data.quantity,
                amount: data.amount,
              }))
              .filter((s) => s.quantity > 0), // Filter out 0 quantity sizes
          }))
          .filter((v) => v.totalQuantity > 0), // Filter out 0 quantity variants
      }))
      .filter((p) => p.totalQuantity > 0) // Filter out 0 quantity products
      .sort((a, b) => b.totalQuantity - a.totalQuantity); // Sort by quantity descending

    // Build adjustment summary
    const adjustmentSummary = [];
    for (const adjustment of pendingAdjustments) {
      const order = await ctx.db.get(adjustment.orderId);
      adjustmentSummary.push({
        adjustmentId: adjustment._id,
        orderId: adjustment.orderId,
        orderNumber: order?.orderNumber || `ORD-${adjustment.orderId.slice(-8)}`,
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason,
      });
    }

    // Generate invoice number: PI-{YYYYMMDD}-{slug}-{seq}
    const dateStr = new Date(args.periodEnd).toISOString().slice(0, 10).replace(/-/g, '');

    // Get count of existing invoices for this org to generate sequence
    const existingOrgInvoices = await ctx.db
      .query('payoutInvoices')
      .withIndex('by_organization', (q) => q.eq('organizationId', org._id))
      .collect();
    const sequence = (existingOrgInvoices.length + 1).toString().padStart(3, '0');
    const invoiceNumber = `PI-${dateStr}-${org.slug.toUpperCase().slice(0, 10)}-${sequence}`;

    // Create the invoice
    const invoiceId = await ctx.db.insert('payoutInvoices', {
      organizationId: org._id,
      invoiceNumber,
      organizationInfo: {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        logoUrl: org.logoUrl,
        bankDetails: org.payoutBankDetails,
      },
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      grossAmount,
      platformFeePercentage: feePercentage,
      platformFeeAmount,
      netAmount,
      totalAdjustmentAmount: adjustmentTotal !== 0 ? adjustmentTotal : undefined,
      adjustmentCount: pendingAdjustments.length > 0 ? pendingAdjustments.length : undefined,
      adjustmentSummary: adjustmentSummary.length > 0 ? adjustmentSummary : undefined,
      totalVoucherDiscount: totalVoucherDiscount > 0 ? totalVoucherDiscount : undefined,
      orderCount: allOrders.length,
      itemCount,
      orderSummary,
      productSummary,
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          changedAt: now,
          reason: 'Invoice generated by system',
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    invoicesCreated.push(invoiceId);

    // Mark all orders as included in this invoice (prevents double-counting)
    for (const order of allOrders) {
      await ctx.db.patch(order._id, {
        payoutInvoiceId: invoiceId,
        updatedAt: now,
      });
    }

    // Mark all adjustments as applied
    for (const adjustment of pendingAdjustments) {
      await ctx.db.patch(adjustment._id, {
        adjustmentInvoiceId: invoiceId,
        status: 'APPLIED',
        appliedAt: now,
      });
    }
  }

  // Update payout settings with last cron run info
  if (settings) {
    await ctx.db.patch(settings._id, {
      lastCronRunAt: now,
      lastCronRunStatus: 'SUCCESS',
      lastCronRunInvoicesGenerated: invoicesCreated.length,
      updatedAt: now,
    });
  }

  console.log(`[generatePayoutInvoices] Completed. Created ${invoicesCreated.length} invoices`);

  return {
    success: true,
    invoicesCreated: invoicesCreated.length,
    periodStart: args.periodStart,
    periodEnd: args.periodEnd,
  };
};
