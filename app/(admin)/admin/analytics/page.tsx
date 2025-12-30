'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Eye, Package, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { MetricCard, MetricGrid } from '@/src/components/admin/metric-card';
import { ChartCard, AreaChartComponent, BarChartComponent, PieChartComponent, CHART_COLORS } from '@/src/components/admin/chart-card';
import { OrderStatusBadge, PaymentStatusBadge } from '@/src/components/admin/status-badge';

// UI Components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Period = '7d' | '30d' | '90d' | '365d';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Loading skeleton component
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-admin-body">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl" />
        <div className="h-80 bg-muted rounded-xl" />
      </div>

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const [period, setPeriod] = useState<Period>('30d');

  // Get organization
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  // Get dashboard analytics
  const analytics = useQuery(
    api.orders.queries.index.getDashboardAnalytics,
    orgSlug ? (organization === undefined ? 'skip' : { organizationId: organization?._id, period }) : { period }
  );

  const loading = analytics === undefined || (orgSlug && organization === undefined);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const { summary, timeSeries, statusBreakdown, categoryBreakdown, topProducts, recentOrders } = analytics;

  // Prepare chart data
  const revenueChartData = timeSeries.map((point: any) => ({
    name: point.date,
    revenue: point.revenue,
    orders: point.orders,
  }));

  const statusChartData = statusBreakdown.map((item: any) => ({
    name: item.status,
    value: item.count,
    amount: item.amount,
  }));

  const categoryChartData = categoryBreakdown.slice(0, 6).map((item: any) => ({
    name: item.name,
    value: item.revenue,
    count: item.count,
  }));

  const periodLabels: Record<Period, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '365d': 'Last year',
  };

  return (
    <div className="font-admin-body space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your store performance and insights"
        icon={<BarChart3 className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: `/admin/overview${orgSlug ? `?org=${orgSlug}` : ''}` }, { label: 'Analytics' }]}
        actions={
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Key Metrics */}
      <MetricGrid columns={4}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          trend={{
            value: summary.revenueTrend,
            label: 'vs previous period',
          }}
          variant="gradient"
        />
        <MetricCard
          title="Total Orders"
          value={summary.totalOrders}
          icon={ShoppingCart}
          trend={{
            value: summary.orderTrend,
            label: 'vs previous period',
          }}
        />
        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(summary.avgOrderValue)}
          icon={TrendingUp}
          trend={{
            value: summary.avgOrderTrend,
            label: 'vs previous period',
          }}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          icon={Users}
          description={`${formatNumber(summary.totalViews)} views`}
        />
      </MetricGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <ChartCard title="Revenue Over Time" description={periodLabels[period]} className="lg:col-span-1">
          <AreaChartComponent data={revenueChartData} dataKeys={[{ key: 'revenue', name: 'Revenue', color: CHART_COLORS.primary }]} height={280} />
        </ChartCard>

        {/* Orders Over Time */}
        <ChartCard title="Orders Over Time" description={periodLabels[period]}>
          <BarChartComponent data={revenueChartData} dataKeys={[{ key: 'orders', name: 'Orders', color: CHART_COLORS.secondary }]} height={280} />
        </ChartCard>
      </div>

      {/* Status & Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <ChartCard title="Order Status" description="Distribution by status">
          <PieChartComponent data={statusChartData} height={240} innerRadius={50} />
        </ChartCard>

        {/* Category Performance */}
        <ChartCard title="Category Performance" description="Revenue by category" className="lg:col-span-2">
          <BarChartComponent
            data={categoryChartData}
            dataKeys={[{ key: 'value', name: 'Revenue', color: CHART_COLORS.primary }]}
            height={240}
            layout="horizontal"
          />
        </ChartCard>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border bg-card">
          <div className="px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold font-admin-heading">Top Products</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Best performing products</p>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No product data available</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product: any, index: number) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-4">{index + 1}</span>
                          <span className="font-medium truncate max-w-[200px]">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{product.orders}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border bg-card">
          <div className="px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold font-admin-heading">Recent Orders</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Latest customer orders</p>
              </div>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="p-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{order.orderNumber ? `#${order.orderNumber}` : 'Order'}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span className="truncate max-w-[150px]">{order.customer}</span>
                        <span>•</span>
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">{formatCurrency(order.amount)}</div>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-admin-heading">{summary.totalProducts}</p>
              <p className="text-xs text-muted-foreground">Active Products</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-admin-heading">{formatNumber(summary.totalViews)}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold font-admin-heading">{categoryBreakdown.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${summary.revenueTrend >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
            >
              {summary.revenueTrend >= 0 ? (
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold font-admin-heading ${summary.revenueTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {summary.revenueTrend >= 0 ? '+' : ''}
                {summary.revenueTrend}%
              </p>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
