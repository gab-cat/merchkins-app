'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { R2Image } from '@/src/components/ui/r2-image';
import { showToast, promiseToast } from '@/lib/toast';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Package,
  Store,
  Sparkles,
  CheckCircle2,
  Receipt,
  Tag,
  Info,
  Ticket,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BlurFade } from '@/src/components/ui/animations/effects';

// Animation variants
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
function CartProgress({ currentStep }: { currentStep: number }) {
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
function CartSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-8 w-32 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-4 w-48 rounded-lg bg-slate-100 animate-pulse" />
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
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-5">
                <div className="flex items-start gap-4">
                  <div className="h-5 w-5 rounded-md bg-slate-100 animate-pulse" />
                  <div className="h-20 w-20 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-4 w-1/2 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 rounded-xl bg-slate-100 animate-pulse" />
                      <div className="h-8 w-20 rounded-xl bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))}
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
                  <div className="h-5 w-20 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-7 w-28 rounded-lg bg-slate-100 animate-pulse" />
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

// Empty cart component
function EmptyCart() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Animated icon */}
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="relative mb-8">
            <div className="absolute inset-0 h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/20 to-[#adfc04]/20 blur-xl" />
            <div className="relative h-28 w-28 mx-auto rounded-3xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center border border-[#1d43d8]/10">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <ShoppingCart className="h-12 w-12 text-[#1d43d8]/50" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-1 -right-4 h-4 w-4 rounded-full bg-[#adfc04]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <h1 className="text-2xl font-bold mb-3 font-heading text-slate-900">Your cart is empty</h1>
          <p className="text-slate-500 mb-8 text-base">Browse our products and add items to your cart to get started.</p>

          <Link href="/">
            <Button
              size="lg"
              className="group bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-[#1d43d8]/25 transition-all duration-300 hover:scale-105"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export function CartPage() {
  const cart = useQuery(api.carts.queries.index.getCartByUser, {});
  const clearCart = useMutation(api.carts.mutations.index.clearCart);

  const hasItems = (cart?.embeddedItems?.length ?? 0) > 0;

  const totals = useMemo(() => {
    return {
      totalItems: cart?.totalItems ?? 0,
      totalValue: cart?.totalValue ?? 0,
      selectedItems: cart?.selectedItems ?? 0,
      selectedValue: cart?.selectedValue ?? 0,
    };
  }, [cart]);

  const groupedByOrg = useMemo(() => {
    const groups: Record<string, { name: string; items: Array<CartItem> }> = {};
    for (const raw of cart?.embeddedItems ?? []) {
      const item = raw as CartItem;
      const orgId = String(item.productInfo.organizationId ?? 'global');
      const orgName = item.productInfo.organizationName ?? 'Merchkins Store';
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] };
      groups[orgId].items.push(item);
    }
    return groups;
  }, [cart]);

  async function handleClear() {
    if (!cart) return;
    try {
      await promiseToast(clearCart({ cartId: cart._id }), {
        loading: 'Clearing cart…',
        success: 'Cart cleared',
        error: () => 'Failed to clear cart',
      });
    } catch {
      // no-op
    }
  }

  // Loading state
  if (cart === undefined) {
    return <CartSkeleton />;
  }

  // Empty state
  if (!cart || !hasItems) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#1d43d8]/10">
                <ShoppingCart className="h-6 w-6 text-[#1d43d8]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-slate-900">Your Cart</h1>
            </div>
            <p className="text-slate-500">
              {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''} ready for checkout
            </p>
          </div>
        </BlurFade>

        {/* Progress indicator */}
        <BlurFade delay={0.15}>
          <CartProgress currentStep={0} />
        </BlurFade>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {Object.entries(groupedByOrg).map(([orgId, group]) => (
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
                  {group.items.map((item, itemIndex) => (
                    <CartLineItem
                      key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                      cartId={cart._id}
                      item={item}
                      index={itemIndex}
                    />
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear cart button */}
            <motion.div variants={itemVariants} className="pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handleClear}
                className="rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear cart
              </Button>
            </motion.div>
          </div>

          {/* Order summary */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="sticky top-24 rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-br from-[#1d43d8]/5 to-[#adfc04]/5 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-[#1d43d8]">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="font-bold">Order Summary</h2>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <Tag className="h-3.5 w-3.5 text-slate-400" />
                        Subtotal ({totals.totalItems} items)
                      </span>
                      <span className="font-medium text-slate-900">{formatCurrency(totals.totalValue)}</span>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Selected total */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-900">Selected Total</span>
                      <span className="text-2xl font-bold text-[#1d43d8]">{formatCurrency(totals.selectedValue)}</span>
                    </div>

                    {/* Selection info */}
                    {totals.selectedItems > 0 && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        {totals.selectedItems} of {totals.totalItems} items selected for checkout
                      </p>
                    )}

                    {/* Voucher info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#adfc04]/10 to-[#1d43d8]/5 border border-[#adfc04]/20">
                      <div className="p-2 rounded-lg bg-[#adfc04]/20">
                        <Ticket className="h-4 w-4 text-[#1d43d8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700">Have a voucher code?</p>
                        <p className="text-[10px] text-slate-500">Apply it at checkout for a discount</p>
                      </div>
                    </div>

                    {/* Checkout button */}
                    <Link href="/checkout" className="block pt-2">
                      <Button
                        className={cn(
                          'group relative w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 overflow-hidden',
                          totals.selectedItems > 0
                            ? 'bg-[#1d43d8] hover:bg-[#1d43d8]/90 shadow-lg shadow-[#1d43d8]/25 hover:shadow-xl hover:shadow-[#1d43d8]/30'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        )}
                        disabled={totals.selectedItems === 0}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Checkout ({totals.selectedItems} item{totals.selectedItems !== 1 ? 's' : ''})
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        {/* Shimmer effect */}
                        {totals.selectedItems > 0 && (
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        )}
                      </Button>
                    </Link>

                    {/* Warning when nothing selected */}
                    <AnimatePresence>
                      {totals.selectedItems === 0 && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-amber-600 text-center flex items-center justify-center gap-1"
                        >
                          <Info className="h-3 w-3" />
                          Select items to proceed to checkout
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shopping benefits */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl border border-slate-100 overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm text-slate-900 mb-4">Why shop with us?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-600">Secure payments with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-600">Easy returns and refunds</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-600">24/7 customer support</span>
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

type CartItem = {
  variantId?: string;
  size?: {
    id: string;
    label: string;
    price?: number;
  };
  productInfo: {
    productId: Id<'products'>;
    organizationId?: Id<'organizations'>;
    organizationName?: string;
    title: string;
    slug: string;
    imageUrl: string[];
    variantName?: string;
    price: number;
    originalPrice?: number;
    inventory: number;
  };
  quantity: number;
  selected: boolean;
  note?: string;
  addedAt: number;
};

function CartLineItem({ cartId, item, index = 0 }: { cartId: Id<'carts'>; item: CartItem; index?: number }) {
  const setSelected = useMutation(api.carts.mutations.index.setItemSelected);
  const updateQty = useMutation(api.carts.mutations.index.updateItemQuantity);
  const setItemNote = useMutation(api.carts.mutations.index.setItemNote);
  const updateItemVariant = useMutation(api.carts.mutations.index.updateItemVariant);
  const product = useQuery(api.products.queries.index.getProductById, { productId: item.productInfo.productId });

  async function handleDec() {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.max(0, item.quantity - 1),
    });
  }

  async function handleInc() {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.min(item.quantity + 1, item.productInfo.inventory),
    });
  }

  async function handleRemove() {
    try {
      await promiseToast(
        updateQty({
          cartId: cartId,
          productId: item.productInfo.productId,
          variantId: item.variantId,
          quantity: 0,
        }),
        { loading: 'Removing item…', success: 'Item removed', error: () => 'Failed to remove item' }
      );
    } catch {
      // no-op
    }
  }

  async function handleVariantChange(newVariantId?: string) {
    if ((newVariantId ?? null) === (item.variantId ?? null)) return;
    try {
      await promiseToast(
        updateItemVariant({
          cartId: cartId,
          productId: item.productInfo.productId,
          oldVariantId: item.variantId,
          newVariantId: newVariantId,
          oldSize: item.size,
          newSize: undefined,
        }),
        { loading: 'Updating variant…', success: 'Variant updated', error: () => 'Failed to update variant' }
      );
    } catch {
      // no-op
    }
  }

  async function handleSizeChange(newSize?: { id: string; label: string; price?: number }) {
    if (!item.variantId) return;
    const currentSizeId = item.size?.id ?? null;
    const newSizeId = newSize?.id ?? null;
    if (currentSizeId === newSizeId) return;

    try {
      await promiseToast(
        updateItemVariant({
          cartId: cartId,
          productId: item.productInfo.productId,
          oldVariantId: item.variantId,
          newVariantId: item.variantId,
          oldSize: item.size,
          newSize: newSize,
        }),
        { loading: 'Updating size…', success: 'Size updated', error: () => 'Failed to update size' }
      );
    } catch {
      // no-op
    }
  }

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={cn(
          'rounded-xl border transition-all duration-200 overflow-hidden group',
          item.selected ? 'border-[#1d43d8]/30 bg-[#1d43d8]/[0.02] shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div className="pt-1">
              <Checkbox
                checked={item.selected}
                onCheckedChange={async (checked) => {
                  await setSelected({
                    cartId: cartId,
                    productId: item.productInfo.productId,
                    variantId: item.variantId,
                    selected: Boolean(checked),
                  });
                }}
                aria-label="Select item"
                className={cn(
                  'h-5 w-5 rounded-md border-2 transition-colors',
                  item.selected ? 'border-[#1d43d8] data-[state=checked]:bg-[#1d43d8]' : 'border-slate-300'
                )}
              />
            </div>

            {/* Product image */}
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
              {item.productInfo.imageUrl?.[0] ? (
                <R2Image
                  fileKey={item.productInfo.imageUrl[0]}
                  alt={item.productInfo.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-slate-300" />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight group-hover:text-[#1d43d8] transition-colors">
                    {item.productInfo.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{formatCurrency(item.productInfo.price)} each</p>

                  {/* Variant and size selectors */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {product && (product.variants?.length ?? 0) > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs justify-between border-slate-200 hover:border-[#1d43d8]/30 bg-white rounded-lg"
                            aria-label="Select variant"
                          >
                            <span className="truncate">{item.productInfo.variantName ?? 'Select variant'}</span>
                            <span aria-hidden className="ml-1 text-slate-400">
                              ▾
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[12rem] rounded-xl shadow-xl border border-slate-100">
                          <DropdownMenuRadioGroup value={item.variantId ?? ''} onValueChange={(val) => handleVariantChange(val || undefined)}>
                            {product.variants
                              .filter((v) => v.isActive)
                              .map((v) => (
                                <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="text-xs rounded-lg">
                                  <div className="flex items-center justify-between w-full">
                                    <span>{v.variantName}</span>
                                    <span className="ml-2 font-medium text-[#1d43d8]">{formatCurrency(v.price)}</span>
                                  </div>
                                </DropdownMenuRadioItem>
                              ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {product &&
                      item.variantId &&
                      (() => {
                        const currentVariant = product.variants.find((v) => v.variantId === item.variantId);
                        const hasSizes = currentVariant && currentVariant.sizes && currentVariant.sizes.length > 0;
                        if (!hasSizes) return null;
                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs justify-between border-slate-200 hover:border-[#1d43d8]/30 bg-white rounded-lg"
                                aria-label="Select size"
                              >
                                <span className="truncate">Size: {item.size?.label ?? 'Select'}</span>
                                <span aria-hidden className="ml-1 text-slate-400">
                                  ▾
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[10rem] rounded-xl shadow-xl border border-slate-100">
                              <DropdownMenuRadioGroup
                                value={item.size?.id ?? ''}
                                onValueChange={(val) => {
                                  const selectedSize = currentVariant.sizes?.find((s) => s.id === val);
                                  handleSizeChange(selectedSize);
                                }}
                              >
                                {currentVariant.sizes?.map((size) => (
                                  <DropdownMenuRadioItem key={size.id} value={size.id} className="text-xs rounded-lg">
                                    <div className="flex items-center justify-between w-full">
                                      <span>{size.label}</span>
                                      {size.price !== undefined && (
                                        <span className="ml-2 font-medium text-[#1d43d8]">{formatCurrency(size.price)}</span>
                                      )}
                                    </div>
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[#1d43d8]">{formatCurrency(item.productInfo.price * item.quantity)}</p>
                </div>
              </div>

              {/* Quantity and remove */}
              <div className="flex items-center justify-between gap-4">
                {/* Quantity selector */}
                <div className="inline-flex items-center gap-1 bg-slate-50 rounded-full border border-slate-200 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDec}
                    aria-label="Decrease quantity"
                    className="h-7 w-7 p-0 rounded-full hover:bg-white hover:shadow-sm"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleInc}
                    aria-label="Increase quantity"
                    className="h-7 w-7 p-0 rounded-full hover:bg-white hover:shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-8 px-3 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              </div>

              {/* Note input */}
              <Input
                defaultValue={item.note ?? ''}
                placeholder="Add a note for this item..."
                className="h-9 text-sm rounded-lg border-slate-200 focus:border-[#1d43d8]/30 focus:ring-[#1d43d8]/10"
                onBlur={async (e) => {
                  try {
                    await setItemNote({
                      cartId: cartId,
                      productId: item.productInfo.productId,
                      variantId: item.variantId,
                      note: e.target.value.trim() || undefined,
                    });
                    showToast({ type: 'success', title: 'Note saved' });
                  } catch {
                    showToast({ type: 'error', title: 'Failed to save note' });
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
