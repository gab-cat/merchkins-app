'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  ListChecks,
  StickyNote,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Shield,
  Package,
  Store,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Lock,
  Truck,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { showToast, promiseToast } from '@/lib/toast';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { cn } from '@/lib/utils';

// Animation variants matching orders page
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

// Progress steps component
function CheckoutProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: 'Cart', icon: ShoppingBag },
    { label: 'Checkout', icon: Receipt },
    { label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300',
                  isComplete && 'bg-emerald-500 text-white',
                  isActive && 'bg-[#1d43d8] text-white shadow-md shadow-[#1d43d8]/25',
                  !isComplete && !isActive && 'bg-slate-100 text-slate-400'
                )}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive ? 'text-[#1d43d8]' : isComplete ? 'text-emerald-600' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn('w-8 sm:w-12 h-0.5 rounded-full transition-colors', index < currentStep ? 'bg-emerald-500' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Loading skeleton
function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse" />
        </div>

        {/* Progress skeleton */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
              {i < 3 && <div className="w-12 h-0.5 bg-slate-100" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="h-6 w-32 rounded-lg bg-slate-100 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                  <div className="h-16 w-16 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded-lg bg-slate-100 animate-pulse" />
                  </div>
                  <div className="h-5 w-16 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="h-6 w-32 rounded-lg bg-slate-100 animate-pulse" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-4 w-16 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between">
                  <div className="h-5 w-16 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-6 w-24 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyCheckout() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Animated icon */}
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="relative mb-8">
            <div className="absolute inset-0 h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/20 to-[#adfc04]/20 blur-xl" />
            <div className="relative h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center border border-[#1d43d8]/10">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <ShoppingBag className="h-12 w-12 text-[#1d43d8]/50" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-1 -right-4 h-4 w-4 rounded-full bg-[#adfc04]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <h1 className="text-2xl font-bold mb-3 font-heading text-slate-900">Nothing to checkout</h1>
          <p className="text-slate-500 mb-8 text-base">Select at least one item in your cart to proceed with checkout.</p>

          <Link href="/cart">
            <Button
              size="lg"
              className="group bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-[#1d43d8]/25 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Cart
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Checkout item component
interface CheckoutItemProps {
  item: {
    productInfo: {
      productId: Id<'products'>;
      title: string;
      price: number;
      imageUrl?: string[];
      variantName?: string | null;
      organizationId?: Id<'organizations'>;
      organizationName?: string;
    };
    quantity: number;
    variantId?: string;
    note?: string;
    size?: { label: string };
  };
}

function CheckoutItem({ item }: CheckoutItemProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200 group"
    >
      {/* Product image */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
        {item.productInfo.imageUrl?.[0] ? (
          <R2Image
            fileKey={item.productInfo.imageUrl[0]}
            alt={item.productInfo.title}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-6 w-6 text-slate-300" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-slate-900 truncate group-hover:text-[#1d43d8] transition-colors">{item.productInfo.title}</h4>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.productInfo.variantName && <span className="text-xs text-slate-500">{item.productInfo.variantName}</span>}
          {item.size && (
            <span className="px-2 py-0.5 rounded-full bg-[#1d43d8]/10 text-[#1d43d8] text-[10px] font-medium">Size: {item.size.label}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {item.quantity} × {formatCurrency(item.productInfo.price)}
        </p>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="font-bold text-[#1d43d8]">{formatCurrency(item.quantity * item.productInfo.price)}</p>
      </div>
    </motion.div>
  );
}

// Main checkout component
export function CheckoutPage() {
  const { userId: clerkId } = useAuth();
  const cart = useQuery(api.carts.queries.index.getCartByUser, {});
  const createOrder = useMutation(api.orders.mutations.index.createOrder);
  const removeMultipleCartItems = useMutation(api.carts.mutations.index.removeMultipleItems);
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  const [notes, setNotes] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const selectedItems = useMemo(() => {
    const items = cart?.embeddedItems ?? [];
    return items.filter((i) => i.selected && i.quantity > 0);
  }, [cart]);

  const selectedByOrg = useMemo(() => {
    type Line = (typeof selectedItems)[number] & { productInfo: { organizationId?: string; organizationName?: string } };
    const groups: Record<string, { name: string; items: Array<Line> }> = {};
    for (const raw of selectedItems as Array<Line>) {
      const orgId = String(raw.productInfo.organizationId ?? 'global');
      const orgName = raw.productInfo.organizationName ?? 'Merchkins Store';
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] };
      groups[orgId].items.push(raw);
    }
    return groups;
  }, [selectedItems]);

  const totals = useMemo(() => {
    return {
      quantity: selectedItems.reduce((s, i) => s + i.quantity, 0),
      amount: selectedItems.reduce((s, i) => s + i.quantity * i.productInfo.price, 0),
    };
  }, [selectedItems]);

  const shopSubtotals = useMemo(() => {
    return Object.entries(selectedByOrg).map(([orgId, group]) => {
      const quantity = group.items.reduce((s, i) => s + i.quantity, 0);
      const amount = group.items.reduce((s, i) => s + i.quantity * i.productInfo.price, 0);
      return {
        orgId,
        name: group.name,
        quantity,
        amount,
      };
    });
  }, [selectedByOrg]);

  const canCheckout = !!cart && selectedItems.length > 0 && !!me;

  async function handlePlaceOrder() {
    if (!canCheckout || !me) return;
    setIsPlacing(true);
    setError(null);
    try {
      // Create one order per organization group
      const promises: Array<
        Promise<{
          orderId: Id<'orders'>;
          orderNumber: string | undefined;
          xenditInvoiceUrl: string | undefined;
          xenditInvoiceId: string | undefined;
          totalAmount: number;
        }>
      > = [];
      for (const [orgId, group] of Object.entries(selectedByOrg)) {
        const items = group.items.map((it) => ({
          productId: it.productInfo.productId,
          variantId: 'variantId' in it ? (it as { variantId?: string }).variantId : undefined,
          quantity: it.quantity,
          price: it.productInfo.price,
          customerNote: it.note,
        }));
        const orgIdArg = orgId !== 'global' ? (orgId as unknown as Id<'organizations'>) : undefined;
        promises.push(
          createOrder({
            customerId: me._id,
            organizationId: orgIdArg,
            items,
            customerNotes: notes || undefined,
          })
        );
      }

      const results = await promiseToast(Promise.all(promises), {
        loading: 'Processing your order…',
        success: 'Order placed successfully!',
        error: () => 'Failed to place order',
      });

      // Remove the ordered items from cart
      if (cart?._id) {
        try {
          const itemsToRemove = selectedItems.map((item) => ({
            productId: item.productInfo.productId,
            variantId: item.variantId,
          }));

          if (itemsToRemove.length > 0) {
            await removeMultipleCartItems({
              cartId: cart._id,
              items: itemsToRemove,
            });
          }
        } catch (cartError) {
          console.error('Failed to remove items from cart:', cartError);
          // Don't fail the order placement if cart removal fails
        }
      }

      // Check if any order has a Xendit invoice URL
      let xenditUrl: string | null = null;
      let firstOrderId: string | null = null;

      for (const result of results) {
        if (result && typeof result === 'object') {
          // Capture the first order ID
          if (!firstOrderId && 'orderId' in result && result.orderId) {
            firstOrderId = result.orderId;
          }
          // Check for Xendit invoice URL
          if ('xenditInvoiceUrl' in result && result.xenditInvoiceUrl) {
            xenditUrl = result.xenditInvoiceUrl;
            break;
          }
        }
      }

      if (xenditUrl) {
        // Redirect to Xendit payment page
        window.location.href = xenditUrl;
      } else if (firstOrderId) {
        // Redirect to success page to show payment status
        window.location.href = `/orders/payment/success?orderId=${firstOrderId}`;
      } else {
        // Fallback to orders page if no order ID
        window.location.href = '/orders';
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      setError(message);
      showToast({ type: 'error', title: message });
    } finally {
      setIsPlacing(false);
    }
  }

  // Loading state
  if (cart === undefined || me === undefined) {
    return <CheckoutSkeleton />;
  }

  // Empty state
  if (!canCheckout) {
    return <EmptyCheckout />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <BlurFade delay={0.05}>
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
        </BlurFade>

        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#1d43d8]/10">
                <Receipt className="h-6 w-6 text-[#1d43d8]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-slate-900">Checkout</h1>
            </div>
            <p className="text-slate-500">Review your order and complete your purchase</p>
          </div>
        </BlurFade>

        {/* Progress indicator */}
        <BlurFade delay={0.15}>
          <CheckoutProgress currentStep={1} />
        </BlurFade>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Order items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review items */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
                        <ListChecks className="h-4 w-4 text-[#1d43d8]" />
                      </div>
                      <h2 className="font-bold text-slate-900">Review Items</h2>
                    </div>
                    <span className="text-sm text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                      {totals.quantity} item{totals.quantity !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Items by organization */}
                <div className="p-5 space-y-6">
                  {Object.entries(selectedByOrg).map(([orgId, group]) => (
                    <motion.div key={orgId} variants={itemVariants} className="space-y-3">
                      {/* Store header */}
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-[#1d43d8]" />
                        <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-xs text-slate-400">
                          {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <CheckoutItem
                            key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                            item={item as CheckoutItemProps['item']}
                          />
                        ))}
                      </div>

                      {/* Store subtotal */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm text-slate-500">Store subtotal</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(group.items.reduce((s, i) => s + i.quantity * i.productInfo.price, 0))}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Order notes */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
                      <StickyNote className="h-4 w-4 text-[#1d43d8]" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">Order Notes</h2>
                      <p className="text-xs text-slate-500">Add special instructions (optional)</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <Textarea
                    placeholder="Any special requests or delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-24 rounded-xl border-slate-200 focus:border-[#1d43d8]/30 focus:ring-[#1d43d8]/10 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Order summary */}
          <div className="space-y-6">
            {/* Summary card */}
            <motion.div variants={itemVariants}>
              <Card className="sticky top-24 rounded-2xl pt-0 border border-slate-100 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-br from-[#1d43d8]/5 to-[#adfc04]/5 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-[#1d43d8]">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="font-bold">Order Summary</h2>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Shop subtotals */}
                    {shopSubtotals.map((shop) => (
                      <div key={shop.orgId} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          <Store className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-32">{shop.name}</span>
                          <span className="text-slate-400">({shop.quantity})</span>
                        </span>
                        <span className="font-medium text-slate-900">{formatCurrency(shop.amount)}</span>
                      </div>
                    ))}

                    <div className="h-px bg-slate-100" />

                    {/* Shipping estimate */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                        Shipping
                      </span>
                      <span className="text-slate-500 text-xs">Calculated at payment</span>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Total */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-[#1d43d8]">{formatCurrency(totals.amount)}</span>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Terms agreement */}
                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="terms-agreement"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                        className={cn(
                          'mt-0.5 h-5 w-5 rounded-md border-2 transition-colors',
                          !agreeToTerms ? 'border-slate-300' : 'border-[#1d43d8] data-[state=checked]:bg-[#1d43d8]'
                        )}
                      />
                      <label htmlFor="terms-agreement" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-[#1d43d8] hover:underline font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#1d43d8] hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Place order button */}
                    <Button
                      className={cn(
                        'group relative w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden mt-2',
                        agreeToTerms
                          ? 'bg-[#1d43d8] hover:bg-[#1d43d8]/90 shadow-lg shadow-[#1d43d8]/25 hover:shadow-xl hover:shadow-[#1d43d8]/30'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      )}
                      onClick={handlePlaceOrder}
                      disabled={isPlacing || !agreeToTerms}
                    >
                      {isPlacing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Place Order
                          <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </>
                      )}
                    </Button>

                    {/* Terms warning */}
                    <AnimatePresence>
                      {!agreeToTerms && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-amber-600 text-center flex items-center justify-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Please agree to the terms to continue
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl border border-slate-100 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">Secure Checkout</h3>
                      <p className="text-xs text-slate-500">Your data is protected</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-slate-600">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-slate-600">Safe Payment</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-slate-600">Money Back</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-slate-600">24/7 Support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
