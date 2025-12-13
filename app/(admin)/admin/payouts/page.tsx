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
  TrendingUp,
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
} from 'lucide-react';
import { MetricCard, MetricGrid, PageHeader, DataTable, StatusBadge, DropdownMenuItem, EmptyState } from '@/src/components/admin';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { InvoiceDetailDialog } from '@/src/features/admin/payouts/components';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Get organization
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  // Get organization's payout invoices
  const invoicesQuery = useQuery(
    api.payouts.queries.index.getPayoutInvoices,
    organization?._id ? { organizationId: organization._id, limit: 100 } : 'skip'
  );

  // Actions
  const generatePdf = useAction(api.payouts.actions.index.generateInvoicePdf);

  // Mutations
  const updateBankDetails = useMutation(api.payouts.mutations.index.updateOrgBankDetails);

  const loading = organization === undefined || invoicesQuery === undefined;
  const invoices = invoicesQuery?.invoices ?? [];

  // Calculate totals
  const totalPending = invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'PROCESSING').reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalPaid = invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + inv.netAmount, 0);
  const pendingCount = invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'PROCESSING').length;
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;

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
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Handle view invoice - navigate to invoice page
  const handleViewInvoice = (invoice: PayoutInvoice) => {
    router.push(`/admin/payouts/invoices/${invoice._id}?org=${orgSlug}`);
  };

  // Handle generate and upload PDF to R2
  const handleGenerateAndUploadPdf = async (invoice: PayoutInvoice) => {
    setIsGeneratingPdf(true);
    try {
      const result = await generatePdf({ invoiceId: invoice._id, uploadToR2: true });
      if (result.success) {
        if (result.invoiceUrl) {
          toast.success('PDF generated and uploaded successfully');
          // Update selected invoice if it's the same one
          if (selectedInvoice?._id === invoice._id) {
            setSelectedInvoice({ ...selectedInvoice, invoiceUrl: result.invoiceUrl });
          }
        } else {
          toast.success('PDF generated');
        }
      } else {
        toast.error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
    } catch (error) {
      console.error('Error updating bank details:', error);
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

      {/* Bank Details Card */}
      {organization?.payoutBankDetails && (
        <Card className="py-1">
          <CardHeader className="pb-0 pt-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payout Account
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={handleOpenBankDetailsDialog}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Bank</span>
                <p className="font-medium">{organization.payoutBankDetails.bankName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account Name</span>
                <p className="font-medium">{organization.payoutBankDetails.accountName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account Number</span>
                <p className="font-medium">{organization.payoutBankDetails.accountNumber}</p>
              </div>
            </div>
            {organization.payoutBankDetails.notificationEmail && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-muted-foreground text-sm">Notification Email</span>
                <p className="font-medium text-sm">{organization.payoutBankDetails.notificationEmail}</p>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onViewInvoice={handleViewInvoice}
      />

      {/* Bank Details Form Dialog */}
      <Dialog open={bankDetailsDialogOpen} onOpenChange={setBankDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{organization?.payoutBankDetails ? 'Edit Bank Details' : 'Add Bank Details'}</DialogTitle>
            <DialogDescription>
              {organization?.payoutBankDetails
                ? 'Update your bank account information for payouts.'
                : 'Add your bank account information to receive payouts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankName"
                placeholder="e.g., BDO, BPI, Metrobank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">
                Account Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountName"
                placeholder="Account holder name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankCode">Bank Code (Optional)</Label>
              <Input
                id="bankCode"
                placeholder="e.g., BDO, BPI"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Bank code for automated payouts (optional)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email (Optional)</Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="payouts@example.com"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Email address to receive payout notifications. If not set, notifications will be sent to organization admins.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDetailsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBankDetails} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : organization?.payoutBankDetails ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
