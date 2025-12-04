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
    // Note: We filter by orderDate (when order was placed), not createdAt (when record was created)
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_organization', (q) => q.eq('organizationId', org._id))
      .filter((q) =>
        q.and(
          q.eq(q.field('isDeleted'), false),
          q.eq(q.field('paymentStatus'), 'PAID'),
          q.gte(q.field('orderDate'), args.periodStart),
          q.lte(q.field('orderDate'), args.periodEnd)
        )
      )
      .collect();

    console.log(`[generatePayoutInvoices] ${org.name}: Found ${orders.length} PAID orders in period`);

    if (orders.length === 0) {
      // No paid orders in this period - skip
      continue;
    }

    // Calculate totals
    const grossAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const itemCount = orders.reduce((sum, order) => sum + order.itemCount, 0);

    // Check minimum payout threshold
    if (grossAmount < minimumPayout) {
      console.log(`[generatePayoutInvoices] ${org.name}: Skipping - grossAmount ${grossAmount} < minimumPayout ${minimumPayout}`);
      continue;
    }

    // Get platform fee percentage (org custom or default)
    const feePercentage = org.platformFeePercentage ?? defaultFeePercentage;
    const platformFeeAmount = Math.round(((grossAmount * feePercentage) / 100) * 100) / 100;
    const netAmount = grossAmount - platformFeeAmount;

    console.log(`[generatePayoutInvoices] ${org.name}: Creating invoice`, {
      grossAmount,
      platformFeeAmount,
      netAmount,
      orderCount: orders.length,
    });

    // Build order summary
    const orderSummary = orders.map((order) => ({
      orderId: order._id,
      orderNumber: order.orderNumber || `ORD-${order._id.slice(-8)}`,
      orderDate: order.orderDate,
      customerName: `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() || order.customerInfo.email,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
    }));

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
      orderCount: orders.length,
      itemCount,
      orderSummary,
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
