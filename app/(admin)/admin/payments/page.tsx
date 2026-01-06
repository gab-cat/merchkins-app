'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { DateRangeFilter, DateRange } from '@/src/components/ui/date-range-filter';
import { Doc, Id } from '@/convex/_generated/dataModel';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { MetricCard, MetricGrid } from '@/src/components/admin/metric-card';
import { EmptyState } from '@/src/components/admin/empty-state';

// UI Components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Banknote,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Wallet,
  Building,
  Smartphone,
  Hash,
  Mail,
} from 'lucide-react';
import { PaymentMetadataDisplay } from '@/src/features/admin/components/payments/payment-metadata-display';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'GCASH' | 'MAYA' | 'OTHERS';
type PaymentStatus = 'VERIFIED' | 'PENDING' | 'DECLINED' | 'PROCESSING' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'CANCELLED';

type Payment = Doc<'payments'>;

type PaymentQueryArgs = {
  organizationId?: Id<'organizations'>;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

type PaymentQueryResult = {
  payments: Payment[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  VERIFIED: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950/30', label: 'Verified' },
  PENDING: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/30', label: 'Pending' },
  PROCESSING: { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/30', label: 'Processing' },
  DECLINED: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950/30', label: 'Declined' },
  FAILED: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950/30', label: 'Failed' },
  REFUND_PENDING: { icon: RefreshCw, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-950/30', label: 'Refund Pending' },
  REFUNDED: { icon: Receipt, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-950/30', label: 'Refunded' },
  CANCELLED: { icon: XCircle, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-950/30', label: 'Cancelled' },
};

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { icon: React.ElementType; label: string }> = {
  CASH: { icon: Banknote, label: 'Cash' },
  BANK_TRANSFER: { icon: Building, label: 'Bank Transfer' },
  GCASH: { icon: Smartphone, label: 'GCash' },
  MAYA: { icon: Wallet, label: 'Maya' },
  OTHERS: { icon: CreditCard, label: 'Other' },
};

function formatCurrency(amount: number | undefined, currency?: string) {
  if (amount === undefined) return '₱0.00';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: currency || 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

// Status badge component
function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) return <span className="text-xs">{status}</span>;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.color)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// Method badge component - extracts actual method from metadata if available
function PaymentMethodBadge({ method, metadata }: { method: PaymentMethod | 'XENDIT'; metadata?: Record<string, unknown> | null }) {
  // Try to get the actual payment method from metadata
  let displayLabel: string = method;
  let Icon = CreditCard;

  if (metadata) {
    const ewalletType = metadata.ewallet_type as string | undefined;
    const paymentChannel = metadata.payment_channel as string | undefined;
    const bankCode = metadata.bank_code as string | undefined;
    const paymentMethod = metadata.payment_method as string | undefined;

    // Determine the best label to show
    if (ewalletType) {
      displayLabel = ewalletType;
      Icon = Smartphone;
    } else if (bankCode) {
      displayLabel = bankCode;
      Icon = Building;
    } else if (paymentChannel) {
      displayLabel = paymentChannel;
      Icon = paymentChannel.includes('GCASH') || paymentChannel.includes('OVO') ? Smartphone : Building;
    } else if (paymentMethod === 'BANK_TRANSFER') {
      displayLabel = 'Bank Transfer';
      Icon = Building;
    } else if (paymentMethod === 'EWALLET') {
      displayLabel = 'E-Wallet';
      Icon = Wallet;
    }
  } else {
    // Fallback to config if no metadata
    const config = PAYMENT_METHOD_CONFIG[method as PaymentMethod];
    if (config) {
      // @ts-expect-error - Icon is a React component
      Icon = config.icon;
      displayLabel = config.label;
    }
  }

  // Format display label nicely (capitalize properly)
  const formattedLabel = displayLabel
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {formattedLabel}
    </span>
  );
}

// Payment card component
function PaymentCard({ payment, onVerify, onDecline, index }: { payment: Payment; onVerify: () => void; onDecline: () => void; index: number }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isPending = payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'PROCESSING';
  const initials = [payment.userInfo?.firstName?.[0], payment.userInfo?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const hasMetadata = !!payment.metadata;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn('group p-4 rounded-xl border bg-card hover:shadow-sm transition-all', hasMetadata && 'cursor-pointer hover:border-primary/30')}
        onClick={() => hasMetadata && setDetailsOpen(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {payment.userInfo?.firstName} {payment.userInfo?.lastName}
                </span>
                <PaymentStatusBadge status={payment.paymentStatus as PaymentStatus} />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{payment.userInfo?.email || 'No email'}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-semibold text-lg text-primary">{formatCurrency(payment.amount, payment.currency)}</div>
            <PaymentMethodBadge method={payment.paymentMethod as PaymentMethod} metadata={payment.metadata as Record<string, unknown>} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Ref: {payment.referenceNo || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              Order: {payment.orderInfo?.orderNumber ? `#${payment.orderInfo.orderNumber}` : 'N/A'}
            </span>
            {hasMetadata && <span className="text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity">Click for details →</span>}
          </div>

          {isPending && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    <XCircle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                    Decline
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Decline Payment?</AlertDialogTitle>
                    <AlertDialogDescription>This will mark the payment as declined. The customer will be notified.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDecline} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Decline
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button size="sm" onClick={onVerify} className="h-8">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Verify
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment Details Dialog */}
      <AlertDialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Details
            </AlertDialogTitle>
            <AlertDialogDescription>
              {payment.userInfo?.firstName} {payment.userInfo?.lastName} • {formatCurrency(payment.amount, payment.currency)}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Payment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status</span>
                <div className="mt-1">
                  <PaymentStatusBadge status={payment.paymentStatus as PaymentStatus} />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Method</span>
                <div className="mt-1">
                  <PaymentMethodBadge method={payment.paymentMethod as PaymentMethod} metadata={payment.metadata as Record<string, unknown>} />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Reference #</span>
                <p className="font-medium">{payment.referenceNo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Order #</span>
                <p className="font-medium">{payment.orderInfo?.orderNumber ? `#${payment.orderInfo.orderNumber}` : 'N/A'}</p>
              </div>
            </div>

            {/* Xendit Metadata */}
            {payment.metadata && <PaymentMetadataDisplay metadata={payment.metadata as Record<string, unknown>} className="border-0 shadow-none" />}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Loading skeleton
function PaymentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-admin-body">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-muted rounded-lg" />
        <div className="h-10 w-40 bg-muted rounded-lg" />
        <div className="h-10 w-40 bg-muted rounded-lg" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams();
  const org = searchParams.get('org');

  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [method, setMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({});

  const debouncedSearch = useDebouncedSearch(search, 300);
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, org ? { slug: org } : 'skip');

  const baseArgs = useMemo(
    (): PaymentQueryArgs => ({
      organizationId: org ? organization?._id : undefined,
      paymentStatus: status === 'ALL' ? undefined : status,
      paymentMethod: method === 'ALL' ? undefined : method,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      search: debouncedSearch || undefined,
    }),
    [org, organization?._id, status, method, dateRange, debouncedSearch]
  );

  // Skip only while resolving organization when org slug is present
  const shouldSkip = org ? organization === undefined : false;

  const {
    items: payments,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<Payment, PaymentQueryArgs>({
    query: api.payments.queries.index.getPayments,
    baseArgs: shouldSkip ? 'skip' : baseArgs,
    limit: 25,
    selectItems: (res: unknown) => {
      const typedRes = res as PaymentQueryResult;
      return typedRes.payments || [];
    },
    selectHasMore: (res: unknown) => {
      const typedRes = res as PaymentQueryResult;
      return !!typedRes.hasMore;
    },
  });

  const updatePayment = useMutation(api.payments.mutations.index.updatePayment);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => p.paymentStatus === 'PENDING' || p.paymentStatus === 'PROCESSING').length;
    const verified = payments.filter((p) => p.paymentStatus === 'VERIFIED').length;
    // Exclude REFUNDED, CANCELLED, and REFUND_PENDING payments from revenue calculations
    const excludedStatuses = new Set(['REFUNDED', 'CANCELLED', 'REFUND_PENDING']);
    const totalAmount = payments.filter((p) => !excludedStatuses.has(p.paymentStatus)).reduce((sum, p) => sum + (p.amount || 0), 0);
    return { total, pending, verified, totalAmount };
  }, [payments]);

  async function handleVerify(paymentId: Id<'payments'>) {
    try {
      await updatePayment({ paymentId, paymentStatus: 'VERIFIED' });
      showToast({ type: 'success', title: 'Payment verified' });
    } catch (err: unknown) {
      const error = err as Error;
      showToast({ type: 'error', title: error?.message || 'Failed to verify' });
    }
  }

  async function handleDecline(paymentId: Id<'payments'>) {
    try {
      await updatePayment({ paymentId, paymentStatus: 'DECLINED' });
      showToast({ type: 'success', title: 'Payment declined' });
    } catch (err: unknown) {
      const error = err as Error;
      showToast({ type: 'error', title: error?.message || 'Failed to decline' });
    }
  }

  if (loading && payments.length === 0) {
    return <PaymentsSkeleton />;
  }

  return (
    <div className="font-admin-body space-y-6">
      <PageHeader
        title="Payments"
        description="Review and verify reported payments"
        icon={<CreditCard className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: `/admin/overview${org ? `?org=${org}` : ''}` }, { label: 'Payments' }]}
      />

      {/* Metrics */}
      <MetricGrid columns={4}>
        <MetricCard title="Total Payments" value={metrics.total} icon={Receipt} />
        <MetricCard title="Pending Review" value={metrics.pending} icon={Clock} variant={metrics.pending > 0 ? 'gradient' : 'default'} />
        <MetricCard title="Verified" value={metrics.verified} icon={CheckCircle} />
        <MetricCard title="Total Amount" value={formatCurrency(metrics.totalAmount)} icon={DollarSign} />
      </MetricGrid>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ref #, order #, or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus | 'ALL')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUND_PENDING">Refund Pending</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod | 'ALL')}>
          <SelectTrigger className="w-[180px]">
            <Wallet className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="GCASH">GCash</SelectItem>
            <SelectItem value="MAYA">Maya</SelectItem>
            <SelectItem value="OTHERS">Other</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-12 w-12 text-muted-foreground" />}
          title="No Payments Found"
          description={
            search || dateRange.dateFrom || dateRange.dateTo
              ? 'Try adjusting your search or filters.'
              : 'Payments will appear here once customers submit them.'
          }
        />
      ) : (
        <div className="space-y-2">
          {payments.map((payment: Payment, index: number) => (
            <PaymentCard
              key={payment._id}
              payment={payment}
              onVerify={() => handleVerify(payment._id)}
              onDecline={() => handleDecline(payment._id)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
