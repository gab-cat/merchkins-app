'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, FileText, CheckCircle2, Clock, Loader2, TrendingUp, Package, CreditCard, ArrowRight } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

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
  // Adjustment fields
  totalAdjustmentAmount?: number;
  adjustmentCount?: number;
  status: PayoutStatus;
  paidAt?: number;
  paymentReference?: string;
  paymentNotes?: string;
  invoiceUrl?: string;
  pdfStorageKey?: string;
  createdAt: number;
}

interface InvoiceDetailDialogProps {
  invoice: PayoutInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (invoice: PayoutInvoice) => void;
}

// Helper functions
const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatLongDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1] as number[],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

// Status Badge with animations
function AnimatedStatusBadge({ status }: { status: PayoutStatus }) {
  const statusConfig: Record<PayoutStatus, { label: string; bgClass: string; textClass: string; icon: typeof CheckCircle2 }> = {
    PENDING: {
      label: 'Pending',
      bgClass: 'bg-amber-100 dark:bg-amber-900/30',
      textClass: 'text-amber-700 dark:text-amber-400',
      icon: Clock,
    },
    PROCESSING: {
      label: 'Processing',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      textClass: 'text-blue-700 dark:text-blue-400',
      icon: Loader2,
    },
    PAID: {
      label: 'Paid',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: 'Cancelled',
      bgClass: 'bg-red-100 dark:bg-red-900/30',
      textClass: 'text-red-700 dark:text-red-400',
      icon: Clock,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <Badge
        className={`${config.bgClass} ${config.textClass} px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border-0 flex items-center gap-1.5`}
      >
        <Icon className={`h-3.5 w-3.5 ${status === 'PROCESSING' ? 'animate-spin' : ''} ${status === 'PENDING' ? 'animate-pulse' : ''}`} />
        {config.label}
      </Badge>
    </motion.div>
  );
}

// Stat Card Component - Compact
function StatCard({
  label,
  value,
  icon: Icon,
  accentColor = 'primary',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: typeof TrendingUp;
  accentColor?: 'primary' | 'emerald' | 'amber';
  delay?: number;
}) {
  const iconColorClasses = {
    primary: 'text-primary',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  };

  return (
    <motion.div variants={itemVariants} custom={delay} className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${iconColorClasses[accentColor]}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</p>
          <p className="text-sm font-bold tracking-tight font-admin-heading truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function InvoiceDetailDialog({ invoice, isOpen, onClose, onViewInvoice }: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const isPaid = invoice.status === 'PAID';
  const isPending = invoice.status === 'PENDING';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden p-0 gap-0 border border-border/50">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 px-5 py-6 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-brand-neon/20 rounded-full blur-xl" />

          <DialogHeader className="relative z-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/70 text-xs font-medium uppercase tracking-widest"
                >
                  Payout Invoice
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <DialogTitle className="text-white font-bold text-xl tracking-tight font-admin-heading">{invoice.invoiceNumber}</DialogTitle>
                </motion.div>
              </div>
              <AnimatedStatusBadge status={invoice.status} />
            </div>

            {/* Period dates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-white/80"
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDate(invoice.periodStart)} — {formatDate(invoice.periodEnd)}
              </span>
            </motion.div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)]">
          <AnimatePresence>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {/* View Invoice Action */}
              <motion.div variants={itemVariants}>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">View Invoice</p>
                        <p className="text-xs text-muted-foreground">Open detailed invoice page</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(invoice)}
                      className="border-primary/30 hover:bg-primary/10 hover:text-primary h-8"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Financial Summary - Light Theme Compact */}
              <motion.div
                variants={itemVariants}
                className="rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 via-background to-muted/20 p-4 relative overflow-hidden"
              >
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-primary rounded-full" />
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Financial Summary</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Gross Sales</span>
                      <span className="font-mono font-semibold text-sm text-foreground">{formatCurrency(invoice.grossAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Platform Fee ({invoice.platformFeePercentage}%)</span>
                      <span className="font-mono font-semibold text-sm text-red-500">-{formatCurrency(invoice.platformFeeAmount)}</span>
                    </div>
                    {invoice.totalAdjustmentAmount && invoice.totalAdjustmentAmount < 0 && (
                      <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Adjustments</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                            {invoice.adjustmentCount} {invoice.adjustmentCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-sm text-red-500">{formatCurrency(invoice.totalAdjustmentAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                    <span className="font-semibold text-sm text-foreground">Your Payout</span>
                    <span className="font-mono font-bold text-2xl text-primary tracking-tight">{formatCurrency(invoice.netAmount)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Orders" value={invoice.orderCount} icon={Package} accentColor="primary" delay={0.1} />
                <StatCard label="Items Sold" value={invoice.itemCount} icon={TrendingUp} accentColor="emerald" delay={0.2} />
                <StatCard label="Total Revenue" value={formatCurrency(invoice.grossAmount)} icon={CreditCard} accentColor="amber" delay={0.3} />
              </div>

              {/* Payment Status Cards */}
              {isPaid && invoice.paidAt && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-900/20 dark:border-emerald-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">Payment Confirmed</h4>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">{formatDate(invoice.paidAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {invoice.paymentReference && (
                          <span className="font-mono bg-emerald-200/50 dark:bg-emerald-800/30 px-1.5 py-0.5 rounded truncate">
                            Ref: {invoice.paymentReference}
                          </span>
                        )}
                        {invoice.paymentNotes && <span className="italic truncate">"{invoice.paymentNotes}"</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {isPending && (
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg border border-amber-200 bg-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300">Payment Pending</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Payout processed on upcoming Friday</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-muted/30 px-5 py-3 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceDetailDialog;
