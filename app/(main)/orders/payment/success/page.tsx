'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Sparkles, CalendarDays, CreditCard, Rocket } from 'lucide-react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

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
      type: 'spring',
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
      type: 'spring',
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
      ease: 'easeInOut',
    },
  },
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState(200);

  const order = useQuery(api.orders.queries.index.getOrderById, orderId ? { orderId: orderId as Id<'orders'> } : 'skip');

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

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900 font-heading">Invalid Request</h1>
          <p className="text-slate-500 mb-6">No order ID provided. Please check your payment confirmation email.</p>
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
          <p className="text-slate-500 font-medium">Loading your order...</p>
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
  const isPaid = order.paymentStatus === 'PAID';
  const formattedAmount = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalAmount || 0);

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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1d43d8]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#adfc04]/[0.05] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
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
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <CheckCircle className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
            </div>
            {/* Sparkle decorations */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-0">
              <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-[#adfc04]" />
              <Sparkles className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 text-emerald-400" />
              <Sparkles className="absolute -bottom-0.5 left-1/4 w-3 h-3 text-amber-400" />
            </motion.div>
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-heading tracking-tight">
              Payment <span className="text-emerald-500">Successful!</span>
            </h1>
            <p className="text-slate-500 text-sm">Your order has been confirmed and is being processed</p>
          </motion.div>

          {/* Main Card - Compact */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-5">
              {/* Order number & Amount in one row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Order</p>
                  <span className="font-mono text-slate-900 font-semibold text-sm">{orderNumber}</span>
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
                    <span className={`font-semibold text-sm ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isPaid ? 'Paid' : 'Processing'}
                    </span>
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

              {/* Compact What's next */}
              <div className="rounded-lg bg-slate-50 p-3 mb-4 flex items-center gap-3">
                <Rocket className="w-5 h-5 text-[#1d43d8] flex-shrink-0" />
                <p className="text-slate-600 text-xs leading-relaxed">We&apos;ll send you updates about your order status via email.</p>
              </div>

              {/* Action buttons - Compact */}
              <div className="flex gap-2">
                <Link href={`/orders/${order._id}`} className="flex-1">
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
      </div>
    </div>
  );
}
