'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Package,
  ArrowRight,
  Sparkles,
  CalendarDays,
  CreditCard,
  Rocket,
  Clock,
  AlertCircle,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { GoogleCustomerReviews } from '@/src/components/google';

// Custom hook to get window size for confetti
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

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

const checkVariants = {
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

// Pending payment icon animation
const pendingIconVariants = {
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

// Cancelled order icon animation
const cancelledIconVariants = {
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

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkoutId');
  const orderId = searchParams.get('orderId');
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState(200);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Payment actions for single orders
  const createInvoice = useAction(api.payments.actions.index.createXenditInvoice);
  const updateOrderInvoice = useMutation(api.orders.mutations.index.createXenditInvoiceForOrder);

  // Fetch checkout session if checkoutId is provided
  const checkoutSession = useQuery(api.checkoutSessions.queries.index.getCheckoutSessionById, checkoutId ? { checkoutId } : 'skip');
  const orders = useQuery(api.orders.queries.index.getOrdersByCheckoutSession, checkoutId ? { checkoutId } : 'skip');

  // Fetch single order if orderId is provided (for zero-cost voucher orders)
  const singleOrder = useQuery(api.orders.queries.index.getOrderById, orderId ? { orderId: orderId as Id<'orders'> } : 'skip');

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fade out confetti after 5 seconds
    const timer = setTimeout(() => {
      setConfettiPieces(0);
    }, 5000);
    const hideTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Custom confetti draw for stars
  const drawStar = useCallback((ctx: CanvasRenderingContext2D) => {
    const numPoints = 5;
    const outerRadius = 8;
    const innerRadius = 4;
    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }, []);

  // Handle case where neither checkoutId nor orderId is provided
  if (!checkoutId && !orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900 font-heading">Invalid Request</h1>
          <p className="text-slate-500 mb-6">No order or checkout ID provided. Please check your payment confirmation email.</p>
          <Link href="/orders">
            <Button className="bg-[#1d43d8] text-white hover:bg-[#1d43d8]/90 font-semibold">View My Orders</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Loading state: wait for either checkout session or single order
  const isLoadingCheckout = checkoutId && (checkoutSession === undefined || orders === undefined);
  const isLoadingOrder = orderId && singleOrder === undefined;

  if (isLoadingCheckout || isLoadingOrder) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#1d43d8]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1d43d8] animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">Loading your order...</p>
        </motion.div>
      </div>
    );
  }

  // Handle single order case (for zero-cost voucher orders)
  if (orderId && singleOrder) {
    // Check if order is PAID
    if (singleOrder.paymentStatus === 'PAID') {
      // Show success page for paid order
      const isPaidByVoucher = singleOrder.voucherDiscount && singleOrder.voucherDiscount > 0;
      const formattedAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(singleOrder.totalAmount || 0);

      return (
        <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
          {/* Confetti celebration */}
          {showConfetti && (
            <Confetti
              width={width}
              height={height}
              numberOfPieces={confettiPieces}
              recycle={false}
              colors={['#1d43d8', '#4f7df9', '#adfc04', '#fbbf24', '#10b981', '#f59e0b']}
              gravity={0.12}
              wind={0.01}
              initialVelocityY={20}
              drawShape={drawStar}
              tweenDuration={8000}
            />
          )}

          {/* Subtle ambient background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1d43d8]/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
              {/* Success Icon with animated ring */}
              <motion.div variants={checkVariants} className="relative mx-auto w-24 h-24 mb-5">
                {/* Outer pulsing ring */}
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="pulse"
                  className="absolute inset-0 rounded-full bg-emerald-500/20"
                ></motion.div>
                {/* Inner ring */}
                <div className="absolute inset-2 rounded-full bg-emerald-500/10"></div>
                {/* Core circle */}
                <div className="absolute inset-3 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                  <CheckCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
                </div>
                {/* Sparkle decorations */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
                  <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-brand-neon" />
                  <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-emerald-400" />
                  <Sparkles className="absolute -bottom-0.5 left-1/4 w-3 h-3 text-amber-400" />
                </motion.div>
              </motion.div>

              {/* Title Section */}
              <motion.div variants={itemVariants} className="text-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
                  Order <span className="text-emerald-500">Confirmed!</span>
                </h1>
                <p className="text-slate-500 text-sm">
                  {isPaidByVoucher
                    ? 'Your order has been confirmed and paid in full by voucher'
                    : 'Your order has been confirmed and is being processed'}
                </p>
              </motion.div>

              {/* Main Card */}
              <motion.div
                variants={itemVariants}
                className="relative rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-5">
                  {/* Order summary & Amount in one row */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">Order</p>
                      <span className="font-mono text-slate-900 font-semibold text-sm">
                        {singleOrder.orderNumber || `#${singleOrder._id.slice(-8).toUpperCase()}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs mb-0.5">Total {isPaidByVoucher ? 'Paid' : 'Amount'}</p>
                      <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                    </div>
                  </div>

                  {/* Order details */}
                  <div className="flex gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Status</p>
                        <span className="font-semibold text-sm text-emerald-600">Paid</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Date</p>
                        <span className="text-slate-900 font-medium text-sm">
                          {new Date(singleOrder.orderDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voucher info if paid by voucher */}
                  {isPaidByVoucher && singleOrder.voucherCode && (
                    <div className="rounded-lg bg-emerald-50 p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <p className="text-emerald-800 text-xs">
                          Paid in full using voucher <span className="font-mono font-semibold">{singleOrder.voucherCode}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* What's next */}
                  <div className="rounded-lg bg-slate-50 p-3 mb-4 flex items-center gap-3">
                    <Rocket className="w-5 h-5 text-[#1d43d8] shrink-0" />
                    <p className="text-slate-600 text-xs leading-relaxed">We&apos;ll send you updates about your order status via email.</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link href={`/orders/${singleOrder._id}`} className="flex-1">
                      <Button className="w-full h-10 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold text-sm shadow-md shadow-[#1d43d8]/20">
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
              </motion.div>

              {/* Footer note */}
              <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
                A confirmation email has been sent to your email address
              </motion.p>
            </motion.div>

            {/* Google Customer Reviews opt-in */}
            <GoogleCustomerReviews
              orderId={singleOrder.orderNumber || singleOrder._id}
              email={singleOrder.customerInfo.email}
              estimatedDeliveryDate={singleOrder.estimatedDelivery}
              orderDate={singleOrder.orderDate}
            />
          </div>
        </div>
      );
    }

    // If order is not PAID, show pending payment UI
    const handlePayNow = async () => {
      // If payment link exists, redirect immediately
      if (singleOrder.xenditInvoiceUrl) {
        window.location.href = singleOrder.xenditInvoiceUrl;
        return;
      }

      // If no payment link exists, create one
      if (!singleOrder.totalAmount || !singleOrder.customerInfo?.email) {
        showToast({
          type: 'error',
          title: 'Payment link not available',
          description: 'Please refresh the page and try again.',
        });
        return;
      }

      setIsCreatingInvoice(true);
      try {
        showToast({ type: 'info', title: 'Creating payment link...', description: 'Please wait.' });

        const invoice = await createInvoice({
          orderId: singleOrder._id,
          amount: singleOrder.totalAmount,
          customerEmail: singleOrder.customerInfo.email,
          externalId: singleOrder.orderNumber || `order-${singleOrder._id}`,
        });

        await updateOrderInvoice({
          orderId: singleOrder._id,
          xenditInvoiceId: invoice.invoiceId,
          xenditInvoiceUrl: invoice.invoiceUrl,
          xenditInvoiceExpiryDate: invoice.expiryDate,
        });

        showToast({ type: 'success', title: 'Payment link created', description: 'Redirecting...' });
        window.location.href = invoice.invoiceUrl;
      } catch (error) {
        console.error('Failed to create invoice:', error);
        showToast({
          type: 'error',
          title: 'Failed to create payment link',
          description: 'Please try again or contact support.',
        });
      } finally {
        setIsCreatingInvoice(false);
      }
    };

    const formattedAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(singleOrder.totalAmount || 0);
    const hasPaymentLink = !!singleOrder.xenditInvoiceUrl;

    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Subtle ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1d43d8]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
            {/* Pending Icon with animated ring */}
            <motion.div variants={pendingIconVariants} className="relative mx-auto w-24 h-24 mb-5">
              {/* Outer pulsing ring */}
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="pulse"
                className="absolute inset-0 rounded-full bg-amber-500/20"
              ></motion.div>
              {/* Inner ring */}
              <div className="absolute inset-2 rounded-full bg-amber-500/10"></div>
              {/* Core circle */}
              <div className="absolute inset-3 rounded-full bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
                <Clock className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
              {/* Sparkle decorations */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
                <AlertCircle className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400" />
                <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-amber-300" />
              </motion.div>
            </motion.div>

            {/* Title Section */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
                Payment <span className="text-amber-500">Pending</span>
              </h1>
              <p className="text-slate-500 text-sm">Your order has been placed but payment is not yet complete</p>
            </motion.div>

            {/* Main Card - Pending */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-xl border border-amber-200 bg-white shadow-lg shadow-amber-100/50 overflow-hidden"
            >
              {/* Pending banner */}
              <div className="bg-linear-to-r from-amber-50 to-amber-100 px-5 py-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Action Required: Complete your payment</span>
                </div>
              </div>

              <div className="p-5">
                {/* Order summary & Amount in one row */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Order</p>
                    <span className="font-mono text-slate-900 font-semibold text-sm">
                      {singleOrder.orderNumber || `#${singleOrder._id.slice(-8).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-0.5">Amount Due</p>
                    <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                  </div>
                </div>

                {/* Compact Order details */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Status</p>
                      <span className="font-semibold text-sm text-amber-600">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Date</p>
                      <span className="text-slate-900 font-medium text-sm">
                        {new Date(singleOrder.orderDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment instructions */}
                <div className="rounded-lg bg-amber-50 p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium mb-1">Complete your payment</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        Click the button below to complete your payment. Your order will be processed once payment is confirmed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {hasPaymentLink ? (
                    <Button
                      onClick={handlePayNow}
                      className="w-full h-12 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold shadow-md shadow-[#1d43d8]/20"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      {isCreatingInvoice ? (
                        <Button disabled className="w-full h-12 bg-[#1d43d8]/50 text-white font-semibold cursor-not-allowed">
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Creating Payment Link...
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePayNow}
                          className="w-full h-12 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold shadow-md shadow-[#1d43d8]/20"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Create Payment Link
                        </Button>
                      )}
                    </>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/orders/${singleOrder._id}`} className="flex-1">
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

            {/* Footer note */}
            <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
              Need help? Contact our support team for assistance
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Handle checkout session not found
  if (checkoutId && (checkoutSession === null || checkoutSession === undefined || orders === null || orders === undefined || orders.length === 0)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <Package className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900 font-heading">Checkout Not Found</h1>
          <p className="text-slate-500 mb-6">
            We couldn&apos;t find the checkout session you&apos;re looking for. Please contact support if you believe this is an error.
          </p>
          <Link href="/orders">
            <Button className="bg-[#1d43d8] text-white hover:bg-[#1d43d8]/90 font-semibold">View My Orders</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Handle order not found
  if (orderId && singleOrder === null) {
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

  // Type guard: ensure checkoutSession and orders are defined when checkoutId is present
  if (checkoutId && (!checkoutSession || !orders || orders.length === 0)) {
    return null;
  }

  // Derived values from checkout session and orders
  const sessionStatus = checkoutSession!.status;
  const _isPaid = sessionStatus === 'PAID';
  const isPending = sessionStatus === 'PENDING';
  const isCancelled = sessionStatus === 'CANCELLED';
  const isExpired = sessionStatus === 'EXPIRED';
  const hasPaymentLink = !!checkoutSession!.xenditInvoiceUrl;
  const formattedAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(checkoutSession!.totalAmount || 0);

  // Group orders by store
  const ordersByStore = orders!.reduce(
    (acc, order) => {
      const storeName = order.organizationInfo?.name || 'Unknown Store';
      if (!acc[storeName]) {
        acc[storeName] = [];
      }
      acc[storeName].push(order);
      return acc;
    },
    {} as Record<string, typeof orders>
  );

  const _storeCount = Object.keys(ordersByStore).length;
  const orderCount = orders!.length;

  // Helper function to format order number
  const formatOrderNumber = (order: NonNullable<typeof orders>[0]) => {
    return order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`;
  };

  // If checkout session is cancelled or expired, show the cancelled UI
  if (isCancelled || isExpired) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Subtle ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1d43d8]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
            {/* Cancelled Icon with animated ring */}
            <motion.div variants={cancelledIconVariants} className="relative mx-auto w-24 h-24 mb-5">
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
              <div className="absolute inset-3 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/40">
                <XCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
              {/* Sparkle decorations */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
                <AlertCircle className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-red-400" />
                <XCircle className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-red-300" />
              </motion.div>
            </motion.div>

            {/* Title Section */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
                Checkout <span className="text-red-500">{isExpired ? 'Expired' : 'Cancelled'}</span>
              </h1>
              <p className="text-slate-500 text-sm">{isExpired ? 'This checkout session has expired' : 'This checkout session has been cancelled'}</p>
            </motion.div>

            {/* Main Card - Cancelled */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-xl border border-red-200 bg-white shadow-lg shadow-red-100/50 overflow-hidden"
            >
              {/* Cancelled banner */}
              <div className="bg-linear-to-r from-red-50 to-red-100 px-5 py-3 border-b border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    {isExpired ? 'Checkout session has expired' : 'Checkout session has been cancelled'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Order summary & Amount in one row */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">{orderCount === 1 ? 'Order' : `${orderCount} Orders`}</p>
                    <span className="font-mono text-slate-900 font-semibold text-sm">
                      {orderCount === 1 ? formatOrderNumber(orders![0]) : 'These orders have been cancelled.'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-0.5">Total Amount</p>
                    <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                  </div>
                </div>

                {/* Compact Order details */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Status</p>
                      <span className="font-semibold text-sm text-red-600">Cancelled</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Date</p>
                      <span className="text-slate-900 font-medium text-sm">
                        {new Date(checkoutSession!.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders list */}
                {orderCount > 1 && (
                  <div className="rounded-lg bg-slate-50 p-3 mb-4">
                    <p className="text-slate-700 text-xs font-medium mb-2">Orders in this checkout:</p>
                    <div className="space-y-2">
                      {orders!.map((order) => (
                        <div key={order._id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            {order.organizationInfo?.name || 'Unknown Store'} - {formatOrderNumber(order)}
                          </span>
                          <span className="text-slate-900 font-medium">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Information message */}
                <div className="rounded-lg bg-slate-50 p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        If you have any questions about this cancellation, please contact our support team.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {orderCount === 1 ? (
                    <Link href={`/orders/${orders![0]._id}`} className="flex-1">
                      <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                        <Package className="h-4 w-4 mr-1.5" />
                        View Details
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/orders" className="flex-1">
                      <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                        <Package className="h-4 w-4 mr-1.5" />
                        View Orders
                      </Button>
                    </Link>
                  )}
                  <Link href="/orders" className="flex-1">
                    <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                      All Orders
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
              Need help? Contact our support team for assistance
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // If payment is pending, show the pending payment UI
  if (isPending) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Subtle ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#1d43d8]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
            {/* Pending Icon with animated ring */}
            <motion.div variants={pendingIconVariants} className="relative mx-auto w-24 h-24 mb-5">
              {/* Outer pulsing ring */}
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="pulse"
                className="absolute inset-0 rounded-full bg-amber-500/20"
              ></motion.div>
              {/* Inner ring */}
              <div className="absolute inset-2 rounded-full bg-amber-500/10"></div>
              {/* Core circle */}
              <div className="absolute inset-3 rounded-full bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/40">
                <Clock className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
              {/* Sparkle decorations */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
                <AlertCircle className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-400" />
                <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-amber-300" />
              </motion.div>
            </motion.div>

            {/* Title Section */}
            <motion.div variants={itemVariants} className="text-center mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
                Payment <span className="text-amber-500">Pending</span>
              </h1>
              <p className="text-slate-500 text-sm">Your order has been placed but payment is not yet complete</p>
            </motion.div>

            {/* Main Card - Pending */}
            <motion.div
              variants={itemVariants}
              className="relative rounded-xl border border-amber-200 bg-white shadow-lg shadow-amber-100/50 overflow-hidden"
            >
              {/* Pending banner */}
              <div className="bg-linear-to-r from-amber-50 to-amber-100 px-5 py-3 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Action Required: Complete your payment</span>
                </div>
              </div>

              <div className="p-5">
                {/* Order summary & Amount in one row */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">{orderCount === 1 ? 'Order' : `${orderCount} Orders`}</p>
                    <span className="font-mono text-slate-900 font-semibold text-sm">
                      {orderCount === 1 ? formatOrderNumber(orders![0]) : 'Thank you for your order!'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-0.5">Amount Due</p>
                    <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                  </div>
                </div>

                {/* Compact Order details */}
                <div className="flex gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Status</p>
                      <span className="font-semibold text-sm text-amber-600">Pending</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Date</p>
                      <span className="text-slate-900 font-medium text-sm">
                        {new Date(checkoutSession!.createdAt!).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders list for multiple orders */}
                {orderCount > 1 && (
                  <div className="rounded-lg bg-amber-50/50 p-3 mb-4">
                    <p className="text-amber-800 text-xs font-medium mb-2">Orders in this checkout:</p>
                    <div className="space-y-2">
                      {orders?.map((order) => (
                        <div key={order._id} className="flex items-center justify-between text-xs">
                          <span className="text-amber-700">
                            {order.organizationInfo?.name || 'Unknown Store'} - {formatOrderNumber(order)}
                          </span>
                          <span className="text-amber-900 font-medium">
                            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment instructions */}
                <div className="rounded-lg bg-amber-50 p-3 mb-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium mb-1">Complete your payment</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        Click the button below to complete your payment. Your order will be processed once payment is confirmed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {hasPaymentLink ? (
                    <Button
                      onClick={() => window.open(checkoutSession!.xenditInvoiceUrl!, '_blank')}
                      className="w-full h-12 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold shadow-md shadow-[#1d43d8]/20"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Complete Payment
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="rounded-lg bg-amber-50 p-3 mb-2">
                      <p className="text-amber-800 text-xs">Payment link is being generated. Please check back in a moment or contact support.</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {orderCount === 1 ? (
                      <Link href={`/orders/${orders![0]._id}`} className="flex-1">
                        <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                          <Package className="h-4 w-4 mr-1.5" />
                          View Details
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/orders" className="flex-1">
                        <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                          <Package className="h-4 w-4 mr-1.5" />
                          View Orders
                        </Button>
                      </Link>
                    )}
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

            {/* Footer note */}
            <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
              Need help? Contact our support team for assistance
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Payment is complete - show success UI
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={confettiPieces}
          recycle={false}
          colors={['#1d43d8', '#4f7df9', '#adfc04', '#fbbf24', '#10b981', '#f59e0b']}
          gravity={0.12}
          wind={0.01}
          initialVelocityY={20}
          drawShape={drawStar}
          tweenDuration={8000}
        />
      )}

      {/* Subtle ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1d43d8]/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-neon/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
          {/* Success Icon with animated ring */}
          <motion.div variants={checkVariants} className="relative mx-auto w-24 h-24 mb-5">
            {/* Outer pulsing ring */}
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            ></motion.div>
            {/* Inner ring */}
            <div className="absolute inset-2 rounded-full bg-emerald-500/10"></div>
            {/* Core circle */}
            <div className="absolute inset-3 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <CheckCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
            {/* Sparkle decorations */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
              <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-brand-neon" />
              <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-emerald-400" />
              <Sparkles className="absolute -bottom-0.5 left-1/4 w-3 h-3 text-amber-400" />
            </motion.div>
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
              Payment <span className="text-emerald-500">Successful!</span>
            </h1>
            <p className="text-slate-500 text-sm">
              {orderCount === 1
                ? 'Your order has been confirmed and is being processed'
                : `Your ${orderCount} orders have been confirmed and are being processed`}
            </p>
          </motion.div>

          {/* Main Card - Compact */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-5">
              {/* Order summary & Amount in one row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">{orderCount === 1 ? 'Order' : `${orderCount} Orders`}</p>
                  <span className="font-mono text-slate-900 font-semibold text-sm">
                    {orderCount === 1 ? formatOrderNumber(orders![0]) : 'Thank you for your payment!'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs mb-0.5">Total Paid</p>
                  <p className="text-2xl font-bold text-slate-900 font-heading">{formattedAmount}</p>
                </div>
              </div>

              {/* Compact Order details */}
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Status</p>
                    <span className="font-semibold text-sm text-emerald-600">Paid</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Date</p>
                    <span className="text-slate-900 font-medium text-sm">
                      {new Date(checkoutSession!.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders list grouped by store */}
              {orderCount > 1 && (
                <div className="rounded-lg bg-slate-50 p-3 mb-4">
                  <p className="text-slate-700 text-xs font-medium mb-3">Orders in this checkout:</p>
                  <div className="space-y-3">
                    {Object.entries(ordersByStore!).map(([storeName, storeOrders]) => (
                      <div key={storeName} className="border-b border-slate-200 last:border-b-0 pb-2 last:pb-0">
                        <p className="text-slate-600 text-xs font-semibold mb-1.5">{storeName}</p>
                        <div className="space-y-1.5 pl-2">
                          {storeOrders!.map((order) => (
                            <div key={order._id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">{formatOrderNumber(order)}</span>
                              <span className="text-slate-900 font-medium">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact What's next */}
              <div className="rounded-lg bg-slate-50 p-3 mb-4 flex items-center gap-3">
                <Rocket className="w-5 h-5 text-[#1d43d8] shrink-0" />
                <p className="text-slate-600 text-xs leading-relaxed">We&apos;ll send you updates about your order status via email.</p>
              </div>

              {/* Action buttons - Compact */}
              <div className="flex gap-2">
                {orderCount === 1 ? (
                  <Link href={`/orders/${orders![0]._id}`} className="flex-1">
                    <Button className="w-full h-10 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold text-sm shadow-md shadow-[#1d43d8]/20">
                      <Package className="h-4 w-4 mr-1.5" />
                      View Details
                    </Button>
                  </Link>
                ) : (
                  <Link href="/orders" className="flex-1">
                    <Button className="w-full h-10 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white font-semibold text-sm shadow-md shadow-[#1d43d8]/20">
                      <Package className="h-4 w-4 mr-1.5" />
                      View Orders
                    </Button>
                  </Link>
                )}
                <Link href="/orders" className="flex-1">
                  <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm">
                    All Orders
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs mt-4">
            A confirmation email has been sent to your email address
          </motion.p>
        </motion.div>

        {/* Google Customer Reviews opt-in */}
        <GoogleCustomerReviews
          orderId={orders![0].orderNumber || checkoutId || orders![0]._id}
          email={orders![0].customerInfo.email}
          estimatedDeliveryDate={orders![0].estimatedDelivery}
          orderDate={orders![0].orderDate}
        />
      </div>
    </div>
  );
}
