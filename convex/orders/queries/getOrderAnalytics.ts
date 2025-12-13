import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getOrderAnalyticsArgs = {
  organizationId: v.optional(v.id('organizations')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
};

export const getOrderAnalyticsHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; dateFrom?: number; dateTo?: number }) => {
  let query;
  if (args.organizationId) {
    query = ctx.db.query('orders').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    query = ctx.db.query('orders');
  }

  const filtered = query.filter((q) => {
    const cond: any[] = [q.eq(q.field('isDeleted'), false)];
    if (args.dateFrom !== undefined) cond.push(q.gte(q.field('orderDate'), args.dateFrom));
    if (args.dateTo !== undefined) cond.push(q.lte(q.field('orderDate'), args.dateTo));
    return q.and(...cond);
  });

  const orders = await filtered.collect();

  // Helper function to check if order should be excluded from revenue calculations
  const isExcludedFromRevenue = (order: typeof orders[0]) => {
    return order.status === 'CANCELLED' || order.paymentStatus === 'REFUNDED';
  };

  const totalsByStatus: Record<string, number> = {};
  const totalsByPayment: Record<string, number> = {};
  let totalRevenue = 0;
  let orderCount = 0;

  for (const o of orders) {
    orderCount += 1;
    totalsByStatus[o.status] = (totalsByStatus[o.status] || 0) + 1;
    totalsByPayment[o.paymentStatus] = (totalsByPayment[o.paymentStatus] || 0) + 1;
    // Only include revenue if order is not excluded
    if (!isExcludedFromRevenue(o)) {
      totalRevenue += o.totalAmount;
    }
  }

  // Top customers by spend (only counting non-excluded orders)
  const byCustomer: Record<string, { customerId: string; amount: number; count: number; name: string }> = {};
  for (const o of orders) {
    // Only count orders that are not excluded from revenue
    if (!isExcludedFromRevenue(o)) {
      const key = String(o.customerId);
      const name = `${o.customerInfo.firstName ?? ''} ${o.customerInfo.lastName ?? ''}`.trim() || o.customerInfo.email;
      if (!byCustomer[key]) byCustomer[key] = { customerId: key, amount: 0, count: 0, name };
      byCustomer[key].amount += o.totalAmount;
      byCustomer[key].count += 1;
    }
  }
  const topCustomers = Object.values(byCustomer)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    orderCount,
    totalRevenue,
    totalsByStatus,
    totalsByPayment,
    topCustomers,
  };
};
