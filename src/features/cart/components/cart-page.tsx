'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { R2Image } from '@/src/components/ui/r2-image';
import { showToast, promiseToast } from '@/lib/toast';
import { Trash2, Plus, Minus, ShoppingCart, ShoppingBag, ArrowRight, CreditCard, Package, Store, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BlurFade } from '@/src/components/ui/animations/effects';

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
      const orgName = item.productInfo.organizationName ?? 'Storefront';
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

  if (cart === undefined) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-6">
            {new Array(3).fill(null).map((_, i) => (
              <Card key={`s-${i}`} className="animate-pulse rounded-2xl border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="h-5 w-1/3 rounded-lg bg-secondary" />
                  <div className="mt-4 h-16 w-full rounded-lg bg-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !hasItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="h-28 w-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Package className="h-14 w-14 text-primary/40" />
            </div>
            <h1 className="text-3xl font-bold mb-3 font-heading">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 text-lg">Browse products and add items to your cart to get started.</p>
            <Link href="/">
              <Button
                size="lg"
                className="group rounded-full px-10 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start shopping
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">Your Cart</h1>
            </div>
            <p className="text-muted-foreground">{totals.totalItems} items ready for checkout</p>
          </div>
        </BlurFade>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {Object.entries(groupedByOrg).map(([orgId, group], groupIndex) => (
                <BlurFade key={orgId} delay={0.1 + groupIndex * 0.1}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-wider text-primary">{group.name}</span>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                    {group.items.map((item, itemIndex) => (
                      <CartLineItem
                        key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                        cartId={cart._id}
                        item={item}
                        index={itemIndex}
                      />
                    ))}
                  </div>
                </BlurFade>
              ))}
            </AnimatePresence>

            <BlurFade delay={0.4}>
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleClear}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear cart
                </Button>
              </div>
            </BlurFade>
          </div>

          {/* Order summary */}
          <div className="space-y-6">
            <BlurFade delay={0.3}>
              <Card className="sticky top-24 rounded-3xl border-0 shadow-xl overflow-hidden">
                {/* Gradient header */}
                <div className="relative p-6 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                  <div className="relative z-10 flex items-center gap-3 text-white">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-bold text-lg font-heading">Order Summary</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Subtotal ({totals.totalItems} items)</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.totalValue)}
                      </span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Selected Total</span>
                      <span className="text-2xl font-bold text-primary font-heading">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.selectedValue)}
                      </span>
                    </div>

                    <Link href="/checkout" className="block pt-2">
                      <Button
                        className="group relative w-full h-14 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        disabled={totals.selectedItems === 0}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Checkout ({totals.selectedItems} items)
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </BlurFade>
          </div>
        </div>
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
  const addItem = useMutation(api.carts.mutations.index.addItem);
  const updateItemVariant = useMutation(api.carts.mutations.index.updateItemVariant);
  const product = useQuery(api.products.queries.index.getProductById, { productId: item.productInfo.productId });

  // note input is uncontrolled; saving on blur

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

  // note saved inline onBlur; no separate save handler

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
          newSize: undefined, // Reset size when changing variant
        }),
        { loading: 'Updating variant…', success: 'Variant updated', error: () => 'Failed to update variant' }
      );
    } catch {
      // no-op
    }
  }

  async function handleSizeChange(newSize?: { id: string; label: string; price?: number }) {
    if (!item.variantId) return; // Size can only be changed if variant is selected
    const currentSizeId = item.size?.id ?? null;
    const newSizeId = newSize?.id ?? null;
    if (currentSizeId === newSizeId) return;

    try {
      await promiseToast(
        updateItemVariant({
          cartId: cartId,
          productId: item.productInfo.productId,
          oldVariantId: item.variantId,
          newVariantId: item.variantId, // Keep same variant
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.4 }}>
      <Card
        className={cn(
          'rounded-2xl border-2 transition-all duration-300 overflow-hidden',
          item.selected ? 'border-primary/30 bg-primary/[0.02] shadow-lg shadow-primary/5' : 'border-transparent bg-card shadow-md hover:shadow-lg'
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
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
                className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>

            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-md">
              {item.productInfo.imageUrl?.[0] ? (
                <R2Image
                  fileKey={item.productInfo.imageUrl[0]}
                  alt={item.productInfo.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover bg-secondary"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-secondary to-secondary/60 rounded-xl flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold leading-tight text-foreground">{item.productInfo.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price)} each
                  </div>

                  {/* Variant and size selectors */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {product && (product.variants?.length ?? 0) > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs justify-between border-muted hover:border-primary/30 bg-white rounded-xl"
                            aria-label="Select variant"
                          >
                            <span className="truncate">{item.productInfo.variantName ?? 'Select variant'}</span>
                            <span aria-hidden className="ml-1">
                              ▾
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[12rem] rounded-xl shadow-xl border-0">
                          <DropdownMenuRadioGroup value={item.variantId ?? ''} onValueChange={(val) => handleVariantChange(val || undefined)}>
                            {product.variants
                              .filter((v) => v.isActive)
                              .map((v) => (
                                <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="text-xs rounded-lg">
                                  <div className="flex items-center justify-between w-full">
                                    <span>{v.variantName}</span>
                                    <span className="ml-2 font-medium text-primary">
                                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(v.price)}
                                    </span>
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
                                className="h-8 text-xs justify-between border-muted hover:border-primary/30 bg-white rounded-xl"
                                aria-label="Select size"
                              >
                                <span className="truncate">Size: {item.size?.label ?? 'Select'}</span>
                                <span aria-hidden className="ml-1">
                                  ▾
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[10rem] rounded-xl shadow-xl border-0">
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
                                        <span className="ml-2 font-medium text-primary">
                                          {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(size.price)}
                                        </span>
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
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price * item.quantity)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Quantity selector */}
                <div className="inline-flex items-center gap-1 bg-white rounded-full border-2 border-muted shadow-sm p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDec}
                    aria-label="Decrease quantity"
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-10 text-center text-base font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleInc}
                    aria-label="Increase quantity"
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                </Button>
              </div>

              {/* Note input */}
              <div className="flex items-center gap-2">
                <Input
                  defaultValue={item.note ?? ''}
                  placeholder="Add a note..."
                  className="h-9 text-sm rounded-xl border-muted focus:border-primary"
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
