'use client';

import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Building2, Users, ShoppingBag, DollarSign, TrendingUp, Globe, Lock, EyeOff, UserCheck, ShieldCheck, Activity } from 'lucide-react';
import { MetricCard, MetricGrid, ChartCard, AreaChartComponent, PieChartComponent, PageHeader } from '@/src/components/admin';

// Chart colors using theme
const CHART_COLORS = {
  primary: '#1d43d8',
  neon: '#adfc04',
  secondary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export default function SuperAdminOverviewPage() {
  const orgAnalytics = useQuery(api.organizations.queries.index.getOrganizationAnalytics, {});
  const userAnalytics = useQuery(api.users.queries.index.getUserAnalytics, {});

  const loading = orgAnalytics === undefined || userAnalytics === undefined;

  // Mock growth data for charts (replace with real API later)
  const platformGrowthData = [
    { name: 'Jan', organizations: 12, users: 150, orders: 320 },
    { name: 'Feb', organizations: 18, users: 220, orders: 480 },
    { name: 'Mar', organizations: 25, users: 310, orders: 620 },
    { name: 'Apr', organizations: 32, users: 420, orders: 850 },
    { name: 'May', organizations: 38, users: 520, orders: 1100 },
    { name: 'Jun', organizations: 45, users: 650, orders: 1350 },
  ];

  const orgTypeData = [
    { name: 'Public', value: orgAnalytics?.publicOrganizations ?? 0, fill: CHART_COLORS.primary },
    { name: 'Private', value: orgAnalytics?.privateOrganizations ?? 0, fill: CHART_COLORS.secondary },
    { name: 'Secret', value: orgAnalytics?.secretOrganizations ?? 0, fill: CHART_COLORS.warning },
  ];

  const userRoleData = [
    {
      name: 'Users',
      value:
        (userAnalytics?.totalUsers ?? 0) - (userAnalytics?.staffCount ?? 0) - (userAnalytics?.merchantCount ?? 0) - (userAnalytics?.adminCount ?? 0),
      fill: CHART_COLORS.primary,
    },
    { name: 'Merchants', value: userAnalytics?.merchantCount ?? 0, fill: CHART_COLORS.neon },
    { name: 'Admins', value: userAnalytics?.adminCount ?? 0, fill: CHART_COLORS.secondary },
    { name: 'Staff', value: userAnalytics?.staffCount ?? 0, fill: CHART_COLORS.success },
  ];

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader title="Platform Overview" description="Monitor your entire platform from one place" icon={<Activity className="h-5 w-5" />} />

      {/* Primary Metrics */}
      <MetricGrid columns={4}>
        <MetricCard
          title="Total Organizations"
          value={orgAnalytics?.totalOrganizations ?? 0}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          loading={loading}
          variant="gradient"
        />
        <MetricCard
          title="Total Users"
          value={userAnalytics?.totalUsers ?? 0}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          loading={loading}
          variant="gradient"
        />
        <MetricCard
          title="Total Orders"
          value={orgAnalytics?.totalOrders ?? 0}
          icon={ShoppingBag}
          trend={{ value: 15, isPositive: true }}
          loading={loading}
          variant="gradient"
        />
        <MetricCard
          title="Total Revenue"
          value={userAnalytics?.totalRevenue ?? 0}
          icon={DollarSign}
          prefix="₱"
          trend={{ value: 22, isPositive: true }}
          loading={loading}
          variant="gradient"
        />
      </MetricGrid>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Platform Growth" description="Organizations, users & orders over time" className="lg:col-span-2">
          <AreaChartComponent
            data={platformGrowthData}
            dataKeys={[
              { key: 'organizations', name: 'Organizations', color: CHART_COLORS.primary },
              { key: 'users', name: 'Users', color: CHART_COLORS.neon },
              { key: 'orders', name: 'Orders', color: CHART_COLORS.secondary },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Organization Types" description="Distribution by visibility">
          <PieChartComponent data={orgTypeData} height={280} />
        </ChartCard>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold font-admin-heading flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Organization Breakdown
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <Globe className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold font-admin-heading">{orgAnalytics?.publicOrganizations ?? 0}</p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/10">
                <Lock className="h-5 w-5 mx-auto mb-1 text-secondary-foreground" />
                <p className="text-2xl font-bold font-admin-heading">{orgAnalytics?.privateOrganizations ?? 0}</p>
                <p className="text-xs text-muted-foreground">Private</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning/10">
                <EyeOff className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                <p className="text-2xl font-bold font-admin-heading">{orgAnalytics?.secretOrganizations ?? 0}</p>
                <p className="text-xs text-muted-foreground">Secret</p>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-semibold">{orgAnalytics?.totalMembers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <span className="text-muted-foreground">Total Admins</span>
                <span className="font-semibold">{orgAnalytics?.totalAdmins ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-semibold">{orgAnalytics?.totalProducts ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-semibold">{orgAnalytics?.totalOrders ?? 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold font-admin-heading flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              User Breakdown
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-admin-heading">{userAnalytics?.activeUsers ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-admin-heading">{userAnalytics?.staffCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Staff Members</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              {[
                { label: 'Merchants', value: userAnalytics?.merchantCount ?? 0, color: 'bg-[#adfc04]' },
                { label: 'Admins', value: userAnalytics?.adminCount ?? 0, color: 'bg-primary' },
                {
                  label: 'Regular Users',
                  value:
                    (userAnalytics?.totalUsers ?? 0) -
                    (userAnalytics?.staffCount ?? 0) -
                    (userAnalytics?.merchantCount ?? 0) -
                    (userAnalytics?.adminCount ?? 0),
                  color: 'bg-muted-foreground',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-neon/10">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-brand-neon" />
                <span className="text-sm">Total Platform Revenue</span>
              </div>
              <span className="font-bold font-admin-heading text-lg">₱{(userAnalytics?.totalRevenue ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Role Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="User Role Distribution" description="Breakdown by user type">
          <PieChartComponent data={userRoleData.filter((d) => d.value > 0)} height={250} />
        </ChartCard>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-5"
        >
          <h3 className="font-semibold font-admin-heading mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Platform Health
          </h3>
          <div className="space-y-4">
            {[
              {
                label: 'Avg Members per Org',
                value: orgAnalytics?.totalOrganizations ? Math.round((orgAnalytics?.totalMembers ?? 0) / orgAnalytics.totalOrganizations) : 0,
              },
              {
                label: 'Avg Products per Org',
                value: orgAnalytics?.totalOrganizations ? Math.round((orgAnalytics?.totalProducts ?? 0) / orgAnalytics.totalOrganizations) : 0,
              },
              {
                label: 'Avg Orders per User',
                value: userAnalytics?.totalUsers ? Math.round((userAnalytics?.totalOrders ?? 0) / userAnalytics.totalUsers) : 0,
              },
              {
                label: 'Avg Revenue per Order',
                value: userAnalytics?.totalOrders ? Math.round((userAnalytics?.totalRevenue ?? 0) / userAnalytics.totalOrders) : 0,
                prefix: '₱',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-lg font-bold font-admin-heading">
                  {stat.prefix}
                  {stat.value.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
