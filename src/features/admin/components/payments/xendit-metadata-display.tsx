'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronDown, CreditCard, Wallet, Building2, ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle, Copy, Check, Info } from 'lucide-react';

interface XenditMetadata {
  id?: string;
  external_id?: string;
  user_id?: string;
  status?: string;
  amount?: number;
  paid_amount?: number;
  currency?: string;
  payment_method?: string;
  payment_channel?: string;
  bank_code?: string;
  ewallet_type?: string;
  payer_email?: string;
  merchant_name?: string;
  description?: string;
  created?: string;
  updated?: string;
  paid_at?: string;
  payment_id?: string;
  payment_method_id?: string;
  payment_destination?: string;
  adjusted_received_amount?: number;
  fees_paid_amount?: number;
  is_high?: boolean;
  failure_redirect_url?: string;
  success_redirect_url?: string;
  items?: Array<{
    url?: string;
    name?: string;
    price?: number;
    category?: string;
    quantity?: number;
  }>;
  [key: string]: unknown;
}

interface XenditMetadataDisplayProps {
  metadata?: XenditMetadata | null;
  className?: string;
}

function formatCurrency(amount: number | undefined, currency?: string) {
  if (amount === undefined) return '-';
  const currencyCode = currency || 'PHP';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const config: Record<string, { color: string; icon: React.ElementType }> = {
    PAID: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
    PENDING: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock },
    EXPIRED: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400', icon: AlertCircle },
    FAILED: { color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', icon: XCircle },
  };

  const statusConfig = config[status] || config.PENDING;
  const Icon = statusConfig.icon;

  return (
    <Badge className={cn('gap-1.5 font-medium', statusConfig.color)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function PaymentMethodIcon({ method, channel }: { method?: string; channel?: string }) {
  const isEwallet = method === 'EWALLET' || channel?.includes('GCASH') || channel?.includes('OVO');
  const isBank = method === 'BANK_TRANSFER' || channel?.includes('PERMATA') || channel?.includes('BCA');

  if (isEwallet) return <Wallet className="h-4 w-4 text-blue-500" />;
  if (isBank) return <Building2 className="h-4 w-4 text-slate-500" />;
  return <CreditCard className="h-4 w-4 text-primary" />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

export function XenditMetadataDisplay({ metadata, className }: XenditMetadataDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!metadata) {
    return null;
  }

  const knownFields = [
    'id',
    'external_id',
    'user_id',
    'status',
    'amount',
    'paid_amount',
    'currency',
    'payment_method',
    'payment_channel',
    'bank_code',
    'ewallet_type',
    'payer_email',
    'merchant_name',
    'description',
    'created',
    'updated',
    'paid_at',
    'payment_id',
    'payment_method_id',
    'payment_destination',
    'adjusted_received_amount',
    'fees_paid_amount',
    'is_high',
    'failure_redirect_url',
    'success_redirect_url',
    'items',
  ];

  const additionalFields = Object.keys(metadata).filter((key) => !knownFields.includes(key));

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40">
              <PaymentMethodIcon method={metadata.payment_method} channel={metadata.payment_channel} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Payment Details</CardTitle>
              <CardDescription className="text-xs">Transaction ID: {metadata.id || metadata.payment_id || '-'}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={metadata.status} />
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
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(metadata.paid_amount || metadata.amount, metadata.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-0.5">Payment Method</p>
                    <div className="flex items-center justify-end gap-1.5">
                      <PaymentMethodIcon method={metadata.payment_method} channel={metadata.payment_channel} />
                      <span className="font-semibold text-sm">
                        {metadata.ewallet_type || metadata.bank_code || metadata.payment_channel || metadata.payment_method || '-'}
                      </span>
                    </div>
                  </div>
                </div>
                {metadata.payer_email && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Paid by: <span className="text-foreground">{metadata.payer_email}</span>
                  </p>
                )}
              </div>

              {/* Transaction Details */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Transaction Details</h4>
                <div className="space-y-0.5">
                  <InfoRow label="Transaction ID" value={metadata.id} copyable />
                  <InfoRow label="Payment ID" value={metadata.payment_id} copyable />
                  <InfoRow label="External ID" value={metadata.external_id} copyable />
                  <InfoRow label="Merchant" value={metadata.merchant_name} />
                  {metadata.description && <InfoRow label="Description" value={metadata.description} />}
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h4>
                <div className="space-y-0.5">
                  <InfoRow label="Created" value={formatDate(metadata.created)} />
                  <InfoRow label="Paid At" value={formatDate(metadata.paid_at)} />
                  <InfoRow label="Updated" value={formatDate(metadata.updated)} />
                </div>
              </div>

              {/* Fee Information */}
              {(metadata.fees_paid_amount !== undefined || metadata.adjusted_received_amount !== undefined) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fee Breakdown</h4>
                    <div className="space-y-0.5">
                      <InfoRow label="Original Amount" value={formatCurrency(metadata.amount, metadata.currency)} />
                      <InfoRow label="Fees Paid" value={formatCurrency(metadata.fees_paid_amount, metadata.currency)} />
                      <InfoRow label="Net Received" value={formatCurrency(metadata.adjusted_received_amount, metadata.currency)} />
                    </div>
                  </div>
                </>
              )}

              {/* Items (if present) */}
              {metadata.items && metadata.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items ({metadata.items.length})</h4>
                    <div className="space-y-2">
                      {metadata.items.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/50 text-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.name || 'Unknown Item'}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.category} • Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold">{formatCurrency(item.price, metadata.currency)}</span>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                            >
                              View Product <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Additional/Unknown Fields */}
              {additionalFields.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Additional Data</h4>
                    <div className="space-y-0.5">
                      {additionalFields.map((key) => {
                        const value = metadata[key];
                        if (typeof value === 'object') return null;
                        return <InfoRow key={key} label={key} value={String(value)} />;
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Raw JSON Toggle */}
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
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
