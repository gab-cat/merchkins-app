'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronDown, CreditCard, Wallet, Building2, Clock, CheckCircle2, XCircle, AlertCircle, Copy, Check, Info, Smartphone } from 'lucide-react';

// Paymongo payment source structure
interface PaymongoPaymentSource {
  type?: string;
  brand?: string;
  last4?: string;
  id?: string;
}

// Paymongo billing structure
interface PaymongoBilling {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
}

// Paymongo payment attributes (from webhook data.attributes.data.attributes)
interface PaymongoPaymentAttributes {
  amount?: number;
  currency?: string;
  fee?: number;
  net_amount?: number;
  status?: string;
  source?: PaymongoPaymentSource;
  billing?: PaymongoBilling;
  paid_at?: number;
  created_at?: number;
  updated_at?: number;
  description?: string;
  metadata?: Record<string, string>;
  statement_descriptor?: string;
  balance_transaction_id?: string;
}

// Paymongo checkout session attributes
interface PaymongoCheckoutAttributes {
  checkout_url?: string;
  status?: string;
  line_items?: Array<{
    name?: string;
    quantity?: number;
    amount?: number;
    currency?: string;
    description?: string;
  }>;
  // For checkout_session.payment.paid events, payment data is in payments array
  payments?: Array<{
    id?: string;
    type?: string;
    attributes?: PaymongoPaymentAttributes;
  }>;
  reference_number?: string;
  description?: string;
  metadata?: Record<string, string>;
  created_at?: number;
  updated_at?: number;
  // For payment.paid events, payment data is nested in 'data' field
  data?: {
    id?: string;
    type?: string;
    attributes?: PaymongoPaymentAttributes;
  };
  type?: string; // Event type like 'payment.paid'
}

// Paymongo Metadata structure (stores the full webhook event)
interface PaymongoMetadata {
  id?: string;
  type?: string;
  livemode?: boolean;
  data?: {
    id?: string;
    type?: string;
    attributes?: PaymongoCheckoutAttributes;
  };
  created_at?: number;
  updated_at?: number;
  // Fallback for flat structure
  [key: string]: unknown;
}

interface PaymentMetadataDisplayProps {
  metadata?: PaymongoMetadata | null;
  paymentProvider?: string;
  className?: string;
  /** When true, hides admin-only details like fee breakdown and raw JSON. Use for customer-facing views. */
  hideAdminDetails?: boolean;
}

function formatCurrency(amount: number | undefined, currency?: string) {
  if (amount === undefined) return '-';
  // Convert centavos to pesos if from Paymongo
  const amountInPesos = amount >= 100 ? amount / 100 : amount;
  const currencyCode = currency || 'PHP';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: currencyCode }).format(amountInPesos);
  } catch {
    return `${currencyCode} ${amountInPesos.toFixed(2)}`;
  }
}

function formatDate(timestamp?: number | string) {
  if (!timestamp) return '-';
  try {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(timestamp);
  }
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const normalizedStatus = status.toUpperCase();
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    PAID: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
    SUCCEEDED: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
    PENDING: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock },
    ACTIVE: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', icon: Clock },
    EXPIRED: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400', icon: AlertCircle },
    FAILED: { color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', icon: XCircle },
  };

  const statusConfig = config[normalizedStatus] || config.PENDING;
  const Icon = statusConfig.icon;

  return (
    <Badge className={cn('gap-1.5 font-medium', statusConfig.color)}>
      <Icon className="h-3 w-3" />
      {normalizedStatus}
    </Badge>
  );
}

function PaymentMethodIcon({ sourceType }: { sourceType?: string }) {
  const type = sourceType?.toLowerCase() || '';

  if (type.includes('gcash') || type.includes('grab_pay') || type.includes('paymaya')) {
    return <Smartphone className="h-4 w-4 text-blue-500" />;
  }
  if (type.includes('card')) {
    return <CreditCard className="h-4 w-4 text-primary" />;
  }
  if (type.includes('dob') || type.includes('bank')) {
    return <Building2 className="h-4 w-4 text-slate-500" />;
  }
  return <Wallet className="h-4 w-4 text-green-500" />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied or unavailable - fail silently or show toast
    }
  };

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </Button>
  );
}

function InfoRow({ label, value, copyable }: { label: string; value?: string | number | null; copyable?: boolean }) {
  if (value === undefined || value === null) return null;
  const displayValue = String(value);

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-medium text-right max-w-[200px] truncate" title={displayValue}>
          {displayValue}
        </span>
        {copyable && <CopyButton text={displayValue} />}
      </div>
    </div>
  );
}

export function PaymentMetadataDisplay({ metadata, paymentProvider, className, hideAdminDetails = false }: PaymentMetadataDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!metadata) {
    return null;
  }

  // Extract data from nested Paymongo webhook structure
  // Two possible structures:
  // 1. payment.paid event: data.attributes.data.attributes contains payment info
  // 2. checkout_session.payment.paid event: data.attributes.payments[0].attributes contains payment info
  const eventAttributes = metadata.data?.attributes;

  // For payment.paid events, payment data is nested inside data.attributes.data.attributes
  const nestedPaymentData = eventAttributes?.data?.attributes;

  // For checkout_session.payment.paid events, payment data is in the payments array
  const firstPayment = eventAttributes?.payments?.[0];
  const firstPaymentAttrs = firstPayment?.attributes;

  // Use nested payment data if available (payment.paid events), otherwise use payments array
  const paymentAttrs = nestedPaymentData || firstPaymentAttrs;

  // Get key values from either nested or flat structure
  const nestedPaymentId = eventAttributes?.data?.id;
  const transactionId = nestedPaymentId || firstPayment?.id || metadata.data?.id || metadata.id || (metadata as Record<string, unknown>).payment_id;
  const paymentId = nestedPaymentId || firstPayment?.id || (metadata as Record<string, unknown>).payment_id;

  // Status: for payment.paid events, use the payment status; for checkout events, use checkout status
  const status = paymentAttrs?.status || eventAttributes?.status || (metadata as Record<string, unknown>).status;

  const amount = paymentAttrs?.amount || (metadata as Record<string, unknown>).amount;
  const fee = paymentAttrs?.fee || (metadata as Record<string, unknown>).fees_paid_amount;
  const netAmount = paymentAttrs?.net_amount || (metadata as Record<string, unknown>).adjusted_received_amount;
  const currency = paymentAttrs?.currency || (metadata as Record<string, unknown>).currency || 'PHP';

  // Reference/external ID from metadata
  const paymentMetadata = paymentAttrs?.metadata;
  const referenceNumber =
    paymentMetadata?.external_id ||
    eventAttributes?.reference_number ||
    eventAttributes?.metadata?.external_id ||
    (metadata as Record<string, unknown>).external_id;

  const description = paymentAttrs?.description || eventAttributes?.description || (metadata as Record<string, unknown>).description;
  const sourceType = paymentAttrs?.source?.type || (metadata as Record<string, unknown>).payment_channel;
  const sourceBrand = paymentAttrs?.source?.brand;
  const sourceLast4 = paymentAttrs?.source?.last4;
  const payerEmail = paymentAttrs?.billing?.email || (metadata as Record<string, unknown>).payer_email;
  const payerName = paymentAttrs?.billing?.name;
  const createdAt = paymentAttrs?.created_at || eventAttributes?.created_at || metadata.created_at || (metadata as Record<string, unknown>).created;
  const paidAt = paymentAttrs?.paid_at || (metadata as Record<string, unknown>).paid_at;
  const lineItems = eventAttributes?.line_items;

  const providerColor = paymentProvider === 'PAYMONGO' ? 'bg-green-100 dark:bg-green-950/40' : 'bg-blue-100 dark:bg-blue-950/40';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', providerColor)}>
              <PaymentMethodIcon sourceType={String(sourceType)} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Payment Details</CardTitle>
              <CardDescription className="text-xs">Transaction: {String(transactionId || '-').slice(0, 24)}...</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={String(status)} />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsExpanded(!isExpanded)}>
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 px-4 pb-4 space-y-4">
              {/* Payment Summary */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Amount Paid</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(Number(amount), String(currency))}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Payment Method</p>
                    <div className="flex items-center justify-end gap-1.5">
                      <PaymentMethodIcon sourceType={String(sourceType)} />
                      <span className="font-semibold text-sm">
                        {sourceBrand && sourceLast4 ? `${sourceBrand} •••• ${sourceLast4}` : String(sourceType || '-').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {typeof payerEmail === 'string' && payerEmail && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Paid by: <span className="text-foreground">{payerName ? `${String(payerName)} (${payerEmail})` : payerEmail}</span>
                  </p>
                )}
              </div>

              {/* Transaction Details */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transaction Details</h4>
                <div className="space-y-0.5">
                  <InfoRow label="Transaction ID" value={String(transactionId)} copyable />
                  <InfoRow label="Payment ID" value={String(paymentId)} copyable />
                  <InfoRow label="Reference No" value={String(referenceNumber)} copyable />
                  {typeof description === 'string' && description && <InfoRow label="Description" value={description} />}
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h4>
                <div className="space-y-0.5">
                  <InfoRow label="Created" value={formatDate(createdAt as number | string)} />
                  <InfoRow label="Paid At" value={formatDate(paidAt as number | string)} />
                </div>
              </div>

              {/* Fee Information - Admin only */}
              {!hideAdminDetails && (fee !== undefined || netAmount !== undefined) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fee Breakdown</h4>
                    <div className="space-y-0.5">
                      <InfoRow label="Gross Amount" value={formatCurrency(Number(amount), String(currency))} />
                      <InfoRow label="Platform Fee" value={formatCurrency(Number(fee), String(currency))} />
                      <InfoRow label="Net Amount" value={formatCurrency(Number(netAmount), String(currency))} />
                    </div>
                  </div>
                </>
              )}

              {/* Line Items */}
              {lineItems && lineItems.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items ({lineItems.length})</h4>
                    <div className="space-y-2">
                      {lineItems.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/50 text-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.name || 'Unknown Item'}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.description} • Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.amount, item.currency)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Raw JSON Toggle - Admin only */}
              {!hideAdminDetails && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setShowRawJson(!showRawJson)}>
                    <Info className="h-3 w-3 mr-1.5" />
                    {showRawJson ? 'Hide' : 'Show'} Raw JSON
                  </Button>

                  <AnimatePresence>
                    {showRawJson && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2"
                      >
                        <pre className="p-3 rounded-lg bg-slate-950 dark:bg-slate-900 text-slate-100 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(metadata, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Re-export XenditMetadataDisplay for backward compatibility
export { XenditMetadataDisplay } from './xendit-metadata-display';
