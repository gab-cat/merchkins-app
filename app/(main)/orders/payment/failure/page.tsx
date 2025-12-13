'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, ArrowRight, MessageCircle, Package, CreditCard, CalendarDays, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const failedIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
};

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const order = useQuery(api.orders.queries.index.getOrderById, orderId ? { orderId: orderId as Id<'orders'> } : 'skip');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900 font-heading">Invalid Request</h1>
          <p className="text-slate-500 mb-6">No order ID provided. Please check your order details.</p>
          <Link href="/orders">
            <Button className="bg-[#1d43d8] text-white hover:bg-[#1d43d8]/90 font-semibold">View My Orders</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#1d43d8]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1d43d8] animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <Package className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900 font-heading">Order Not Found</h1>
          <p className="text-slate-500 mb-6">
            We couldn&apos;t find the order you&apos;re looking for. Please contact support if you believe this is an error.
          </p>
          <Link href="/orders">
            <Button className="bg-[#1d43d8] text-white hover:bg-[#1d43d8]/90 font-semibold">View My Orders</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`;
  const canRetryPayment = order.status === 'PENDING' && order.paymentStatus !== 'PAID';
  const formattedAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      {/* Subtle ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1d43d8]/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      </div>

      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(#1d43d8 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-md mx-auto">
          {/* Failed Icon with animated ring */}
          <motion.div variants={failedIconVariants} className="relative mx-auto w-24 h-24 mb-5">
            {/* Outer pulsing ring */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
              className="absolute inset-0 rounded-full bg-red-500/20"
            ></motion.div>
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full bg-red-500/10"></div>
            {/* Core circle */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
              <XCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
            {/* Sparkle decorations */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
              <AlertTriangle className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-red-400" />
              <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-red-300" />
            </motion.div>
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
              Payment <span className="text-red-500">Failed</span>
            </h1>
            <p className="text-slate-500 text-sm">Your payment could not be processed at this time</p>
          </motion.div>

          {/* Main Card - Failed */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-xl border border-red-200 bg-white shadow-lg shadow-red-100/50 overflow-hidden"
          >
            {/* Failed banner */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-5 py-3 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Payment could not be completed</span>
              </div>
            </div>

            <div className="p-5">
              {/* Order number & Amount in one row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Order</p>
                  <span className="font-mono text-slate-900 font-semibold text-sm">{orderNumber}</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs mb-0.5">Amount</p>
                  <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                </div>
              </div>

              {/* Compact Order details */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Payment</p>
                    <span className="font-semibold text-sm text-red-600">Failed</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Date</p>
                    <span className="text-slate-900 font-medium text-sm">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Common failure reasons */}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
                <p className="text-amber-800 text-xs font-medium mb-2">Common reasons:</p>
                <ul className="text-amber-700 text-xs space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                    Insufficient funds
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                    Payment method declined
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                    Session expired
                  </li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {canRetryPayment && order.xenditInvoiceUrl && (
                  <Button
                    onClick={() => {
                      // External Xendit URL - use window.location for external redirects
                      if (order.xenditInvoiceUrl) {
                        window.location.href = order.xenditInvoiceUrl;
                      }
                    }}
                    className="w-full h-12 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold shadow-md shadow-[#1d43d8]/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Payment Again
                  </Button>
                )}

                <div className="flex gap-2">
                  <Link href={`/orders/${order._id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                      <Package className="h-4 w-4 mr-1.5" />
                      View Details
                    </Button>
                  </Link>
                  <Link href="/orders" className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                      All Orders
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Help section */}
          <motion.div variants={itemVariants} className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1d43d8]/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-[#1d43d8]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Need Help?</h4>
                <p className="text-slate-500 text-xs mt-1">
                  If you&apos;re experiencing repeated issues, please contact our support team for assistance.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
            Your order is saved and you can retry payment at any time
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
