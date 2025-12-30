'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Download,
  Eye,
  Calendar,
  Percent,
  FileText,
  Building2,
  CreditCard,
  Info,
  Pencil,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard, MetricGrid, PageHeader, DataTable, StatusBadge, DropdownMenuItem, EmptyState } from '@/src/components/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { InvoiceDetailDialog, BankCombobox } from '@/src/features/admin/payouts/components';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function AdminPayoutsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgSlug = searchParams.get('org');

  const [selectedInvoice, setSelectedInvoice] = useState<PayoutInvoice | null>(null);
  const [bankDetailsDialogOpen, setBankDetailsDialogOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices');

  // Get organization
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  // Get organization's payout invoices
  const invoicesQuery = useQuery(
    api.payouts.queries.index.getPayoutInvoices,
    organization?._id ? { organizationId: organization._id, limit: 100 } : 'skip'
  );

  // Get organization's payout adjustments
  const adjustmentsQuery = useQuery(
    api.payouts.queries.index.getPayoutAdjustments,
    organization?._id ? { organizationId: organization._id } : 'skip'
  );

  // Actions
  const generatePdf = useAction(api.payouts.actions.index.generateInvoicePdf);

  // Mutations
  const updateBankDetails = useMutation(api.payouts.mutations.index.updateOrgBankDetails);

  const loading = organization === undefined || invoicesQuery === undefined || adjustmentsQuery === undefined;
  const invoices = invoicesQuery?.invoices ?? [];
  const adjustments = adjustmentsQuery?.adjustments ?? [];

  // Calculate totals
  const totalPending = invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'PROCESSING').reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalPaid = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.netAmount, 0);
  const pendingCount = invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'PROCESSING').length;
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;

  // Calculate adjustment metrics
  const pendingAdjustments = adjustments.filter((adj) => adj.status === 'PENDING');
  const appliedAdjustments = adjustments.filter((adj) => adj.status === 'APPLIED');
  const totalPendingAdjustmentAmount = pendingAdjustments.reduce((sum, adj) => sum + adj.amount, 0);

  // Handle row click - open detail dialog
  const handleRowClick = (row: PayoutInvoice) => {
    setSelectedInvoice(row);
  };

  // Handle PDF download
  const handleDownloadPdf = async (invoice: PayoutInvoice) => {
    try {
      const result = await generatePdf({ invoiceId: invoice._id });
      if (result.success && result.pdfBase64) {
        // Create download link
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.pdfBase64}`;
        link.download = `${invoice.invoiceNumber}.pdf`;
        link.click();
        toast.success('PDF downloaded');
      } else {
        toast.error(result.error || 'Failed to generate PDF');
      }
    } catch (_error) {
      console.error('PDF generation error:', _error);
      toast.error('Failed to generate PDF');
    }
  };

  // Handle view invoice - navigate to invoice page
  const handleViewInvoice = (invoice: PayoutInvoice) => {
    router.push(`/admin/payouts/invoices/${invoice._id}?org=${orgSlug}`);
  };

  // Handle generate and upload PDF to R2

  // Handle bank details dialog open
  const handleOpenBankDetailsDialog = () => {
    if (organization?.payoutBankDetails) {
      setBankName(organization.payoutBankDetails.bankName);
      setAccountName(organization.payoutBankDetails.accountName);
      setAccountNumber(organization.payoutBankDetails.accountNumber);
      setBankCode(organization.payoutBankDetails.bankCode || '');
      setNotificationEmail(organization.payoutBankDetails.notificationEmail || '');
    } else {
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      setBankCode('');
      setNotificationEmail('');
    }
    setBankDetailsDialogOpen(true);
  };

  // Handle bank details form submission
  const handleSubmitBankDetails = async () => {
    if (!organization?._id) {
      toast.error('Organization not found');
      return;
    }

    // Validation
    if (!bankName.trim()) {
      toast.error('Please enter bank name');
      return;
    }
    if (!accountName.trim()) {
      toast.error('Please enter account name');
      return;
    }
    if (!accountNumber.trim()) {
      toast.error('Please enter account number');
      return;
    }

    // Email validation (if provided)
    const emailValue = notificationEmail.trim();
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBankDetails({
        organizationId: organization._id,
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankCode: bankCode.trim() || undefined,
        notificationEmail: emailValue || undefined,
      });
      toast.success('Bank details updated successfully');
      setBankDetailsDialogOpen(false);
    } catch (_error) {
      console.error('Error updating bank details:', _error);
      toast.error('Failed to update bank details');
    } finally {
      setIsSubmitting(false);
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
      key: 'paidAt',
      title: 'Paid On',
      sortable: true,
      render: (_: unknown, row: PayoutInvoice) => <span className="text-sm text-muted-foreground">{row.paidAt ? formatDate(row.paidAt) : '—'}</span>,
    },
  ];

  if (!orgSlug) {
    return (
      <div className="space-y-6 font-admin-body">
        <PageHeader title="Payouts" description="View your weekly payout invoices" icon={<DollarSign className="h-5 w-5" />} />
        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          title="Select an Organization"
          description="Please select an organization to view payouts"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader title="Payouts" description="View your weekly payout invoices and payment history" icon={<DollarSign className="h-5 w-5" />} />

      {/* Bank Details Alert */}
      {organization && !organization.payoutBankDetails && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <span>
              <strong>Bank details not configured.</strong> Please add your bank account details to receive payouts.
            </span>
            <Button size="sm" variant="outline" onClick={handleOpenBankDetailsDialog} className="ml-4">
              Add Bank Details
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6 mt-6">
          {/* Summary Metrics */}
          <MetricGrid columns={4}>
            <MetricCard
              title="Pending Payouts"
              value={totalPending}
              prefix="₱"
              icon={Clock}
              loading={loading}
              variant="gradient"
              description={`${pendingCount} invoice${pendingCount !== 1 ? 's' : ''}`}
            />
            <MetricCard
              title="Total Received"
              value={totalPaid}
              prefix="₱"
              icon={CheckCircle2}
              loading={loading}
              variant="gradient"
              description={`${paidCount} payment${paidCount !== 1 ? 's' : ''}`}
            />
            <MetricCard
              title="Platform Fee"
              value={organization?.platformFeePercentage ?? 15}
              suffix="%"
              icon={Percent}
              loading={loading}
              variant="bordered"
              description="Of gross sales"
            />
            <MetricCard title="Total Invoices" value={invoices.length} icon={FileText} loading={loading} variant="bordered" description="All time" />
          </MetricGrid>

          {/* Schedule Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cut-off Period:</span>
                <span className="font-medium">Wednesday to Tuesday</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Invoices Generated:</span>
                <span className="font-medium">Every Wednesday</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Payout Day:</span>
                <span className="font-medium">Friday</span>
              </div>
            </div>
          </motion.div>

          {/* Bank Details Card - Enhanced */}
          {organization?.payoutBankDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-xl border border-border/50 bg-linear-to-br from-card via-card to-muted/20 overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary to-brand-neon" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base font-admin-heading">Payout Account</h3>
                      <p className="text-xs text-muted-foreground">Bank details for receiving payments</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenBankDetailsDialog}
                    className="border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>

                {/* Bank Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Bank / E-Wallet</span>
                    <p className="font-semibold text-sm">{organization.payoutBankDetails.bankName}</p>
                    {organization.payoutBankDetails.bankCode && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                        {organization.payoutBankDetails.bankCode}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Account Name</span>
                    <p className="font-semibold text-sm">{organization.payoutBankDetails.accountName}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Account Number</span>
                    <p className="font-semibold text-sm font-mono tracking-wide">{organization.payoutBankDetails.accountNumber}</p>
                  </div>
                </div>

                {/* Notification Email */}
                {organization.payoutBankDetails.notificationEmail && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Notification Email</span>
                        <p className="font-medium text-sm">{organization.payoutBankDetails.notificationEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Invoices Table */}
          {invoices.length > 0 ? (
            <DataTable
              data={invoices as unknown as Record<string, unknown>[]}
              columns={columns as any}
              rowKey="_id"
              loading={loading}
              searchable
              searchPlaceholder="Search invoices..."
              emptyMessage="No payout invoices yet"
              hoverable
              onRowClick={(row: any) => handleRowClick(row)}
              actions={(row: any) => (
                <>
                  <DropdownMenuItem onClick={() => setSelectedInvoice(row)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadPdf(row)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewInvoice(row)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Invoice Page
                  </DropdownMenuItem>
                </>
              )}
            />
          ) : (
            <Card className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No Payout Invoices Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Payout invoices are generated weekly on Wednesday for all paid orders from the previous week. Once you start receiving orders, your
                  invoices will appear here.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-6 mt-6">
          {/* Adjustment Summary Metrics */}
          <MetricGrid columns={3}>
            <MetricCard
              title="Pending Adjustments"
              value={pendingAdjustments.length}
              icon={Clock}
              loading={loading}
              variant="gradient"
              description={totalPendingAdjustmentAmount < 0 ? formatCurrency(Math.abs(totalPendingAdjustmentAmount)) : '₱0.00'}
            />
            <MetricCard
              title="Applied Adjustments"
              value={appliedAdjustments.length}
              icon={CheckCircle2}
              loading={loading}
              variant="gradient"
              description={`Total: ${appliedAdjustments.length}`}
            />
            <MetricCard
              title="Total Adjustments"
              value={adjustments.length}
              icon={AlertTriangle}
              loading={loading}
              variant="bordered"
              description="All time"
            />
          </MetricGrid>

          {/* Adjustments Table */}
          {adjustments.length > 0 ? (
            <DataTable
              data={adjustments as unknown as Record<string, unknown>[]}
              columns={
                [
                  {
                    key: 'orderNumber',
                    title: 'Order #',
                    render: (_: unknown, row: any) => (
                      <div>
                        <p className="font-medium text-sm font-mono">{row.order?.orderNumber || '—'}</p>
                        <p className="text-xs text-muted-foreground">{row.order?.customerName || '—'}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'type',
                    title: 'Type',
                    render: (_: unknown, row: any) => (
                      <Badge
                        variant={row.type === 'REFUND' ? 'destructive' : 'secondary'}
                        className={row.type === 'REFUND' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''}
                      >
                        {row.type}
                      </Badge>
                    ),
                  },
                  {
                    key: 'amount',
                    title: 'Amount',
                    align: 'right' as const,
                    render: (_: unknown, row: any) => (
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">{formatCurrency(row.amount)}</span>
                    ),
                  },
                  {
                    key: 'reason',
                    title: 'Reason',
                    render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{row.reason}</span>,
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (_: unknown, row: any) => <StatusBadge status={row.status} type={row.status === 'PENDING' ? 'pending' : 'success'} />,
                  },
                  {
                    key: 'originalInvoice',
                    title: 'Original Invoice',
                    render: (_: unknown, row: any) => (
                      <span className="text-sm font-mono text-muted-foreground">{row.originalInvoice?.invoiceNumber || '—'}</span>
                    ),
                  },
                  {
                    key: 'appliedInvoice',
                    title: 'Applied Invoice',
                    render: (_: unknown, row: any) => (
                      <span className="text-sm font-mono text-muted-foreground">{row.appliedInvoice?.invoiceNumber || '—'}</span>
                    ),
                  },
                  {
                    key: 'createdAt',
                    title: 'Date',
                    render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
                  },
                ] as any
              }
              rowKey="_id"
              loading={loading}
              searchable
              searchPlaceholder="Search adjustments..."
              emptyMessage="No adjustments found"
              hoverable
            />
          ) : (
            <Card className="py-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No Adjustments Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Adjustments are created when orders are refunded or cancelled after being included in a payout invoice. They will appear here once
                  created.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onViewInvoice={handleViewInvoice}
      />

      {/* Bank Details Form Dialog - Enhanced */}
      <Dialog open={bankDetailsDialogOpen} onOpenChange={setBankDetailsDialogOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border border-border/50">
          {/* Gradient Header */}
          <div className="relative bg-linear-to-br from-primary via-primary to-primary/90 px-6 py-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-brand-neon/20 rounded-full blur-xl" />

            <DialogHeader className="relative z-10">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-white font-bold text-lg font-admin-heading">
                    {organization?.payoutBankDetails ? 'Edit Payout Account' : 'Add Payout Account'}
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-sm">
                    {organization?.payoutBankDetails ? 'Update your bank account information' : 'Add your bank account to receive payouts'}
                  </DialogDescription>
                </div>
              </motion.div>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Bank/E-Wallet Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h4 className="font-semibold text-sm">Bank or E-Wallet</h4>
              </div>
              <div className="space-y-2">
                <Label>
                  Select Bank / E-Wallet <span className="text-destructive">*</span>
                </Label>
                <BankCombobox
                  value={bankCode}
                  bankName={bankName}
                  onValueChange={(code, bankData) => {
                    setBankCode(code);
                    if (bankData) {
                      setBankName(bankData.name);
                    }
                  }}
                  onBankNameChange={setBankName}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">Search and select your bank or e-wallet from the list</p>
              </div>
            </div>

            <Separator />

            {/* Account Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h4 className="font-semibold text-sm">Account Details</h4>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">
                    Account Holder Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountName"
                    placeholder="e.g., Juan Dela Cruz"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    disabled={isSubmitting}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    placeholder="e.g., 1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    disabled={isSubmitting}
                    className="h-10 font-mono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full" />
                <h4 className="font-semibold text-sm">Notifications</h4>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  Optional
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder="payouts@example.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Receive payout notifications at this email. Defaults to org admin emails if not set.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 bg-muted/30 px-6 py-4 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setBankDetailsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBankDetails} disabled={isSubmitting} className="min-w-[100px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : organization?.payoutBankDetails ? (
                'Update Account'
              ) : (
                'Save Account'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
