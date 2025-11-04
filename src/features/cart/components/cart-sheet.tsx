'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
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
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { R2Image } from '@/src/components/ui/r2-image';
import { showToast, promiseToast } from '@/lib/toast';

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
  const cart = useQuery(api.carts.queries.index.getCartByUser, {});
  const clearCart = useMutation(api.carts.mutations.index.clearCart);

  const totals = useMemo(() => {
    return {
      totalItems: cart?.totalItems ?? 0,
      totalValue: cart?.totalValue ?? 0,
      selectedItems: cart?.selectedItems ?? 0,
      selectedValue: cart?.selectedValue ?? 0,
    };
  }, [cart]);

  const hasItems = (cart?.embeddedItems?.length ?? 0) > 0;
  const badgeCount = (cart ? cart.totalItems : initialCount) ?? 0;

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
            <span
              className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold"
              aria-live="polite"
              aria-atomic="true"
            >
              {badgeCount}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent side="right" className="p-0 bg-white border-none text-black">
        <SheetHeader className="border-b bg-primary py-2">
          <SheetTitle className="px-4 py-2 inline-flex items-center gap-3 text-base font-bold">
            <ShoppingCart className="h-4 w-4" /> Your cart
          </SheetTitle>
        </SheetHeader>

        {cart === undefined ? (
          <div className="p-4 space-y-3">
            {new Array(3).fill(null).map((_, i) => (
              <div key={`s-${i}`} className="rounded-lg border p-3 animate-pulse">
                <div className="h-4 w-1/3 rounded bg-secondary" />
                <div className="mt-2 h-8 w-full rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : !cart || !hasItems ? (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse products and add items to your cart.</p>
            <Link href="/">
              <Button className="hover:scale-105 transition-all duration-200">Continue shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="flex h-full min-h-[60vh] flex-col">
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {Object.entries(groupedByOrg).map(([orgId, group]) => (
                  <div key={orgId} className="space-y-3">
                    <div className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">{group.name}</div>
                    {group.items.map((item) => (
                      <MiniCartLineItem
                        key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                        cartId={cart._id}
                        item={item as CartItem}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-4 py-3 border-t bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Items ({totals.totalItems})</span>
                  <span>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.totalValue)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-base">
                  <span>Selected total</span>
                  <span className="text-primary">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(totals.selectedValue)}
                  </span>
                </div>
              </div>
            </div>

            <SheetFooter className="gap-2 p-4 border-t">
              <div className="flex w-full items-center gap-2">
                <Button variant="ghost" size="sm" className="shrink-0 hover:bg-destructive/10 hover:text-destructive" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <SheetClose asChild>
                    <Link href="/checkout">
                      <Button
                        size="sm"
                        className="min-w-24 hover:scale-105 transition-all duration-200"
                        data-testid="cart-checkout-button"
                        disabled={totals.selectedItems === 0}
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Checkout
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

function MiniCartLineItem({ cartId, item }: { cartId: Id<'carts'>; item: CartItem }) {
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

  // selection toggled inline via Checkbox onCheckedChange

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

  async function handleSaveNote(note: string) {
    try {
      await setItemNote({
        cartId: cartId,
        productId: item.productInfo.productId,
        variantId: item.variantId,
        note: note.trim() || undefined,
      });
      showToast({ type: 'success', title: 'Note saved' });
    } catch {
      showToast({ type: 'error', title: 'Failed to save note' });
    }
  }

  async function handleVariantChange(newVariantId?: string) {
    if ((newVariantId ?? null) === (item.variantId ?? null)) return;
    // update variant directly without removing/adding
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
    <div className={cn('rounded-lg border p-3 transition-all duration-200', item.selected && 'border-primary bg-primary/5 shadow-sm')}>
      <div className="flex items-start gap-3">
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
            className="mt-0.5"
          />
        </div>

        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          {item.productInfo.imageUrl?.[0] ? (
            <R2Image
              fileKey={item.productInfo.imageUrl[0]}
              alt={item.productInfo.title}
              width={64}
              height={64}
              className="h-full w-full object-cover bg-secondary"
            />
          ) : (
            <div className="h-full w-full bg-secondary rounded-lg" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight">{item.productInfo.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price)} each
              </div>
              <div className="space-x-2 flex flex-row">
                {product && (product.variants?.length ?? 0) > 0 && (
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs justify-between border-muted hover:border-primary/30 bg-white"
                          aria-label="Select variant"
                        >
                          <span className="truncate">{item.productInfo.variantName ?? 'Select variant'}</span>
                          <span aria-hidden className="ml-1">
                            ▾
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[10rem] animate-in fade-in-0 zoom-in-95">
                        <DropdownMenuRadioGroup value={item.variantId ?? ''} onValueChange={(val) => handleVariantChange(val || undefined)}>
                          {product.variants
                            .filter((v) => v.isActive)
                            .map((v) => (
                              <DropdownMenuRadioItem key={v.variantId} value={v.variantId} className="text-xs">
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
                  </div>
                )}
                {product &&
                  item.variantId &&
                  (() => {
                    const currentVariant = product.variants.find((v) => v.variantId === item.variantId);
                    const hasSizes = currentVariant && currentVariant.sizes && currentVariant.sizes.length > 0;
                    if (!hasSizes) return null;
                    return (
                      <div className="mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs justify-between border-muted hover:border-primary/30 bg-white"
                              aria-label="Select size"
                            >
                              <span className="truncate">Size: {item.size?.label ?? 'Select size'}</span>
                              <span aria-hidden className="ml-1">
                                ▾
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="min-w-[10rem] animate-in fade-in-0 zoom-in-95">
                            <DropdownMenuRadioGroup
                              value={item.size?.id ?? ''}
                              onValueChange={(val) => {
                                const selectedSize = currentVariant.sizes?.find((s) => s.id === val);
                                handleSizeChange(selectedSize);
                              }}
                            >
                              {currentVariant.sizes?.map((size) => (
                                <DropdownMenuRadioItem key={size.id} value={size.id} className="text-xs">
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
                      </div>
                    );
                  })()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(item.productInfo.price * item.quantity)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDec}
                data-testid="cart-item-qty-decrease"
                aria-label="Decrease quantity"
                className="h-7 w-7 p-0 hover:bg-primary/10 bg-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleInc}
                data-testid="cart-item-qty-increase"
                aria-label="Increase quantity"
                className="h-7 w-7 p-0 hover:bg-primary/10 bg-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              data-testid="cart-item-remove"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              defaultValue={item.note ?? ''}
              placeholder="Add a note..."
              className="h-7 text-xs max-w-xs"
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
    </div>
  );
}
