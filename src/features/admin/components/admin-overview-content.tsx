'use client';

import { useQuery } from 'convex-helpers/react/cache/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { Package, Users, Star, Megaphone, TrendingUp, ShoppingBag, type LucideIcon } from 'lucide-react';

interface StatProps {
  title: string;
  value: string;
}

function Stat({ title, value, icon: Icon, trend }: StatProps & { icon?: LucideIcon; trend?: string }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminOverviewContent() {
  const products = useQuery(api.products.queries.index.getProducts, { limit: 5 });
  const announcements = useQuery(api.announcements.queries.index.getAnnouncements, {
    targetAudience: 'ADMINS',
    limit: 5,
  });
  const loading = products === undefined || announcements === undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">Monitor your platform performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-secondary rounded" />
                    <div className="h-6 w-16 bg-secondary rounded" />
                  </div>
                  <div className="h-10 w-10 bg-secondary rounded-lg" />
                </div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-secondary rounded" />
                    <div className="h-6 w-12 bg-secondary rounded" />
                  </div>
                  <div className="h-10 w-10 bg-secondary rounded-lg" />
                </div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-secondary rounded" />
                    <div className="h-6 w-14 bg-secondary rounded" />
                  </div>
                  <div className="h-10 w-10 bg-secondary rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Stat title="Total Products" value={String(products?.total ?? 0)} icon={Package} trend="+12% this month" />
            <Stat
              title="Product Variants"
              value={String(products?.products.reduce((count, p) => count + p.totalVariants, 0) ?? 0)}
              icon={ShoppingBag}
              trend="+8% this week"
            />
            <Stat
              title="Average Rating"
              value={String(
                Math.round(((products?.products.reduce((sum, p) => sum + p.rating, 0) ?? 0) / Math.max(1, products?.products.length ?? 1)) * 10) / 10
              )}
              icon={Star}
              trend="4.7/5 overall"
            />
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {new Array(3).fill(null).map((_, i) => (
                  <div key={`skeleton-${i}`} className="rounded-lg border p-3 animate-pulse">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-20 rounded bg-secondary" />
                        <div className="h-4 w-32 rounded bg-secondary" />
                      </div>
                      <div className="h-3 w-16 rounded bg-secondary" />
                    </div>
                    <div className="h-3 w-full rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : (announcements?.announcements || []).length > 0 ? (
              <div className="space-y-3">
                {(announcements?.announcements || []).map((a: Doc<'announcements'>) => (
                  <div key={a._id} className="rounded-lg border bg-card p-4 shadow-sm hover:bg-accent/30 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {a.category || 'general'}
                        </Badge>
                        <div className="truncate font-semibold text-sm" title={a.title}>
                          {a.title}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No announcements yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3">
              <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left group">
                <Package className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-sm">Add Product</div>
                  <div className="text-xs text-muted-foreground">Create a new product listing</div>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left group">
                <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-sm">Manage Users</div>
                  <div className="text-xs text-muted-foreground">View and edit user accounts</div>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 text-left group">
                <Megaphone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-sm">Send Announcement</div>
                  <div className="text-xs text-muted-foreground">Broadcast to all users</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminOverviewContent;
