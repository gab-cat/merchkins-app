'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Building2, CreditCard, Calendar, Ticket, Package } from 'lucide-react';
import type { InvoiceData } from '@/lib/pdf/payout-invoice';

interface InvoicePreviewProps {
  invoice: InvoiceData;
}

// Helper functions
const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatShortDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const isPaid = invoice.status === 'PAID';
  const displayOrders = invoice.orderSummary.slice(0, 15);
  const hasMoreOrders = invoice.orderSummary.length > 15;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 p-6 text-primary-foreground">
        <div className="relative flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold font-genty tracking-tight">
              <span className="text-white">Merch</span>
              <span className="">kins</span>
            </h1>
            <p className="text-white text-xs font-medium tracking-widest uppercase mt-0.5">Payout Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold tracking-wide">INVOICE</p>
            <p className="text-white font-mono text-xs mt-0.5">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details Card */}
      <Card className="-mt-6 mx-4 relative z-10 border border-border/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Invoice Date</p>
              <p className="font-semibold text-foreground">{formatDate(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Period Covered</p>
              <p className="font-semibold text-foreground">
                {formatShortDate(invoice.periodStart)} — {formatShortDate(invoice.periodEnd)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Status</p>
              <Badge
                variant={isPaid ? 'default' : 'secondary'}
                className={`${
                  isPaid ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                } font-semibold uppercase tracking-wide`}
              >
                {invoice.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payee Details - No Card */}
      <div className="px-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Payee Details</h2>
        </div>

        {/* Organization Info */}
        <div className="mb-6">
          <p className="font-bold text-xl text-foreground mb-1">{invoice.organizationInfo.name}</p>
          <p className="text-sm text-muted-foreground font-mono">@{invoice.organizationInfo.slug}</p>
        </div>

        {/* Bank Details Grid */}
        {invoice.organizationInfo.bankDetails && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Bank Name</p>
              <p className="font-medium text-foreground">{invoice.organizationInfo.bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Account Name</p>
              <p className="font-medium text-foreground">{invoice.organizationInfo.bankDetails.accountName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Account Number</p>
              <p className="font-medium font-mono text-foreground">{invoice.organizationInfo.bankDetails.accountNumber}</p>
            </div>
          </div>
        )}

        <Separator className="mt-6" />
      </div>

      {/* Financial Summary - Light Theme */}
      <Card className="border border-border/50 bg-gradient-to-br from-muted/30 via-background to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <CreditCard className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Financial Summary</h2>
          </div>

          <div className="space-y-4 mb-6">
            {invoice.totalVoucherDiscount && invoice.totalVoucherDiscount > 0 ? (
              <>
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-muted-foreground">Original Sales Total</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(invoice.grossAmount + invoice.totalVoucherDiscount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Voucher Discounts</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">
                      <Ticket className="w-3 h-3" />
                      Seller
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-amber-600">-{formatCurrency(invoice.totalVoucherDiscount)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50 bg-muted/30 -mx-6 px-6">
                  <span className="text-muted-foreground font-medium">Gross Sales Amount</span>
                  <span className="font-mono font-semibold text-foreground">{formatCurrency(invoice.grossAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-muted-foreground">Gross Sales Amount</span>
                <span className="font-mono font-semibold text-foreground">{formatCurrency(invoice.grossAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Platform Fee ({invoice.platformFeePercentage}%)</span>
              <span className="font-mono font-semibold text-red-500">-{formatCurrency(invoice.platformFeeAmount)}</span>
            </div>
            {invoice.totalAdjustmentAmount && invoice.totalAdjustmentAmount < 0 && (
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Adjustments</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {invoice.adjustmentCount} {invoice.adjustmentCount === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
                <span className="font-mono font-semibold text-red-500">{formatCurrency(invoice.totalAdjustmentAmount)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-primary">
            <span className="font-semibold text-foreground">Net Payout</span>
            <span className="font-mono font-bold text-3xl text-primary">{formatCurrency(invoice.netAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border/50 rounded-lg p-3 text-center bg-muted/20">
          <p className="font-mono font-bold text-xl text-primary">{invoice.orderCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Orders</p>
        </div>
        <div className="border border-border/50 rounded-lg p-3 text-center bg-muted/20">
          <p className="font-mono font-bold text-xl text-primary">{invoice.itemCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Items Sold</p>
        </div>
        <div className="border border-border/50 rounded-lg p-3 text-center bg-muted/20">
          <p className="font-mono font-bold text-xl text-primary">{formatCurrency(invoice.grossAmount)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Total Revenue</p>
        </div>
      </div>

      {/* Order Summary Table */}
      <Card className="border border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-6 pb-4">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Order Summary</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold text-xs uppercase tracking-wide">Order #</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-xs uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-xs uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-xs uppercase tracking-wide text-center">Items</TableHead>
                <TableHead className="text-primary-foreground font-semibold text-xs uppercase tracking-wide text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOrders.map((order, index) => (
                <TableRow key={order.orderId} className={index % 2 === 1 ? 'bg-muted/30' : ''}>
                  <TableCell className="font-mono font-bold text-foreground">{order.orderNumber.slice(0, 12)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatShortDate(order.orderDate)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.customerName.slice(0, 22)}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{order.itemCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-foreground">{formatCurrency(order.totalAmount)}</span>
                      {order.hasRefundVoucher && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full"
                          title={`Voucher: ${order.voucherCode}`}
                        >
                          <Ticket className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {hasMoreOrders && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={5} className="text-center text-muted-foreground italic py-3">
                    ... and {invoice.orderSummary.length - 15} more orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Summary Section - Only show if data exists */}
      {invoice.productSummary && invoice.productSummary.length > 0 && (
        <Card className="border border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 p-6 pb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <Package className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wide text-foreground">Product Summary</h2>
            </div>
            <div className="px-6 pb-6 space-y-4">
              {invoice.productSummary.map((product) => (
                <div key={product.productId} className="border border-border/50 rounded-lg overflow-hidden">
                  {/* Product Row */}
                  <div className="bg-primary/5 px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-foreground">{product.productTitle}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-mono font-bold text-primary">{product.totalQuantity}</span> items
                      </span>
                      <span className="font-mono font-bold text-foreground">{formatCurrency(product.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="divide-y divide-border/50">
                    {product.variants.map((variant) => (
                      <div key={variant.variantId}>
                        {/* Variant Row */}
                        <div className="px-4 py-2.5 flex justify-between items-center bg-muted/20">
                          <div className="flex items-center gap-2 pl-4">
                            <span className="w-2 h-2 rounded-full bg-primary/40" />
                            <span className="text-sm text-foreground">{variant.variantName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              <span className="font-mono font-semibold">{variant.totalQuantity}</span> items
                            </span>
                            <span className="font-mono font-semibold text-sm text-foreground">{formatCurrency(variant.totalAmount)}</span>
                          </div>
                        </div>

                        {/* Sizes */}
                        {variant.sizes && variant.sizes.length > 0 && (
                          <div className="bg-background">
                            {variant.sizes.map((size) => (
                              <div key={size.size} className="px-4 py-1.5 flex justify-between items-center border-t border-border/30">
                                <div className="flex items-center gap-2 pl-10">
                                  <span className="text-xs text-muted-foreground">{size.size}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs text-muted-foreground">
                                    <span className="font-mono">{size.quantity}</span>
                                  </span>
                                  <span className="font-mono text-xs text-muted-foreground">{formatCurrency(size.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation (if paid) */}
      {isPaid && invoice.paidAt && (
        <Card className="border border-border/50 overflow-hidden pt-0">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Payment Confirmed</h2>
            <p className="text-emerald-100 text-sm mt-1">Your payout has been successfully processed</p>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground">Payment Details</h3>
            </div>
            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-emerald-600">{formatCurrency(invoice.netAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Payment Date</span>
                <span className="font-medium text-foreground">{formatDate(invoice.paidAt)}</span>
              </div>
              {invoice.paidByInfo && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Processed By</span>
                  <span className="font-medium text-foreground">
                    {invoice.paidByInfo.firstName || ''} {invoice.paidByInfo.lastName || ''}
                  </span>
                </div>
              )}
              {invoice.paymentReference && (
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium font-mono text-foreground">{invoice.paymentReference}</span>
                </div>
              )}
              {invoice.paymentNotes && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="font-medium text-foreground">{invoice.paymentNotes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="bg-muted/50 rounded-xl p-5 flex justify-between items-center text-xs text-muted-foreground">
        <div>
          <p>This is a computer-generated invoice. No signature required.</p>
          <p>Generated by Merchkins Payout System</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary text-sm">merchkins</p>
          <p>support@merchkins.com</p>
        </div>
      </div>
    </div>
  );
}
