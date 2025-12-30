'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useCartSheetStore } from '@/src/stores/cart-sheet';
import { useUnifiedCart } from '@/src/hooks/use-unified-cart';
import { useGuestCartStore } from '@/src/stores/guest-cart';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowRight, Package, Store, Loader2 } from 'lucide-react';
import { R2Image } from '@/src/components/ui/r2-image';
import { showToast, promiseToast } from '@/lib/toast';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { BUSINESS_CURRENCY } from '@/src/constants/business-info';

type CartItem = {
  variantId?: string;
  size?: {
    id: string;
    label: string;
    price?: number;
  };
  productInfo: {
    productId: Id<'products'>;
    title: string;
    slug: string;
    imageUrl: string[];
    variantName?: string;
    price: number;
    originalPrice?: number;
    inventory: number;
    organizationId?: Id<'organizations'>;
    organizationName?: string;
  };
  quantity: number;
  selected: boolean;
  note?: string;
  addedAt: number;
};

export function CartSheet({ children, initialCount }: { children?: React.ReactNode; initialCount?: number }) {
  const isOpen = useCartSheetStore((s) => s.isOpen);
  const openSheet = useCartSheetStore((s) => s.open);
  const closeSheet = useCartSheetStore((s) => s.close);
  const { items, totals, isAuthenticated } = useUnifiedCart();
  const serverCart = useQuery(api.carts.queries.index.getCartByUser, isAuthenticated ? {} : 'skip');
  const clearCart = useMutation(api.carts.mutations.index.clearCart);
  const guestCart = useGuestCartStore();
  const [isClearing, setIsClearing] = useState(false);

  const hasItems = items.length > 0;
  const badgeCount = totals.totalItems || initialCount || 0;

  const groupedByOrg = useMemo(() => {
    const groups: Record<string, { name: string; items: Array<CartItem> }> = {};
    for (const raw of items) {
      const item = raw as CartItem;
      const orgId = String(item.productInfo.organizationId ?? 'global');
      const orgName = item.productInfo.organizationName ?? 'Storefront';
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] };
      groups[orgId].items.push(item);
    }
    return groups;
  }, [items]);

  async function handleClear() {
    if (isClearing) return;
    setIsClearing(true);
    try {
      if (isAuthenticated && serverCart) {
        await promiseToast(clearCart({ cartId: serverCart._id }), {
          loading: 'Clearing cart…',
          success: 'Cart cleared',
          error: () => 'Failed to clear cart',
        });
      } else {
        guestCart.clear();
        showToast({ type: 'success', title: 'Cart cleared' });
      }
    } catch {
      // no-op
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? openSheet() : closeSheet())}>
      <SheetTrigger asChild>
        <div className="relative inline-flex" data-testid="cart-trigger">
          {children ?? (
            <Button variant="default" aria-label="Cart">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
            </Button>
          )}
          {badgeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg shadow-red-500/30"
              aria-live="polite"
              aria-atomic="true"
            >
              {badgeCount}
            </motion.span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent side="right" className="p-0 bg-white gap-0 border-none text-foreground w-full sm:max-w-md">
        {/* Header */}
        <SheetHeader className="relative border-b py-2 mb-0 bg-white no-scrollbar">
          <SheetTitle className="relative z-10 px-4 py-2 inline-flex items-center gap-2 text-lg font-bold text-primary font-heading">
            <div className="p-2 rounded-xl bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            Your Cart
            {totals.totalItems > 0 && (
              <span className="ml-auto text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">{totals.totalItems} items</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {isAuthenticated && serverCart === undefined ? (
          <div className="p-6 space-y-4">
            {new Array(3).fill(null).map((_, i) => (
              <div key={`s-${i}`} className="rounded-2xl border p-4 animate-pulse">
                <div className="h-4 w-1/3 rounded-lg bg-secondary" />
                <div className="mt-3 h-12 w-full rounded-lg bg-secondary" />
              </div>
            ))}
          </div>
        ) : !hasItems ? (
          <div className="px-6 py-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            >
              <Package className="h-10 w-10 text-primary/50" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2 font-heading">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Browse products and add items to your cart.</p>
            <SheetClose asChild>
              <Link href="/">
                <Button className="group rounded-full px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Start shopping
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </SheetClose>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden no-scrollbar">
            <ScrollArea className="flex-1 min-h-0 px-4 py-2 no-scrollbar">
              <AnimatePresence>
                <div className="space-y-0 no-scrollbar">
                  {Object.entries(groupedByOrg).map(([orgId, group], groupIndex) => (
                    <motion.div
                      key={orgId}
                      className="space-y-3 py-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-2 px-1">
                        <Store className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{group.name}</span>
                      </div>
                      {group.items.map((item, itemIndex) => (
                        <MiniCartLineItem
                          key={item.addedAt}
                          cartId={isAuthenticated && serverCart ? serverCart._id : undefined}
                          item={item as CartItem}
                          addedAt={item.addedAt}
                          index={itemIndex}
                          isAuthenticated={isAuthenticated}
                        />
                      ))}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </ScrollArea>

            {/* Summary section */}
            <div className="shrink-0 px-5 py-4 border-t bg-linear-to-b from-muted/30 to-muted/50">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal ({totals.totalItems} items)</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(totals.totalValue)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Selected total <span className="text-xs font-normal text-muted-foreground">({BUSINESS_CURRENCY})</span>
                  </span>
                  <span className="text-xl font-bold text-primary font-heading">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(totals.selectedValue)}
                  </span>
                </div>
              </div>
            </div>

            <SheetFooter className="shrink-0 gap-3 p-5 border-t bg-white flex-col">
              <div className="flex w-full items-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={handleClear}
                  disabled={isClearing}
                >
                  {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  {isClearing ? 'Clearing...' : 'Clear'}
                </Button>
                <div className="ml-auto">
                  <SheetClose asChild>
                    <Link href="/checkout">
                      <Button
                        size="lg"
                        className="group relative overflow-hidden rounded-full px-8 h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        data-testid="cart-checkout-button"
                        disabled={totals.selectedItems === 0}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Checkout
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MiniCartLineItem({
  cartId,
  item,
  addedAt,
  index = 0,
  isAuthenticated = true,
}: {
  cartId?: Id<'carts'>;
  item: CartItem;
  addedAt: number;
  index?: number;
  isAuthenticated?: boolean;
}) {
  const { updateItemSelection, updateItemQuantity, updateItemNote, removeItem } = useUnifiedCart();
  const setSelected = useMutation(api.carts.mutations.index.setItemSelected);
  const updateQty = useMutation(api.carts.mutations.index.updateItemQuantity);
  const setItemNote = useMutation(api.carts.mutations.index.setItemNote);
  const updateItemVariant = useMutation(api.carts.mutations.index.updateItemVariant);
  const product = useQuery(api.products.queries.index.getProductById, { productId: item.productInfo.productId });
  const guestCart = useGuestCartStore();

  // Optimistic quantity state
  const [optimisticQty, setOptimisticQty] = useState(item.quantity);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingQty, setIsUpdatingQty] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingVariant, setIsUpdatingVariant] = useState(false);
  const [isUpdatingSize, setIsUpdatingSize] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerQty = useRef(item.quantity);

  // Sync with server when item.quantity changes
  useEffect(() => {
    if (!isEditing) {
      setOptimisticQty(item.quantity);
    }
    lastServerQty.current = item.quantity;
  }, [item.quantity, isEditing]);

  const sizeId = item.size?.id;

  const updateQuantityOptimistic = useCallback(
    async (newQty: number) => {
      const clampedQty = Math.max(0, Math.min(newQty, item.productInfo.inventory || 9999));
      const previousQty = lastServerQty.current;

      // Optimistic update
      setOptimisticQty(clampedQty);
      setIsUpdatingQty(true);

      // Debounce the actual mutation
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          if (isAuthenticated && cartId) {
            await updateQty({
              cartId: cartId,
              productId: item.productInfo.productId,
              variantId: item.variantId,
              sizeId: sizeId,
              addedAt: addedAt,
              quantity: clampedQty,
            });
          } else {
            // Use unified cart for guest users
            await updateItemQuantity(item.productInfo.productId, clampedQty, item.variantId, sizeId);
          }
          lastServerQty.current = clampedQty;
        } catch {
          // Rollback on failure
          setOptimisticQty(previousQty);
          showToast({ type: 'error', title: 'Failed to update quantity' });
        } finally {
          setIsUpdatingQty(false);
        }
      }, 300);
    },
    [isAuthenticated, cartId, item.productInfo.productId, item.productInfo.inventory, item.variantId, sizeId, updateQty, updateItemQuantity, addedAt]
  );

  async function handleDec() {
    await updateQuantityOptimistic(optimisticQty - 1);
  }

  async function handleInc() {
    await updateQuantityOptimistic(optimisticQty + 1);
  }

  async function handleRemove() {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      if (isAuthenticated && cartId) {
        await promiseToast(
          updateQty({
            cartId: cartId,
            productId: item.productInfo.productId,
            variantId: item.variantId,
            sizeId: sizeId,
            addedAt: addedAt,
            quantity: 0,
          }),
          { loading: 'Removing item…', success: 'Item removed', error: () => 'Failed to remove item' }
        );
      } else {
        // Use unified cart for guest users
        await promiseToast(removeItem(item.productInfo.productId, item.variantId, sizeId), {
          loading: 'Removing item…',
          success: 'Item removed',
          error: () => 'Failed to remove item',
        });
      }
    } catch {
      // no-op
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleSaveNote(note: string) {
    try {
      if (isAuthenticated && cartId) {
        await setItemNote({
          cartId: cartId,
          productId: item.productInfo.productId,
          variantId: item.variantId,
          sizeId: sizeId,
          addedAt: addedAt,
          note: note.trim() || undefined,
        });
      } else {
        // Use unified cart for guest users
        await updateItemNote(item.productInfo.productId, note.trim() || undefined, item.variantId, sizeId);
      }
      showToast({ type: 'success', title: 'Note saved' });
    } catch {
      showToast({ type: 'error', title: 'Failed to save note' });
    }
  }

  async function handleVariantChange(newVariantId?: string) {
    if ((newVariantId ?? null) === (item.variantId ?? null)) return;
    if (isUpdatingVariant) return;
    setIsUpdatingVariant(true);
    try {
      if (isAuthenticated && cartId) {
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
      } else {
        // Guest cart - update locally
        if (!product) {
          showToast({ type: 'error', title: 'Product data not available' });
          return;
        }
        const newVariant = product.variants?.find((v) => v.variantId === newVariantId);
        if (!newVariant) {
          showToast({ type: 'error', title: 'Variant not found' });
          return;
        }
        const newPrice = newVariant.price;
        const newVariantName = newVariant.variantName;
        guestCart.updateItemVariant(item.productInfo.productId, item.variantId, newVariantId, item.size, undefined, newPrice, newVariantName);
        showToast({ type: 'success', title: 'Variant updated' });
      }
    } catch {
      showToast({ type: 'error', title: 'Failed to update variant' });
    } finally {
      setIsUpdatingVariant(false);
    }
  }

  async function handleSizeChange(newSize?: { id: string; label: string; price?: number }) {
    if (!item.variantId) return;
    const currentSizeId = item.size?.id ?? null;
    const newSizeId = newSize?.id ?? null;
    if (currentSizeId === newSizeId) return;
    if (isUpdatingSize) return;
    setIsUpdatingSize(true);

    try {
      if (isAuthenticated && cartId) {
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
      } else {
        // Guest cart - update locally
        if (!product) {
          showToast({ type: 'error', title: 'Product data not available' });
          return;
        }
        const variant = product.variants?.find((v) => v.variantId === item.variantId);
        if (!variant) {
          showToast({ type: 'error', title: 'Variant not found' });
          return;
        }
        const newPrice = newSize?.price ?? variant.price;
        guestCart.updateItemVariant(item.productInfo.productId, item.variantId, item.variantId, item.size, newSize, newPrice, variant.variantName);
        showToast({ type: 'success', title: 'Size updated' });
      }
    } catch {
      showToast({ type: 'error', title: 'Failed to update size' });
    } finally {
      setIsUpdatingSize(false);
    }
  }

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      updateQuantityOptimistic(value);
    }
  };

  const handleQuantityBlur = () => {
    setIsEditing(false);
    if (optimisticQty <= 0) {
      setOptimisticQty(1);
      updateQuantityOptimistic(1);
    }
  };

  return (
    <BlurFade
      delay={index * 0.05}
      duration={0.3}
      yOffset={0}
      blurAmount={6}
      once={false}
      className={cn(
        'rounded-2xl border-2 p-4 transition-all duration-300',
        item.selected ? 'border-primary/30 bg-primary/3' : 'border-transparent bg-muted/30 hover:bg-muted/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={item.selected}
            onCheckedChange={async (checked) => {
              if (isAuthenticated && cartId) {
                await setSelected({
                  cartId: cartId,
                  productId: item.productInfo.productId,
                  variantId: item.variantId,
                  sizeId: sizeId,
                  addedAt: addedAt,
                  selected: Boolean(checked),
                });
              } else {
                // Use unified cart for guest users
                await updateItemSelection(item.productInfo.productId, Boolean(checked), item.variantId, sizeId);
              }
            }}
            aria-label="Select item"
            className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-sm">
          {item.productInfo.imageUrl?.[0] ? (
            <R2Image fileKey={item.productInfo.imageUrl[0]} alt={item.productInfo.title} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-secondary to-secondary/60 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight text-foreground">{item.productInfo.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(item.productInfo.price)} each
              </div>
              <div className="space-x-2 flex flex-row mt-2">
                {product && (product.variants?.length ?? 0) > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs justify-between border-muted hover:border-primary/30 bg-white rounded-full"
                        aria-label="Select variant"
                        disabled={isUpdatingVariant}
                      >
                        {isUpdatingVariant ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        <span className="truncate">{item.productInfo.variantName ?? 'Select variant'}</span>
                        <span aria-hidden className="ml-1">
                          ▾
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-40 rounded-xl shadow-xl border-0">
                      <DropdownMenuRadioGroup value={item.variantId ?? ''} onValueChange={(val) => handleVariantChange(val || undefined)}>
                        {product.variants
                          .filter((v) => v.isActive)
                          .map((v) => (
                            <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="text-xs rounded-lg">
                              <div className="flex items-center justify-between w-full">
                                <span>{v.variantName}</span>
                                <span className="ml-2 font-medium text-primary">
                                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(v.price)}
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
                            className="h-7 text-xs justify-between border-muted hover:border-primary/30 bg-white rounded-full"
                            aria-label="Select size"
                            disabled={isUpdatingSize}
                          >
                            {isUpdatingSize ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                            <span className="truncate">Size: {item.size?.label ?? 'Select'}</span>
                            <span aria-hidden className="ml-1">
                              ▾
                            </span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-40 rounded-xl shadow-xl border-0">
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
                                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(size.price)}
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
              <div className="text-sm font-bold text-primary">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: BUSINESS_CURRENCY }).format(item.productInfo.price * optimisticQty)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 bg-white rounded-full border shadow-sm p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDec}
                data-testid="cart-item-qty-decrease"
                aria-label="Decrease quantity"
                className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
                disabled={isUpdatingQty || optimisticQty <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <div className="relative min-w-10 w-12 flex items-center justify-center">
                {isUpdatingQty && <Loader2 className="h-3.5 w-3.5 animate-spin absolute text-primary" />}
                <input
                  type="number"
                  min={1}
                  max={item.productInfo.inventory || 9999}
                  value={optimisticQty}
                  onChange={handleQuantityInputChange}
                  onFocus={() => setIsEditing(true)}
                  onBlur={handleQuantityBlur}
                  className={cn(
                    'w-full text-center text-sm font-semibold border-none bg-transparent focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                    isUpdatingQty && 'opacity-0'
                  )}
                  aria-label="Quantity"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInc}
                data-testid="cart-item-qty-increase"
                aria-label="Increase quantity"
                className="h-7 w-7 p-0 rounded-full hover:bg-primary/10"
                disabled={isUpdatingQty}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              data-testid="cart-item-remove"
              className="h-7 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
              disabled={isRemoving}
            >
              {isRemoving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              defaultValue={item.note ?? ''}
              placeholder="Add a note..."
              className="h-8 text-xs rounded-lg border-muted focus:border-primary"
              onBlur={async (e) => {
                try {
                  await handleSaveNote(e.target.value);
                  showToast({ type: 'success', title: 'Note saved' });
                } catch {
                  showToast({ type: 'error', title: 'Failed to save note' });
                }
              }}
            />
          </div>
        </div>
      </div>
    </BlurFade>
  );
}
