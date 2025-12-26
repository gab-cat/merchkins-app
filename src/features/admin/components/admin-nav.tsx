'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { cn, buildR2PublicUrl } from '@/lib/utils';
import { R2Image } from '@/src/components/ui/r2-image';
import {
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingBag,
  CreditCard,
  Megaphone,
  Ticket,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  Building2,
  LucideIcon,
  DollarSign,
  BookOpen,
  Receipt,
  ListOrdered,
} from 'lucide-react';
import { useQuery } from 'convex-helpers/react/cache';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
  isActive?: boolean;
  index: number;
}

function NavItem({ href, icon: Icon, label, badge, isActive, index }: NavItemProps) {
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
        prefetch
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
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

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-semibold',
              isActive ? 'bg-[#adfc04] text-black' : 'bg-red-500 text-white animate-pulse'
            )}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
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

export function AdminNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  );
  const ticketUnread = useQuery(api.tickets.queries.index.getUnreadCount, organization?._id ? { organizationId: organization._id } : {});
  const refundPending = useQuery(api.refundRequests.queries.index.getPendingCount, organization?._id ? { organizationId: organization._id } : {});
  const payoutPending = useQuery(api.payouts.queries.index.getPendingCount, organization?._id ? { organizationId: organization._id } : {});
  const ticketsCount = ticketUnread?.count || 0;
  const refundsCount = refundPending?.count || 0;
  const payoutsCount = payoutPending?.count || 0;

  const isActive = (path: string) => {
    const basePath = pathname.split('?')[0];
    return basePath === path || basePath.startsWith(path + '/');
  };

  const mainNavItems = [
    { href: `/admin/overview${suffix}`, icon: LayoutDashboard, label: 'Overview' },
    { href: `/admin/products${suffix}`, icon: Package, label: 'Products' },
    { href: `/admin/categories${suffix}`, icon: Shapes, label: 'Categories' },
    { href: `/admin/orders${suffix}`, icon: ShoppingBag, label: 'Orders' },
    { href: `/admin/batches${suffix}`, icon: ListOrdered, label: 'Batches' },
    { href: `/admin/payments${suffix}`, icon: CreditCard, label: 'Payments' },
    { href: `/admin/refunds${suffix}`, icon: Receipt, label: 'Refunds', badge: refundsCount },
    { href: `/admin/vouchers${suffix}`, icon: Ticket, label: 'Vouchers' },
    { href: `/admin/payouts${suffix}`, icon: DollarSign, label: 'Payouts', badge: payoutsCount },
  ];

  const communicationItems = [
    { href: `/admin/announcements${suffix}`, icon: Megaphone, label: 'Announcements' },
    { href: `/admin/tickets${suffix}`, icon: Ticket, label: 'Tickets', badge: ticketsCount },
    { href: 'https://chat.merchkins.com', icon: MessageSquare, label: 'Chats' },
  ];

  const insightsItems = [
    { href: `/admin/analytics${suffix}`, icon: BarChart3, label: 'Analytics' },
    { href: `/admin/knowledge-base${suffix}`, icon: BookOpen, label: 'Knowledge Base' },
  ];

  const orgItems = [
    { href: `/admin/org-members${suffix}`, icon: Users, label: 'Members' },
    { href: `/admin/org-settings${suffix}`, icon: Settings, label: 'Settings' },
  ];

  // Helper to check if a value is an R2 key
  const isKey = (value?: string) => !!value && !/^https?:\/\//.test(value) && !value.startsWith('/');

  // Get logo key
  const logoKey = organization?.logo;
  const hasLogo = !!logoKey;

  return (
    <nav className="p-2 font-admin-body">
      {/* Organization Header */}
      {organization && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 pb-6 border-b">
          <Link href={`/admin/overview${suffix}`} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
              {hasLogo && logoKey ? (
                <R2Image
                  fileKey={logoKey}
                  alt={`${organization.name} logo`}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full"
                />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{organization.name}</div>
              <div className="text-xs text-muted-foreground truncate">/{organization.slug}</div>
            </div>
          </Link>
        </motion.div>
      )}

      <NavSection title="Dashboard" index={0}>
        {mainNavItems.map((item, i) => (
          <NavItem key={item.href} {...item} isActive={isActive(item.href.split('?')[0])} index={i} />
        ))}
      </NavSection>

      <NavSection title="Communication" index={1}>
        {communicationItems.map((item, i) => (
          <NavItem key={item.href} {...item} isActive={isActive(item.href.split('?')[0])} index={i + mainNavItems.length} />
        ))}
      </NavSection>

      <NavSection title="Insights" index={2}>
        {insightsItems.map((item, i) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isActive(item.href.split('?')[0])}
            index={i + mainNavItems.length + communicationItems.length}
          />
        ))}
      </NavSection>

      <NavSection title="Organization" index={3}>
        {orgItems.map((item, i) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={isActive(item.href.split('?')[0])}
            index={i + mainNavItems.length + communicationItems.length + insightsItems.length}
          />
        ))}
      </NavSection>
    </nav>
  );
}
