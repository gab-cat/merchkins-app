'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuperAdminOverviewPage() {
  const orgAnalytics = useQuery(api.organizations.queries.index.getOrganizationAnalytics, {});
  const userAnalytics = useQuery(api.users.queries.index.getUserAnalytics, {});

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform organizations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Total: {orgAnalytics?.totalOrganizations ?? 0}</div>
          <div>Public: {orgAnalytics?.publicOrganizations ?? 0}</div>
          <div>Private: {orgAnalytics?.privateOrganizations ?? 0}</div>
          <div>Secret: {orgAnalytics?.secretOrganizations ?? 0}</div>
          <div>Total members: {orgAnalytics?.totalMembers ?? 0}</div>
          <div>Total admins: {orgAnalytics?.totalAdmins ?? 0}</div>
          <div>Total products: {orgAnalytics?.totalProducts ?? 0}</div>
          <div>Total orders: {orgAnalytics?.totalOrders ?? 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Platform users</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Total: {userAnalytics?.totalUsers ?? 0}</div>
          <div>Active (range): {userAnalytics?.activeUsers ?? 0}</div>
          <div>Staff: {userAnalytics?.staffCount ?? 0}</div>
          <div>Merchants: {userAnalytics?.merchantCount ?? 0}</div>
          <div>Admins: {userAnalytics?.adminCount ?? 0}</div>
          <div>Total orders: {userAnalytics?.totalOrders ?? 0}</div>
          <div>Total revenue: ${userAnalytics?.totalRevenue ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
