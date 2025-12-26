'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
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
  Plus,
  Edit,
  LucideIcon,
  ListOrdered,
  Receipt,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface SearchItem {
  id: string;
  label: string;
  keywords: string[];
  href: string;
  icon: LucideIcon;
  category: string;
  description?: string;
}

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug?: string;
}

export function AdminCommandPalette({ open, onOpenChange, orgSlug }: AdminCommandPaletteProps) {
  const router = useRouter();
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  // Define searchable items
  const searchItems: SearchItem[] = useMemo(
    () => [
      // Dashboard Pages
      {
        id: 'overview',
        label: 'Overview',
        keywords: ['overview', 'dashboard', 'home', 'main'],
        href: `/admin/overview${suffix}`,
        icon: LayoutDashboard,
        category: 'Dashboard',
        description: 'View dashboard overview',
      },
      {
        id: 'products',
        label: 'Products',
        keywords: ['products', 'product', 'items', 'inventory'],
        href: `/admin/products${suffix}`,
        icon: Package,
        category: 'Dashboard',
        description: 'Manage products',
      },
      {
        id: 'categories',
        label: 'Categories',
        keywords: ['categories', 'category', 'tags', 'taxonomy'],
        href: `/admin/categories${suffix}`,
        icon: Shapes,
        category: 'Dashboard',
        description: 'Manage categories',
      },
      {
        id: 'orders',
        label: 'Orders',
        keywords: ['orders', 'order', 'purchases', 'transactions'],
        href: `/admin/orders${suffix}`,
        icon: ShoppingBag,
        category: 'Dashboard',
        description: 'View and manage orders',
      },
      {
        id: 'payments',
        label: 'Payments',
        keywords: ['payments', 'payment', 'billing', 'revenue'],
        href: `/admin/payments${suffix}`,
        icon: CreditCard,
        category: 'Dashboard',
        description: 'View payment information',
      },
      {
        id: 'batches',
        label: 'Batches',
        keywords: ['batches', 'batch', 'bulk', 'group orders'],
        href: `/admin/batches${suffix}`,
        icon: ListOrdered,
        category: 'Dashboard',
        description: 'Manage order batches',
      },
      {
        id: 'refunds',
        label: 'Refunds',
        keywords: ['refunds', 'refund', 'returns', 'money back'],
        href: `/admin/refunds${suffix}`,
        icon: Receipt,
        category: 'Dashboard',
        description: 'Manage refund requests',
      },
      {
        id: 'payouts',
        label: 'Payouts',
        keywords: ['payouts', 'payout', 'withdrawals', 'earnings'],
        href: `/admin/payouts${suffix}`,
        icon: DollarSign,
        category: 'Dashboard',
        description: 'Manage payout requests',
      },
      {
        id: 'vouchers',
        label: 'Vouchers',
        keywords: ['vouchers', 'voucher', 'coupons', 'discounts', 'promo codes'],
        href: `/admin/vouchers${suffix}`,
        icon: Ticket,
        category: 'Dashboard',
        description: 'Manage vouchers and discounts',
      },
      // Dashboard Actions
      {
        id: 'add-product',
        label: 'Add Product',
        keywords: ['add product', 'create product', 'new product', 'add item'],
        href: `/admin/products/new${suffix}`,
        icon: Plus,
        category: 'Actions',
        description: 'Create a new product',
      },
      {
        id: 'edit-category',
        label: 'Edit Category',
        keywords: ['edit category', 'manage category', 'update category', 'category settings'],
        href: `/admin/categories${suffix}`,
        icon: Edit,
        category: 'Actions',
        description: 'Edit or manage categories',
      },
      {
        id: 'create-order',
        label: 'Create Order',
        keywords: ['create order', 'new order', 'add order', 'manual order'],
        href: `/admin/orders/new${suffix}`,
        icon: Plus,
        category: 'Actions',
        description: 'Create a manual order',
      },
      // Communication Pages
      {
        id: 'announcements',
        label: 'Announcements',
        keywords: ['announcements', 'announcement', 'notifications', 'alerts'],
        href: `/admin/announcements${suffix}`,
        icon: Megaphone,
        category: 'Communication',
        description: 'Manage announcements',
      },
      {
        id: 'tickets',
        label: 'Tickets',
        keywords: ['tickets', 'ticket', 'support', 'help'],
        href: `/admin/tickets${suffix}`,
        icon: Ticket,
        category: 'Communication',
        description: 'Manage support tickets',
      },
      {
        id: 'chats',
        label: 'Chats',
        keywords: ['chats', 'chat', 'messages', 'conversations'],
        href: 'https://chat.merchkins.com',
        icon: MessageSquare,
        category: 'Communication',
        description: 'Open Chatwoot chat dashboard',
      },
      // Insights
      {
        id: 'analytics',
        label: 'Analytics',
        keywords: ['analytics', 'stats', 'statistics', 'reports', 'metrics'],
        href: `/admin/analytics${suffix}`,
        icon: BarChart3,
        category: 'Insights',
        description: 'View analytics and reports',
      },
      {
        id: 'knowledge-base',
        label: 'Knowledge Base',
        keywords: ['knowledge base', 'kb', 'docs', 'documentation', 'help articles', 'faq'],
        href: `/admin/knowledge-base${suffix}`,
        icon: BookOpen,
        category: 'Insights',
        description: 'Manage knowledge base articles',
      },
      {
        id: 'view-analytics',
        label: 'View Analytics',
        keywords: ['view analytics', 'see analytics', 'open analytics', 'show analytics'],
        href: `/admin/analytics${suffix}`,
        icon: BarChart3,
        category: 'Actions',
        description: 'View analytics dashboard',
      },
      // Organization Pages
      {
        id: 'org-members',
        label: 'Members',
        keywords: ['members', 'member', 'team', 'users', 'people'],
        href: `/admin/org-members${suffix}`,
        icon: Users,
        category: 'Organization',
        description: 'Manage organization members',
      },
      {
        id: 'org-settings',
        label: 'Organization Settings',
        keywords: ['settings', 'organization settings', 'org settings', 'org name', 'update org name', 'org config'],
        href: `/admin/org-settings${suffix}`,
        icon: Settings,
        category: 'Organization',
        description: 'Configure organization settings',
      },
      {
        id: 'update-org-name',
        label: 'Update Org Name',
        keywords: ['update org name', 'change org name', 'edit org name', 'organization name'],
        href: `/admin/org-settings${suffix}`,
        icon: Edit,
        category: 'Actions',
        description: 'Update organization name',
      },
      {
        id: 'add-member',
        label: 'Add Member',
        keywords: ['add member', 'invite member', 'new member', 'add user'],
        href: `/admin/org-members${suffix}`,
        icon: Plus,
        category: 'Actions',
        description: 'Add a new member to organization',
      },
    ],
    [suffix]
  );

  // Group items by category for display
  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    searchItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [searchItems]);

  const handleSelect = (value: string) => {
    // Find the item by matching the search value
    const item = searchItems.find((item) => {
      const searchValue = `${item.label} ${item.keywords.join(' ')} ${item.description || ''}`;
      return searchValue === value;
    });

    if (item) {
      if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
        window.open(item.href, '_blank');
      } else {
        router.push(item.href);
      }
      onOpenChange(false);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Admin Command Palette" description="Search for pages and actions">
      <CommandInput placeholder="Search pages, actions, or settings..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {['Dashboard', 'Actions', 'Communication', 'Insights', 'Organization'].map((category) => {
          const categoryItems = groupedItems[category] || [];
          if (categoryItems.length === 0) return null;

          return (
            <CommandGroup key={category} heading={category}>
              {categoryItems.map((item) => {
                const Icon = item.icon;
                // Create searchable value that includes label, keywords, and description for better matching
                const searchValue = `${item.label} ${item.keywords.join(' ')} ${item.description || ''}`;
                return (
                  <CommandItem key={item.id} value={searchValue} onSelect={handleSelect} className="cursor-pointer">
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
