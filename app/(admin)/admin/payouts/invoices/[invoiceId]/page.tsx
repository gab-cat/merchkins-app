'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { InvoicePreview, PdfDownloadButton, InvoicePreviewSkeleton } from '@/src/features/invoices/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileWarning } from 'lucide-react';
import Link from 'next/link';
import type { InvoiceData } from '@/lib/pdf/payout-invoice';
import { useSearchParams } from 'next/navigation';

interface InvoicePageProps {
  params: Promise<{ invoiceId: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const { invoiceId } = use(params);
  // Get the org slug from params
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');

  const invoice = useQuery(api.payouts.queries.index.getAuthorizedPayoutInvoice, {
    invoiceId: invoiceId as Id<'payoutInvoices'>,
  });

  // Loading state
  if (invoice === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8 px-4">
        <div className="max-w-4xl mx-auto mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href={`/admin/payouts?org=${orgSlug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <InvoicePreviewSkeleton />
      </div>
    );
  }

  // Not found or access denied
  if (invoice === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" asChild className="mb-8">
            <Link href={`/admin/payouts?org=${orgSlug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payouts
            </Link>
          </Button>

          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FileWarning className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Transform Convex invoice data to InvoiceData format
  const invoiceData: InvoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    organizationInfo: {
      name: invoice.organizationInfo.name,
      slug: invoice.organizationInfo.slug,
      bankDetails: invoice.organizationInfo.bankDetails,
    },
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    grossAmount: invoice.grossAmount,
    platformFeePercentage: invoice.platformFeePercentage,
    platformFeeAmount: invoice.platformFeeAmount,
    netAmount: invoice.netAmount,
    totalVoucherDiscount: invoice.totalVoucherDiscount,
    totalAdjustmentAmount: invoice.totalAdjustmentAmount,
    adjustmentCount: invoice.adjustmentCount,
    orderCount: invoice.orderCount,
    itemCount: invoice.itemCount,
    status: invoice.status,
    paidAt: invoice.paidAt,
    paidByInfo: invoice.paidByInfo,
    paymentReference: invoice.paymentReference,
    paymentNotes: invoice.paymentNotes,
    createdAt: invoice.createdAt,
    orderSummary: invoice.orderSummary.map((order) => ({
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customerName: order.customerName,
      itemCount: order.itemCount,
      totalAmount: order.totalAmount,
      // Include voucher info for display
      voucherDiscount: order.voucherDiscount,
      voucherCode: order.voucherCode,
      hasRefundVoucher: order.hasRefundVoucher,
    })),
    // Include product summary if available (graceful handling for older invoices)
    productSummary: invoice.productSummary,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/payouts?org=${orgSlug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>

        <PdfDownloadButton invoice={invoiceData} />
      </div>

      <InvoicePreview invoice={invoiceData} />
    </div>
  );
}
