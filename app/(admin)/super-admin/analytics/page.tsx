'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Timeframe = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export default function SuperAdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');

  const productAnalytics = useQuery(api.products.queries.index.getProductAnalytics, {
    timeframe,
  });
  const orderAnalytics = useQuery(api.orders.queries.index.getOrderAnalytics, {});

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium" htmlFor="tf">
          Timeframe
        </label>
        <select
          id="tf"
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
          <option value="year">Year</option>
          <option value="all">All</option>
        </select>
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() => {
              const rows: Array<Record<string, unknown>> = [];
              if (productAnalytics) {
                rows.push({ section: 'products', ...productAnalytics });
              }
              if (orderAnalytics) {
                rows.push({ section: 'orders', ...orderAnalytics });
              }
              const headers = Array.from(
                rows.reduce((set, r) => {
                  Object.keys(r).forEach((k) => set.add(k));
                  return set;
                }, new Set<string>())
              );
              const csv = [
                headers.join(','),
                ...rows.map((r) => headers.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(',')),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analytics-${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total products</div>
              <div className="text-lg font-semibold">{productAnalytics?.totalProducts ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total views</div>
              <div className="text-lg font-semibold">{productAnalytics?.totalViews ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total orders</div>
              <div className="text-lg font-semibold">{productAnalytics?.totalOrders ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total revenue</div>
              <div className="text-lg font-semibold">{productAnalytics?.totalRevenue ?? '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total orders</div>
              <div className="text-lg font-semibold">{orderAnalytics?.orderCount ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total revenue</div>
              <div className="text-lg font-semibold">{orderAnalytics?.totalRevenue ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Average order value</div>
              <div className="text-lg font-semibold">
                {orderAnalytics && orderAnalytics.orderCount
                  ? Math.round((orderAnalytics.totalRevenue / orderAnalytics.orderCount) * 100) / 100
                  : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
