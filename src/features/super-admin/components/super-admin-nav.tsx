'use client';

import Link from 'next/link';
import { LayoutDashboard, Building2, Users, ShieldCheck, ScrollText, Megaphone, BarChart3 } from 'lucide-react';

export function SuperAdminNav() {
  return (
    <nav className="space-y-0.5">
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/overview">
        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
        <span>Overview</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/organizations">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span>Organizations</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/users">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>Users</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/permissions">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <span>Permissions</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/logs">
        <ScrollText className="h-4 w-4 text-muted-foreground" />
        <span>Logs</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/announcements">
        <Megaphone className="h-4 w-4 text-muted-foreground" />
        <span>Announcements</span>
      </Link>
      <Link className="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors hover:bg-secondary" href="/super-admin/analytics">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <span>Analytics</span>
      </Link>
    </nav>
  );
}
