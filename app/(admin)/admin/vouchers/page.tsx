'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Doc, Id } from '@/convex/_generated/dataModel';
import {
  Ticket,
  Plus,
  Search,
  Copy,
  Edit,
  MoreHorizontal,
  Percent,
  DollarSign,
  Gift,
  Truck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/src/components/admin';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showToast, promiseToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

type EnrichedVoucher = Doc<'vouchers'> & {
  computedStatus: 'active' | 'inactive' | 'expired' | 'scheduled' | 'exhausted';
  isExpired: boolean;
  isUsageLimitReached: boolean;
  remainingUses: number | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDiscountTypeIcon(type: string) {
  switch (type) {
    case 'PERCENTAGE':
      return <Percent className="h-4 w-4" />;
    case 'FIXED_AMOUNT':
      return <DollarSign className="h-4 w-4" />;
    case 'FREE_ITEM':
      return <Gift className="h-4 w-4" />;
    case 'FREE_SHIPPING':
      return <Truck className="h-4 w-4" />;
    default:
      return <Ticket className="h-4 w-4" />;
  }
}

function getDiscountDisplay(voucher: EnrichedVoucher) {
  switch (voucher.discountType) {
    case 'PERCENTAGE':
      return `${voucher.discountValue}% off`;
    case 'FIXED_AMOUNT':
      return `${formatCurrency(voucher.discountValue)} off`;
    case 'FREE_ITEM':
      return 'Free Item';
    case 'FREE_SHIPPING':
      return 'Free Shipping';
    default:
      return voucher.discountValue.toString();
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Active' };
    case 'inactive':
      return { icon: XCircle, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'Inactive' };
    case 'expired':
      return { icon: Clock, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Expired' };
    case 'scheduled':
      return { icon: Calendar, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Scheduled' };
    case 'exhausted':
      return { icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Exhausted' };
    default:
      return { icon: Ticket, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status };
  }
}

function VoucherStatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs px-2 py-0.5 font-medium rounded-full border shadow-none ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

interface VoucherListItemProps {
  voucher: EnrichedVoucher;
  orgSlug: string | null;
  index: number;
  onToggle: (voucherId: Id<'vouchers'>, isActive: boolean) => Promise<void>;
  onDelete: (voucherId: Id<'vouchers'>) => Promise<void>;
}

function VoucherListItem({ voucher, orgSlug, index, onToggle, onDelete }: VoucherListItemProps) {
  const suffix = orgSlug ? `?org=${orgSlug}` : '';

  const copyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    showToast({ type: 'success', title: 'Voucher code copied!' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
    >
      {/* Icon */}
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', 'bg-primary/10 text-primary')}>
        {getDiscountTypeIcon(voucher.discountType)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{voucher.name}</h4>
          <VoucherStatusBadge status={voucher.computedStatus} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <button onClick={copyCode} className="flex items-center gap-1 hover:text-primary cursor-pointer font-mono bg-muted px-1.5 py-0.5 rounded">
            <Copy className="h-3 w-3" />
            {voucher.code}
          </button>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {voucher.usedCount}
            {voucher.usageLimit ? ` / ${voucher.usageLimit}` : ''} used
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(voucher.validFrom)}
            {voucher.validUntil ? ` - ${formatDate(voucher.validUntil)}` : ' onwards'}
          </span>
        </div>
      </div>

      {/* Discount */}
      <div className="text-right shrink-0">
        <div className="font-bold text-sm text-primary">{getDiscountDisplay(voucher)}</div>
        {voucher.minOrderAmount && <p className="text-xs text-muted-foreground mt-0.5">Min: {formatCurrency(voucher.minOrderAmount)}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/admin/vouchers/${voucher._id}${suffix}`}>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyCode}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(voucher._id, !voucher.isActive)}>
              {voucher.isActive ? (
                <>
                  <ToggleLeft className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(voucher._id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

function VouchersEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Ticket className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No vouchers yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">Create your first voucher to offer discounts and promotions to your customers.</p>
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4 mr-1" />
        Create Voucher
      </Button>
    </div>
  );
}

export default function AdminVouchersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const suffix = orgSlug ? `?org=${orgSlug}` : '';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const debouncedSearch = useDebouncedSearch(search, 300);

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const vouchersResult = useQuery(api.vouchers.queries.index.getVouchers, {
    organizationId: organization?._id,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    discountType: typeFilter !== 'all' ? (typeFilter as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'FREE_SHIPPING') : undefined,
    search: debouncedSearch || undefined,
    includeExpired: true,
    limit: 100,
  });

  const toggleVoucher = useMutation(api.vouchers.mutations.index.toggleVoucherStatus);
  const deleteVoucher = useMutation(api.vouchers.mutations.index.deleteVoucher);

  const vouchers = vouchersResult?.vouchers ?? [];
  const loading = vouchersResult === undefined;

  const handleToggle = async (voucherId: Id<'vouchers'>, isActive: boolean) => {
    await promiseToast(toggleVoucher({ voucherId, isActive }), {
      loading: isActive ? 'Activating voucher...' : 'Deactivating voucher...',
      success: isActive ? 'Voucher activated' : 'Voucher deactivated',
      error: () => 'Failed to update voucher',
    });
  };

  const handleDelete = async (voucherId: Id<'vouchers'>) => {
    if (!confirm('Are you sure you want to delete this voucher? This action cannot be undone.')) {
      return;
    }
    await promiseToast(deleteVoucher({ voucherId }), {
      loading: 'Deleting voucher...',
      success: 'Voucher deleted',
      error: () => 'Failed to delete voucher',
    });
  };

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Vouchers"
        description="Create and manage discount codes and promotions"
        icon={<Ticket className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: `/admin/overview${suffix}` },
          { label: 'Vouchers', href: `/admin/vouchers${suffix}` },
        ]}
        actions={
          <Link href={`/admin/vouchers/new${suffix}`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Voucher
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search vouchers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
              <SelectItem value="FREE_ITEM">Free Item</SelectItem>
              <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Vouchers List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border overflow-hidden"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </motion.div>
        ) : vouchers.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VouchersEmptyState onCreate={() => router.push(`/admin/vouchers/new${suffix}`)} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border overflow-hidden"
          >
            {vouchers.map((voucher, index) => (
              <VoucherListItem
                key={voucher._id}
                voucher={voucher as EnrichedVoucher}
                orgSlug={orgSlug}
                index={index}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
