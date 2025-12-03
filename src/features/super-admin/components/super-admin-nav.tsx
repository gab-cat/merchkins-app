'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Building2, Users, ShieldCheck, ScrollText, Megaphone, BarChart3, LucideIcon } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  index: number;
}

function NavItem({ href, icon: Icon, label, isActive, index }: NavItemProps) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03, duration: 0.2 }}>
      <Link
        className={cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:translate-x-1'
        )}
        href={href}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="superAdminActiveNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#adfc04] rounded-r-full"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}

        <Icon
          className={cn(
            'h-4 w-4 transition-colors shrink-0',
            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'
          )}
        />

        <span className="truncate">{label}</span>
      </Link>
    </motion.div>
  );
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  index: number;
}

function NavSection({ title, children, index }: NavSectionProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }} className="mt-6 first:mt-0">
      <div className="px-3 mb-2">
        <h3 className="text-[10px] uppercase text-muted-foreground/70 font-semibold tracking-wider">{title}</h3>
      </div>
      <div className="space-y-0.5">{children}</div>
    </motion.div>
  );
}

export function SuperAdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const platformItems = [
    { href: '/super-admin/overview', icon: LayoutDashboard, label: 'Overview' },
    { href: '/super-admin/organizations', icon: Building2, label: 'Organizations' },
    { href: '/super-admin/users', icon: Users, label: 'Users' },
  ];

  const securityItems = [
    { href: '/super-admin/permissions', icon: ShieldCheck, label: 'Permissions' },
    { href: '/super-admin/logs', icon: ScrollText, label: 'Logs' },
  ];

  const engagementItems = [
    { href: '/super-admin/announcements', icon: Megaphone, label: 'Announcements' },
    { href: '/super-admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className="p-2 font-admin-body">
      <NavSection title="Platform" index={0}>
        {platformItems.map((item, i) => (
          <NavItem key={item.href} {...item} isActive={isActive(item.href)} index={i} />
        ))}
      </NavSection>

      <NavSection title="Security" index={1}>
        {securityItems.map((item, i) => (
          <NavItem key={item.href} {...item} isActive={isActive(item.href)} index={i + platformItems.length} />
        ))}
      </NavSection>

      <NavSection title="Engagement" index={2}>
        {engagementItems.map((item, i) => (
          <NavItem key={item.href} {...item} isActive={isActive(item.href)} index={i + platformItems.length + securityItems.length} />
        ))}
      </NavSection>
    </nav>
  );
}
