import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Get comprehensive dashboard analytics with time-series data for charts
 */
export const getDashboardAnalyticsArgs = {
  organizationId: v.optional(v.id('organizations')),
  period: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'), v.literal('365d'))),
};

type Period = '7d' | '30d' | '90d' | '365d';

interface TimeSeriesPoint {
  date: string;
  timestamp: number;
  revenue: number;
  orders: number;
  views: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  amount: number;
}

export const getDashboardAnalyticsHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; period?: Period }) => {
  const period = args.period ?? '30d';
  const now = Date.now();

  // Calculate time range
  const periodDays = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
  };
  const days = periodDays[period];
  const startTime = now - days * 24 * 60 * 60 * 1000;
  const previousStartTime = startTime - days * 24 * 60 * 60 * 1000;

  // Fetch orders for current and previous period
  let ordersQuery;
  if (args.organizationId) {
    ordersQuery = ctx.db.query('orders').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    ordersQuery = ctx.db.query('orders');
  }

  const allOrders = await ordersQuery
    .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.gte(q.field('orderDate'), previousStartTime)))
    .collect();

  // Split into current and previous periods
  const currentOrders = allOrders.filter((o) => o.orderDate >= startTime);
  const previousOrders = allOrders.filter((o) => o.orderDate >= previousStartTime && o.orderDate < startTime);

  // Fetch products
  let productsQuery;
  if (args.organizationId) {
    productsQuery = ctx.db.query('products').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    productsQuery = ctx.db.query('products').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));
  }

  const products = await productsQuery.filter((q) => q.eq(q.field('isDeleted'), false)).collect();

  // Calculate current period metrics
  const currentRevenue = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const currentOrderCount = currentOrders.length;
  const currentViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const currentAvgOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

  // Calculate previous period metrics
  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const previousOrderCount = previousOrders.length;
  const previousAvgOrderValue = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

  // Calculate trends (percentage change)
  const revenueTrend = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const orderTrend = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;
  const avgOrderTrend = previousAvgOrderValue > 0 ? ((currentAvgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0;

  // Build time series data
  const timeSeries: TimeSeriesPoint[] = [];
  const groupByDays = days <= 30 ? 1 : days <= 90 ? 7 : 30;

  for (let i = 0; i < days; i += groupByDays) {
    const pointStart = now - (days - i) * 24 * 60 * 60 * 1000;
    const pointEnd = pointStart + groupByDays * 24 * 60 * 60 * 1000;

    const pointOrders = currentOrders.filter((o) => o.orderDate >= pointStart && o.orderDate < pointEnd);

    timeSeries.push({
      date: new Date(pointStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(groupByDays >= 30 && { year: '2-digit' }),
      }),
      timestamp: pointStart,
      revenue: pointOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      orders: pointOrders.length,
      views: 0, // Would need order_logs or analytics table for accurate views over time
    });
  }

  // Status breakdown
  const statusBreakdown: StatusBreakdown[] = [];
  const statusCounts: Record<string, { count: number; amount: number }> = {};

  for (const order of currentOrders) {
    if (!statusCounts[order.status]) {
      statusCounts[order.status] = { count: 0, amount: 0 };
    }
    statusCounts[order.status].count += 1;
    statusCounts[order.status].amount += order.totalAmount;
  }

  for (const [status, data] of Object.entries(statusCounts)) {
    statusBreakdown.push({ status, ...data });
  }

  // Payment status breakdown
  const paymentBreakdown: StatusBreakdown[] = [];
  const paymentCounts: Record<string, { count: number; amount: number }> = {};

  for (const order of currentOrders) {
    if (!paymentCounts[order.paymentStatus]) {
      paymentCounts[order.paymentStatus] = { count: 0, amount: 0 };
    }
    paymentCounts[order.paymentStatus].count += 1;
    paymentCounts[order.paymentStatus].amount += order.totalAmount;
  }

  for (const [status, data] of Object.entries(paymentCounts)) {
    paymentBreakdown.push({ status, ...data });
  }

  // Top products by orders
  const topProducts = products
    .sort((a, b) => b.totalOrders - a.totalOrders)
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      title: p.title,
      orders: p.totalOrders,
      revenue: p.variants.reduce((sum, v) => sum + v.price * v.orderCount, 0),
      imageUrl: p.imageUrl[0],
    }));

  // Category breakdown
  const categoryMap: Record<string, { name: string; count: number; orders: number; revenue: number }> = {};

  for (const product of products) {
    const catName = product.categoryInfo?.name || 'Uncategorized';
    if (!categoryMap[catName]) {
      categoryMap[catName] = { name: catName, count: 0, orders: 0, revenue: 0 };
    }
    categoryMap[catName].count += 1;
    categoryMap[catName].orders += product.totalOrders;
    categoryMap[catName].revenue += product.variants.reduce((sum, v) => sum + v.price * v.orderCount, 0);
  }

  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

  // Recent orders (last 5)
  const recentOrders = currentOrders
    .sort((a, b) => b.orderDate - a.orderDate)
    .slice(0, 5)
    .map((o) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      customer: `${o.customerInfo.firstName ?? ''} ${o.customerInfo.lastName ?? ''}`.trim() || o.customerInfo.email,
      amount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      date: o.orderDate,
    }));

  return {
    // Summary metrics
    summary: {
      totalRevenue: currentRevenue,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      totalOrders: currentOrderCount,
      orderTrend: Math.round(orderTrend * 10) / 10,
      avgOrderValue: Math.round(currentAvgOrderValue * 100) / 100,
      avgOrderTrend: Math.round(avgOrderTrend * 10) / 10,
      totalProducts: products.length,
      totalViews: currentViews,
      conversionRate: currentViews > 0 ? Math.round((currentOrderCount / currentViews) * 10000) / 100 : 0,
    },

    // Charts data
    timeSeries,
    statusBreakdown,
    paymentBreakdown,
    categoryBreakdown,

    // Lists
    topProducts,
    recentOrders,

    // Meta
    period,
    dateRange: {
      start: startTime,
      end: now,
    },
  };
};
