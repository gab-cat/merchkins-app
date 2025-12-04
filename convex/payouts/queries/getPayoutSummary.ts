import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getPayoutSummaryArgs = {
  periodStart: v.optional(v.number()),
  periodEnd: v.optional(v.number()),
};

export const getPayoutSummaryHandler = async (
  ctx: QueryCtx,
  args: {
    periodStart?: number;
    periodEnd?: number;
  }
) => {
  // Get all invoices within the period (or all if no period specified)
  let invoices = await ctx.db.query('payoutInvoices').collect();

  // Filter by period if specified
  if (args.periodStart !== undefined) {
    invoices = invoices.filter((inv) => inv.periodStart >= args.periodStart!);
  }
  if (args.periodEnd !== undefined) {
    invoices = invoices.filter((inv) => inv.periodEnd <= args.periodEnd!);
  }

  // Calculate summary statistics
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING').length;
  const processingInvoices = invoices.filter((inv) => inv.status === 'PROCESSING').length;
  const paidInvoices = invoices.filter((inv) => inv.status === 'PAID').length;
  const cancelledInvoices = invoices.filter((inv) => inv.status === 'CANCELLED').length;

  // Financial totals
  const totalGrossAmount = invoices.reduce((sum, inv) => sum + inv.grossAmount, 0);
  const totalPlatformFees = invoices.reduce((sum, inv) => sum + inv.platformFeeAmount, 0);
  const totalNetAmount = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalOrderCount = invoices.reduce((sum, inv) => sum + inv.orderCount, 0);

  // Paid vs pending amounts
  const paidAmount = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.netAmount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'PENDING' || inv.status === 'PROCESSING')
    .reduce((sum, inv) => sum + inv.netAmount, 0);

  // Get unique organizations
  const uniqueOrgIds = [...new Set(invoices.map((inv) => inv.organizationId))];

  // Recent invoices (last 5)
  const recentInvoices = invoices.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  // Top organizations by gross amount (this period)
  const orgTotals = new Map<string, { name: string; slug: string; grossAmount: number; netAmount: number }>();
  for (const inv of invoices) {
    const key = inv.organizationId;
    const existing = orgTotals.get(key);
    if (existing) {
      existing.grossAmount += inv.grossAmount;
      existing.netAmount += inv.netAmount;
    } else {
      orgTotals.set(key, {
        name: inv.organizationInfo.name,
        slug: inv.organizationInfo.slug,
        grossAmount: inv.grossAmount,
        netAmount: inv.netAmount,
      });
    }
  }

  const topOrganizations = [...orgTotals.values()].sort((a, b) => b.grossAmount - a.grossAmount).slice(0, 5);

  return {
    totalInvoices,
    pendingInvoices,
    processingInvoices,
    paidInvoices,
    cancelledInvoices,
    totalGrossAmount,
    totalPlatformFees,
    totalNetAmount,
    totalOrderCount,
    paidAmount,
    pendingAmount,
    uniqueOrganizations: uniqueOrgIds.length,
    recentInvoices,
    topOrganizations,
  };
};
