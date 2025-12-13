'use client';

import { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCurrentUser } from '@/src/features/auth/hooks/use-current-user';
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  Building2,
  TrendingUp,
  Mail,
  Eye,
  Settings,
  Calendar,
  Percent,
  Play,
  Undo2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { MetricCard, MetricGrid, PageHeader, DataTable, StatusBadge, DropdownMenuItem, DropdownMenuSeparator } from '@/src/components/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types
type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED';

interface PayoutInvoice {
  _id: Id<'payoutInvoices'>;
  invoiceNumber: string;
  organizationId: Id<'organizations'>;
  organizationInfo: {
    name: string;
    slug: string;
    logo?: string;
    logoUrl?: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      notificationEmail?: string;
    };
  };
  periodStart: number;
  periodEnd: number;
  grossAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  netAmount: number;
  orderCount: number;
  itemCount: number;
  status: PayoutStatus;
  paidAt?: number;
  paymentReference?: string;
  paymentNotes?: string;
  invoiceUrl?: string;
  pdfStorageKey?: string;
  createdAt: number;
}

// Helper functions
const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatDateRange = (start: number, end: number) => `${formatDate(start)} - ${formatDate(end)}`;

/**
 * Helper function to get the previous Wednesday-Tuesday period
 * Returns timestamps for:
 * - periodStart: Previous Wednesday 00:00:00 UTC
 * - periodEnd: Previous Tuesday 23:59:59 UTC
 */
function getPreviousWeekPeriod(): { periodStart: number; periodEnd: number } {
  const now = new Date();

  // Find the most recent Wednesday (start of current period)
  // If today is Wednesday, go back to last Wednesday
  const currentDay = now.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  // Calculate days since the Wednesday before the one that just ended
  // We want the Wednesday from the period that just ended (previous week)
  let daysToLastWednesday: number;

  if (currentDay === 3) {
    // Today is Wednesday - previous period started last Wednesday (7 days ago)
    daysToLastWednesday = 7;
  } else if (currentDay > 3) {
    // After Wednesday (Thu, Fri, Sat)
    // Previous period's Wednesday is (currentDay - 3 + 7) days ago
    daysToLastWednesday = currentDay - 3 + 7;
  } else {
    // Before Wednesday (Sun, Mon, Tue)
    // Previous period's Wednesday is (7 - 3 + currentDay + 7) days ago
    // Simplified: (currentDay + 4 + 7) = currentDay + 11
    daysToLastWednesday = currentDay + 4 + 7;
  }

  // Period start: Previous Wednesday 00:00:00 UTC
  const periodStartDate = new Date(now);
  periodStartDate.setUTCDate(now.getUTCDate() - daysToLastWednesday);
  periodStartDate.setUTCHours(0, 0, 0, 0);

  // Period end: Tuesday 23:59:59 UTC (6 days after Wednesday)
  const periodEndDate = new Date(periodStartDate);
  periodEndDate.setUTCDate(periodStartDate.getUTCDate() + 6);
  periodEndDate.setUTCHours(23, 59, 59, 999);

  return {
    periodStart: periodStartDate.getTime(),
    periodEnd: periodEndDate.getTime(),
  };
}

// Status badge component
function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const typeMap: Record<PayoutStatus, 'pending' | 'info' | 'success' | 'error'> = {
    PENDING: 'pending',
    PROCESSING: 'info',
    PAID: 'success',
    CANCELLED: 'error',
  };

  return <StatusBadge status={status} type={typeMap[status]} />;
}

export default function SuperAdminPayoutsPage() {
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<PayoutInvoice | null>(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Revert dialog state
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [revertReason, setRevertReason] = useState('');
  const [isReverting, setIsReverting] = useState(false);
  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get current user
  const { user: currentUser } = useCurrentUser();

  // Queries
  const summary = useQuery(api.payouts.queries.index.getPayoutSummary, {});
  const invoicesQuery = useQuery(api.payouts.queries.index.getPayoutInvoices, {
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    limit: 100,
  });
  const settings = useQuery(api.payouts.queries.index.getPayoutSettings, {});

  // Mutations
  const markInvoicePaid = useMutation(api.payouts.mutations.index.markInvoicePaid);
  const revertPayoutStatus = useMutation(api.payouts.mutations.index.revertPayoutStatus);

  // Actions
  const sendPaymentEmail = useAction(api.payouts.actions.index.sendPaymentConfirmationEmail);
  const triggerManualGeneration = useAction(api.payouts.actions.index.triggerPayoutGenerationManual);

  const loading = summary === undefined || invoicesQuery === undefined;
  const invoices = invoicesQuery?.invoices ?? [];

  // Handle row click - open detail dialog
  const handleRowClick = (row: PayoutInvoice) => {
    setSelectedInvoice(row);
  };

  // Handle mark as paid
  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;

    if (!currentUser?._id) {
      toast.error('User not authenticated');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await markInvoicePaid({
        invoiceId: selectedInvoice._id,
        paymentReference: paymentReference || undefined,
        paymentNotes: paymentNotes || undefined,
        paidByUserId: currentUser._id,
      });

      if (result.success) {
        toast.success(`Invoice ${selectedInvoice.invoiceNumber} marked as paid`);

        // Send payment confirmation email
        try {
          await sendPaymentEmail({ invoiceId: selectedInvoice._id });
          toast.success('Payment confirmation email sent');
        } catch (err) {
          toast.error('Failed to send email notification');
        }
      }

      setMarkPaidDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentReference('');
      setPaymentNotes('');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to mark invoice as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle open generate dialog
  const handleOpenGenerateDialog = () => {
    const { periodStart: defaultStart, periodEnd: defaultEnd } = getPreviousWeekPeriod();
    // Format dates for input (YYYY-MM-DD)
    const startDate = new Date(defaultStart).toISOString().split('T')[0];
    const endDate = new Date(defaultEnd).toISOString().split('T')[0];
    setPeriodStart(startDate);
    setPeriodEnd(endDate);
    setGenerateDialogOpen(true);
  };

  // Handle manual generation
  const handleGenerateInvoices = async () => {
    if (!periodStart || !periodEnd) {
      toast.error('Please select both start and end dates');
      return;
    }

    // Convert date strings to UTC timestamps
    // Date input gives us YYYY-MM-DD format, we need to interpret as UTC dates
    // Create Date objects treating the input as UTC dates
    const startDateStr = periodStart + 'T00:00:00.000Z';
    const endDateStr = periodEnd + 'T23:59:59.999Z';

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    if (startTimestamp >= endTimestamp) {
      toast.error('End date must be after start date');
      return;
    }

    // Log the dates being used for debugging
    console.log('Generating invoices for period:', {
      periodStart: new Date(startTimestamp).toISOString(),
      periodEnd: new Date(endTimestamp).toISOString(),
      startTimestamp,
      endTimestamp,
    });

    setIsGenerating(true);
    try {
      const result = await triggerManualGeneration({
        periodStart: startTimestamp,
        periodEnd: endTimestamp,
      });

      if (result.success) {
        if (result.invoicesCreated === 0) {
          toast.warning(
            `No invoices were created. This could mean:\n` +
              `- No organizations have PAID orders in the selected period\n` +
              `- All organizations already have invoices for this period\n` +
              `- Orders don't meet the minimum payout threshold`,
            { duration: 6000 }
          );
        } else {
          toast.success(`Successfully generated ${result.invoicesCreated} invoice${result.invoicesCreated !== 1 ? 's' : ''} for the selected period`);
        }
        setGenerateDialogOpen(false);
        setPeriodStart('');
        setPeriodEnd('');
      } else {
        toast.error('Failed to generate invoices');
      }
    } catch (error) {
      console.error('Error generating invoices:', error);
      toast.error((error as Error).message || 'Failed to generate invoices');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle revert to pending
  const handleRevertToPending = async () => {
    if (!selectedInvoice) return;

    if (!revertReason.trim()) {
      toast.error('Please provide a reason for reverting');
      return;
    }

    setIsReverting(true);
    try {
      const result = await revertPayoutStatus({
        invoiceId: selectedInvoice._id,
        reason: revertReason.trim(),
        revertedByUserId: '' as Id<'users'>, // This should come from auth
      });

      if (result.success) {
        toast.success(`Invoice ${selectedInvoice.invoiceNumber} reverted to PENDING`);
        setRevertDialogOpen(false);
        setSelectedInvoice(null);
        setRevertReason('');
      }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to revert invoice status');
    } finally {
      setIsReverting(false);
    }
  };

  // Handle view invoice in new tab
  const handleViewInvoice = (invoice: PayoutInvoice) => {
    window.open(`/admin/payouts/invoices/${invoice._id}`, '_blank');
  };

  // Handle copy to clipboard
  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Table columns
  const columns = [
    {
      key: 'invoiceNumber',
      title: 'Invoice',
      sortable: true,
      render: (_: unknown, row: PayoutInvoice) => (
        <div>
          <p className="font-medium text-sm">{row.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">{formatDateRange(row.periodStart, row.periodEnd)}</p>
        </div>
      ),
    },
    {
      key: 'organizationInfo',
      title: 'Organization',
      sortable: true,
      render: (_: unknown, row: PayoutInvoice) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {row.organizationInfo.logoUrl ? (
              <img src={row.organizationInfo.logoUrl} alt={row.organizationInfo.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <Building2 className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{row.organizationInfo.name}</p>
            <p className="text-xs text-muted-foreground">/{row.organizationInfo.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      title: 'Gross Sales',
      sortable: true,
      align: 'right' as const,
      render: (_: unknown, row: PayoutInvoice) => <span className="font-medium">{formatCurrency(row.grossAmount)}</span>,
    },
    {
      key: 'platformFeeAmount',
      title: 'Platform Fee',
      sortable: true,
      align: 'right' as const,
      render: (_: unknown, row: PayoutInvoice) => (
        <div className="text-right">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">-{formatCurrency(row.platformFeeAmount)}</p>
          <p className="text-xs text-muted-foreground">{row.platformFeePercentage}%</p>
        </div>
      ),
    },
    {
      key: 'netAmount',
      title: 'Net Payout',
      sortable: true,
      align: 'right' as const,
      render: (_: unknown, row: PayoutInvoice) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.netAmount)}</span>
      ),
    },
    {
      key: 'orderCount',
      title: 'Orders',
      sortable: true,
      align: 'center' as const,
      render: (_: unknown, row: PayoutInvoice) => <Badge variant="secondary">{row.orderCount}</Badge>,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (_: unknown, row: PayoutInvoice) => <PayoutStatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (_: unknown, row: PayoutInvoice) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader title="Payouts" description="Manage weekly payout invoices for all organizations" icon={<DollarSign className="h-5 w-5" />} />

      {/* Summary Metrics */}
      <MetricGrid columns={4}>
        <MetricCard
          title="Total Pending"
          value={summary?.pendingAmount ?? 0}
          prefix="₱"
          icon={Clock}
          loading={loading}
          variant="gradient"
          description={`${summary?.pendingInvoices ?? 0} invoices`}
        />
        <MetricCard
          title="Total Paid"
          value={summary?.paidAmount ?? 0}
          prefix="₱"
          icon={CheckCircle2}
          loading={loading}
          variant="gradient"
          description={`${summary?.paidInvoices ?? 0} invoices`}
        />
        <MetricCard
          title="Platform Revenue"
          value={summary?.totalPlatformFees ?? 0}
          prefix="₱"
          icon={TrendingUp}
          loading={loading}
          variant="gradient"
          description="Total fees collected"
        />
        <MetricCard
          title="Organizations"
          value={summary?.uniqueOrganizations ?? 0}
          icon={Building2}
          loading={loading}
          variant="bordered"
          description="With payouts"
        />
      </MetricGrid>

      {/* Settings Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cut-off:</span>
              <span className="font-medium">Wednesday - Tuesday</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Default Fee:</span>
              <span className="font-medium">{settings?.defaultPlatformFeePercentage ?? 15}%</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Payout Day:</span>
              <span className="font-medium">Friday</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenGenerateDialog}>
              <Play className="h-4 w-4 mr-1" />
              Generate Invoices
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs and Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter('ALL')}>
              All ({summary?.totalInvoices ?? 0})
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter('PENDING')}>
              Pending ({summary?.pendingInvoices ?? 0})
            </TabsTrigger>
            <TabsTrigger value="paid" onClick={() => setStatusFilter('PAID')}>
              Paid ({summary?.paidInvoices ?? 0})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <DataTable
            data={invoices as unknown as Record<string, unknown>[]}
            columns={columns as any}
            rowKey="_id"
            loading={loading}
            searchable
            searchPlaceholder="Search invoices..."
            emptyMessage="No payout invoices found"
            hoverable
            onRowClick={(row: any) => handleRowClick(row)}
            actions={(row: any) => (
              <>
                <DropdownMenuItem onClick={() => setSelectedInvoice(row)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewInvoice(row)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.status === 'PENDING' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedInvoice(row);
                      setMarkPaidDialogOpen(true);
                    }}
                    className="text-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
                {row.status === 'PAID' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedInvoice(row);
                      setRevertDialogOpen(true);
                    }}
                    className="text-amber-600"
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Revert to Pending
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </DropdownMenuItem>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <DataTable
            data={invoices.filter((inv) => inv.status === 'PENDING') as unknown as Record<string, unknown>[]}
            columns={columns as any}
            rowKey="_id"
            loading={loading}
            searchable
            searchPlaceholder="Search pending invoices..."
            emptyMessage="No pending invoices"
            hoverable
            onRowClick={(row: any) => handleRowClick(row)}
            actions={(row: any) => (
              <>
                <DropdownMenuItem onClick={() => setSelectedInvoice(row)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewInvoice(row)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(row);
                    setMarkPaidDialogOpen(true);
                  }}
                  className="text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              </>
            )}
          />
        </TabsContent>

        <TabsContent value="paid" className="mt-0">
          <DataTable
            data={invoices.filter((inv) => inv.status === 'PAID') as unknown as Record<string, unknown>[]}
            columns={columns as any}
            rowKey="_id"
            loading={loading}
            searchable
            searchPlaceholder="Search paid invoices..."
            emptyMessage="No paid invoices"
            hoverable
            onRowClick={(row: any) => handleRowClick(row)}
            actions={(row: any) => (
              <>
                <DropdownMenuItem onClick={() => setSelectedInvoice(row)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewInvoice(row)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(row);
                    setRevertDialogOpen(true);
                  }}
                  className="text-amber-600"
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Revert to Pending
                </DropdownMenuItem>
              </>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>Confirm payment for invoice {selectedInvoice?.invoiceNumber}</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Organization</span>
                  <span className="font-medium">{selectedInvoice.organizationInfo.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Net Amount</span>
                  <span className="font-bold text-emerald-600 text-lg">{formatCurrency(selectedInvoice.netAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Period</span>
                  <span className="text-sm">{formatDateRange(selectedInvoice.periodStart, selectedInvoice.periodEnd)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reference">Payment Reference (Optional)</Label>
                  <Input
                    id="reference"
                    placeholder="e.g., Bank transfer ref #12345"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Payment Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this payment..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkPaid} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice && !markPaidDialogOpen && !revertDialogOpen} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">{selectedInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription className="text-xs">
              {formatDateRange(selectedInvoice?.periodStart ?? 0, selectedInvoice?.periodEnd ?? 0)}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-3">
              {/* View Invoice Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewInvoice(selectedInvoice)}
                className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                View Invoice in New Tab
              </Button>

              {/* Organization & Period - Compact */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border p-2.5">
                  <p className="text-xs text-muted-foreground mb-1">Organization</p>
                  <p className="font-semibold text-sm truncate">{selectedInvoice.organizationInfo.name}</p>
                  <p className="text-xs text-muted-foreground truncate">/{selectedInvoice.organizationInfo.slug}</p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-xs text-muted-foreground mb-1">Period</p>
                  <p className="font-semibold text-sm">{formatDate(selectedInvoice.periodStart)}</p>
                  <p className="text-xs text-muted-foreground">to {formatDate(selectedInvoice.periodEnd)}</p>
                </div>
              </div>

              {/* Payee Bank Details */}
              {selectedInvoice.organizationInfo.bankDetails && (
                <div className="rounded-md border p-2.5 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payee Bank Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Bank Name</p>
                        <p className="font-medium text-sm truncate">{selectedInvoice.organizationInfo.bankDetails.bankName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={() => handleCopy(selectedInvoice.organizationInfo.bankDetails!.bankName, 'Bank Name')}
                      >
                        {copiedField === 'Bank Name' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Account Name</p>
                        <p className="font-medium text-sm truncate">{selectedInvoice.organizationInfo.bankDetails.accountName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={() => handleCopy(selectedInvoice.organizationInfo.bankDetails!.accountName, 'Account Name')}
                      >
                        {copiedField === 'Account Name' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Account Number</p>
                        <p className="font-medium font-mono text-sm truncate">{selectedInvoice.organizationInfo.bankDetails.accountNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={() => handleCopy(selectedInvoice.organizationInfo.bankDetails!.accountNumber, 'Account Number')}
                      >
                        {copiedField === 'Account Number' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {selectedInvoice.organizationInfo.bankDetails.notificationEmail && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="font-medium text-sm truncate">{selectedInvoice.organizationInfo.bankDetails.notificationEmail}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 shrink-0"
                          onClick={() => handleCopy(selectedInvoice.organizationInfo.bankDetails!.notificationEmail!, 'Email')}
                        >
                          {copiedField === 'Email' ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Summary - Compact */}
              <div className="rounded-md border p-2.5 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Financial Summary</p>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Gross Sales</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.grossAmount)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Platform Fee ({selectedInvoice.platformFeePercentage}%)</span>
                  <span className="text-red-600">-{formatCurrency(selectedInvoice.platformFeeAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="font-semibold">Net Payout</span>
                  <span className="font-bold text-emerald-600 text-base">{formatCurrency(selectedInvoice.netAmount)}</span>
                </div>
              </div>

              {/* Stats - Compact */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold">{selectedInvoice.orderCount}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-lg font-bold">{selectedInvoice.itemCount}</p>
                  <p className="text-xs text-muted-foreground">Items</p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <PayoutStatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              {/* Payment Info (if paid) - Compact */}
              {selectedInvoice.status === 'PAID' && selectedInvoice.paidAt && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 p-2.5">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Payment Confirmed</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Paid on {formatDate(selectedInvoice.paidAt)}</p>
                  {selectedInvoice.paymentReference && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Ref: {selectedInvoice.paymentReference}</p>
                  )}
                  {selectedInvoice.paymentNotes && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 italic">"{selectedInvoice.paymentNotes}"</p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {selectedInvoice && selectedInvoice.status === 'PENDING' && (
                <Button
                  onClick={() => {
                    setMarkPaidDialogOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              {selectedInvoice && selectedInvoice.status === 'PAID' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setRevertDialogOpen(true);
                  }}
                  className="text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Revert to Pending
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revert to Pending Confirmation Dialog */}
      <AlertDialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert Invoice to Pending?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert invoice <strong>{selectedInvoice?.invoiceNumber}</strong> from PAID back to PENDING status. All payment information
              will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="revertReason">
              Reason for reverting <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="revertReason"
              placeholder="e.g., Payment was not received, incorrect amount transferred..."
              value={revertReason}
              onChange={(e) => setRevertReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRevertReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevertToPending}
              disabled={isReverting || !revertReason.trim()}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isReverting ? 'Reverting...' : 'Revert to Pending'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Invoices Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payout Invoices</DialogTitle>
            <DialogDescription>
              Manually generate payout invoices for a specific period. This will create invoices for all organizations with paid orders in the
              selected period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Period Selection</p>
              <p className="text-xs text-muted-foreground">
                Select the start and end dates for the payout period. Default values are set to the previous week (Wednesday to Tuesday).
              </p>
              <div className="mt-2 rounded border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">Important:</p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>
                    Invoices are generated for orders with <strong>paymentStatus: PAID</strong>
                  </li>
                  <li>
                    Orders are filtered by <strong>orderDate</strong> (when order was placed), not createdAt
                  </li>
                  <li>Only organizations with paid orders in the selected period will receive invoices</li>
                  <li>If an invoice already exists for an organization in this period, it will be skipped</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="periodStart">
                  Period Start <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  disabled={isGenerating}
                  required
                />
                {periodStart && <p className="text-xs text-muted-foreground mt-1">{formatDate(new Date(periodStart).getTime())}</p>}
              </div>

              <div>
                <Label htmlFor="periodEnd">
                  Period End <span className="text-destructive">*</span>
                </Label>
                <Input id="periodEnd" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} disabled={isGenerating} required />
                {periodEnd && <p className="text-xs text-muted-foreground mt-1">{formatDate(new Date(periodEnd).getTime())}</p>}
              </div>
            </div>

            {periodStart && periodEnd && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">Period Preview</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {formatDateRange(new Date(periodStart).getTime(), new Date(periodEnd).getTime())}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInvoices} disabled={isGenerating || !periodStart || !periodEnd}>
              {isGenerating ? 'Generating...' : 'Generate Invoices'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
