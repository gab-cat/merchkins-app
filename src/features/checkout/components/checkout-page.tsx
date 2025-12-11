'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { CreditCard, ListChecks, StickyNote, ShoppingBag, ArrowRight, Shield, Package, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { showToast, promiseToast } from '@/lib/toast';
import { R2Image } from '@/src/components/ui/r2-image';
import { BlurFade } from '@/src/components/ui/animations/effects';

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
      const orgName = raw.productInfo.organizationName ?? 'Storefront';
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
        loading: 'Placing order…',
        success: 'Order placed, removing items from cart...',
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
      for (const result of results) {
        if (result && typeof result === 'object' && 'xenditInvoiceUrl' in result && result.xenditInvoiceUrl) {
          xenditUrl = result.xenditInvoiceUrl;
          break;
        }
      }

      if (xenditUrl) {
        // Redirect to Xendit payment page
        window.location.href = xenditUrl;
      } else {
        // Fallback to orders page if no payment URL
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

  if (cart === undefined || me === undefined) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid gap-6">
            {new Array(2).fill(null).map((_, i) => (
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

  if (!canCheckout) {
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
              <ShoppingBag className="h-14 w-14 text-primary/40" />
            </div>
            <h1 className="text-3xl font-bold mb-3 font-heading">Nothing to checkout</h1>
            <p className="text-muted-foreground mb-8 text-lg">Select at least one item in your cart to proceed.</p>
            <Link href="/cart">
              <Button
                size="lg"
                className="group rounded-full px-10 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Package className="mr-2 h-5 w-5" />
                Back to cart
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
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight">Checkout</h1>
            </div>
            <p className="text-muted-foreground">Review your order and complete your purchase</p>
          </div>
        </BlurFade>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review items card */}
            <BlurFade delay={0.2}>
              <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
                <div className="relative p-5 bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                      <ListChecks className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg font-heading">Review Items</span>
                    <span className="ml-auto text-sm text-muted-foreground">{totals.quantity} items</span>
                  </div>
                </div>
                <CardContent className="p-5 space-y-5">
                  {Object.entries(selectedByOrg).map(([orgId, group], groupIndex) => (
                    <motion.div
                      key={orgId}
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + groupIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider text-primary">{group.name}</span>
                        <div className="h-px flex-1 bg-border/50" />
                      </div>
                      {group.items.map((it, itemIndex) => (
                        <motion.div
                          key={`${String(it.productInfo.productId)}::${it.productInfo.variantName ?? 'default'}`}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-muted/50 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + itemIndex * 0.05 }}
                        >
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-sm">
                            {it.productInfo.imageUrl?.[0] ? (
                              <R2Image
                                fileKey={it.productInfo.imageUrl[0]}
                                alt={it.productInfo.title}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover bg-secondary"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-secondary to-secondary/60 rounded-xl flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm leading-tight">
                              {it.productInfo.title}
                              {it.productInfo.variantName && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">• {it.productInfo.variantName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <span>
                                {it.quantity} ×{' '}
                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(it.productInfo.price)}
                              </span>
                              {'size' in it && it.size && (
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                                  Size: {it.size.label}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-base font-bold text-primary shrink-0">
                            {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(it.quantity * it.productInfo.price)}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </BlurFade>

            {/* Order notes card */}
            <BlurFade delay={0.3}>
              <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
                <div className="relative p-5 bg-gradient-to-r from-muted/50 to-muted/30 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                      <StickyNote className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg font-heading">Order Notes</span>
                  </div>
                </div>
                <CardContent className="p-5">
                  <Input
                    placeholder="Add special instructions for your order (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-12 rounded-xl border-muted focus:border-primary text-base"
                  />
                </CardContent>
              </Card>
            </BlurFade>
          </div>

          {/* Order summary sidebar */}
          <div className="space-y-6">
            <BlurFade delay={0.4}>
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
                    {/* Shop subtotals */}
                    {shopSubtotals.map((shop) => (
                      <div key={shop.name} className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5" />
                          {shop.name} ({shop.quantity})
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(shop.amount)}
                        </span>
                      </div>
                    ))}

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary font-heading">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.amount)}
                      </span>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Terms agreement */}
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox
                        id="terms-agreement"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                        className={`mt-0.5 h-5 w-5 rounded-md border-2 ${!agreeToTerms ? 'border-destructive data-[state=unchecked]:bg-destructive/5' : 'data-[state=checked]:bg-primary data-[state=checked]:border-primary'}`}
                      />
                      <label htmlFor="terms-agreement" className="text-sm leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Place order button */}
                    <Button
                      className="group relative w-full h-14 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mt-2"
                      onClick={handlePlaceOrder}
                      disabled={isPlacing || !agreeToTerms}
                      aria-label="Place order"
                    >
                      {isPlacing ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mr-2">
                            <Package className="h-5 w-5" />
                          </motion.div>
                          Placing order…
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Place Order
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </>
                      )}
                    </Button>

                    {!agreeToTerms && <p className="text-xs text-destructive text-center">Please agree to the terms to continue</p>}
                  </div>
                </CardContent>
              </Card>
            </BlurFade>

            {/* Trust badges */}
            <BlurFade delay={0.5}>
              <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-sm">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By placing this order, you agree to our terms of service. All sales are final and refunds are processed according to our refund
                    policy.
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Safe Payment</span>
                    </div>
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
