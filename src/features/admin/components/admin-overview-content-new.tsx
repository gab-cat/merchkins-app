'use client';

import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import {
  Package,
  Star,
  TrendingUp,
  ShoppingBag,
  Megaphone,
  Users,
  CreditCard,
  BarChart3,
  ArrowRight,
  ShoppingCart,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import {
  MetricCard,
  MetricGrid,
  ChartCard,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  AdminBentoGrid,
  AdminBentoItem,
  AdminBentoFeatured,
  QuickActionCard,
  PageHeader,
  StatusBadge,
} from '@/src/components/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock chart data - in production, this would come from your API
const salesChartData = [
  { name: 'Mon', sales: 4000, orders: 24 },
  { name: 'Tue', sales: 3000, orders: 18 },
  { name: 'Wed', sales: 5000, orders: 32 },
  { name: 'Thu', sales: 2780, orders: 15 },
  { name: 'Fri', sales: 1890, orders: 12 },
  { name: 'Sat', sales: 6390, orders: 45 },
  { name: 'Sun', sales: 3490, orders: 22 },
];

const orderStatusData = [
  { name: 'Pending', value: 12 },
  { name: 'Processing', value: 28 },
  { name: 'Ready', value: 15 },
  { name: 'Delivered', value: 45 },
];

const topProductsData = [
  { name: 'T-Shirt Basic', sales: 120 },
  { name: 'Hoodie Premium', sales: 98 },
  { name: 'Cap Logo', sales: 76 },
  { name: 'Mug Custom', sales: 54 },
  { name: 'Tote Bag', sales: 42 },
];

function AnnouncementCard({ announcement }: { announcement: Doc<'announcements'> }) {
  return (
    <motion.div className="rounded-lg border bg-card p-4 hover:bg-accent/30 hover:shadow-md transition-all duration-200 group" whileHover={{ x: 4 }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
            {announcement.category || 'general'}
          </Badge>
          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{announcement.title}</h4>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(announcement.publishedAt).toLocaleDateString()}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{announcement.content}</p>
    </motion.div>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  suffix: string;
}

function QuickAction({ icon: Icon, title, description, href, suffix }: QuickActionProps) {
  return (
    <Link href={`${href}${suffix}`}>
      <motion.div
        className="flex items-center gap-3 p-4 rounded-xl border hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group cursor-pointer"
        whileHover={{ x: 4 }}
      >
        <motion.div
          className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm group-hover:text-primary transition-colors">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </motion.div>
    </Link>
  );
}

export function AdminOverviewContentNew() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const products = useQuery(api.products.queries.index.getProducts, { limit: 5 });
  const announcements = useQuery(api.announcements.queries.index.getAnnouncements, {
    targetAudience: 'ADMINS',
    limit: 5,
  });

  const loading = products === undefined || announcements === undefined;

  // Calculate metrics
  const totalProducts = products?.total ?? 0;
  const totalVariants = products?.products.reduce((count, p) => count + p.totalVariants, 0) ?? 0;
  const avgRating = products?.products.length
    ? Math.round((products.products.reduce((sum, p) => sum + p.rating, 0) / products.products.length) * 10) / 10
    : 0;
  const totalOrders = products?.products.reduce((count, p) => count + p.totalOrders, 0) ?? 0;
  const totalViews = products?.products.reduce((count, p) => count + (p.views ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6 font-admin-body">
      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        description="Monitor your store performance and activity"
        icon={<TrendingUp className="h-5 w-5" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/analytics${suffix}`}>
                <BarChart3 className="h-4 w-4 mr-1" />
                View Analytics
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <MetricGrid columns={4}>
        <MetricCard
          title="Total Products"
          value={loading ? '—' : totalProducts}
          icon={Package}
          trend={{ value: 12, label: 'this month' }}
          loading={loading}
          variant="gradient"
        />
        <MetricCard
          title="Product Variants"
          value={loading ? '—' : totalVariants}
          icon={ShoppingBag}
          trend={{ value: 8, label: 'this week' }}
          loading={loading}
        />
        <MetricCard
          title="Total Orders"
          value={loading ? '—' : totalOrders}
          icon={ShoppingCart}
          trend={{ value: 15, label: 'this month' }}
          loading={loading}
        />
        <MetricCard
          title="Average Rating"
          value={loading ? '—' : `${avgRating}/5`}
          icon={Star}
          trend={{ value: 2, label: 'improvement' }}
          loading={loading}
        />
      </MetricGrid>

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Sales Overview" description="Weekly sales performance" className="lg:col-span-2" loading={loading}>
          <AreaChartComponent data={salesChartData} dataKeys={[{ key: 'sales', name: 'Sales (₱)', color: '#1d43d8' }]} height={280} />
        </ChartCard>

        <ChartCard title="Order Status" description="Distribution by status" loading={loading}>
          <PieChartComponent data={orderStatusData} height={280} innerRadius={50} />
        </ChartCard>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Announcements */}
        <AdminBentoItem variant="default" className="p-0">
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold font-admin-heading">Recent Announcements</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/announcements${suffix}`}>
                  View all
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[320px] overflow-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-lg border p-4 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-16 rounded bg-muted" />
                    <div className="h-4 w-32 rounded bg-muted" />
                  </div>
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              ))
            ) : (announcements?.announcements || []).length > 0 ? (
              (announcements?.announcements || []).map((a: Doc<'announcements'>, index: number) => (
                <motion.div key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                  <AnnouncementCard announcement={a} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Megaphone className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              </div>
            )}
          </div>
        </AdminBentoItem>

        {/* Quick Actions */}
        <AdminBentoItem variant="default" className="p-0">
          <div className="p-5 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold font-admin-heading">Quick Actions</h3>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <QuickAction icon={Package} title="Add Product" description="Create a new product listing" href="/admin/products/new" suffix={suffix} />
            <QuickAction icon={ShoppingBag} title="View Orders" description="Manage customer orders" href="/admin/orders" suffix={suffix} />
            <QuickAction icon={CreditCard} title="Verify Payments" description="Process pending payments" href="/admin/payments" suffix={suffix} />
            <QuickAction
              icon={Megaphone}
              title="Send Announcement"
              description="Broadcast to your customers"
              href="/admin/announcements/new"
              suffix={suffix}
            />
          </div>
        </AdminBentoItem>
      </div>

      {/* Top Products */}
      <ChartCard
        title="Top Products"
        description="Best performing products by sales"
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/products${suffix}`}>
              View all products
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        }
      >
        <BarChartComponent data={topProductsData} dataKeys={[{ key: 'sales', name: 'Sales', color: '#1d43d8' }]} layout="vertical" height={220} />
      </ChartCard>
    </div>
  );
}

export default AdminOverviewContentNew;
