"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useCartSheetStore } from '@/src/stores/cart-sheet'
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import { R2Image } from '@/src/components/ui/r2-image'
import { showToast, promiseToast } from '@/lib/toast'

type CartItem = {
  variantId?: string
  productInfo: {
    productId: Id<'products'>
    title: string
    slug: string
    imageUrl: string[]
    variantName?: string
    price: number
    originalPrice?: number
    inventory: number
    organizationId?: Id<'organizations'>
    organizationName?: string
  }
  quantity: number
  selected: boolean
  note?: string
  addedAt: number
}

export function CartSheet ({
  children,
  initialCount,
}: {
  children?: React.ReactNode
  initialCount?: number
}) {
  const isOpen = useCartSheetStore((s) => s.isOpen)
  const openSheet = useCartSheetStore((s) => s.open)
  const closeSheet = useCartSheetStore((s) => s.close)
  const cart = useQuery(api.carts.queries.index.getCartByUser, {})
  const clearCart = useMutation(api.carts.mutations.index.clearCart)

  const totals = useMemo(() => {
    return {
      totalItems: cart?.totalItems ?? 0,
      totalValue: cart?.totalValue ?? 0,
      selectedItems: cart?.selectedItems ?? 0,
      selectedValue: cart?.selectedValue ?? 0,
    }
  }, [cart])

  const hasItems = (cart?.embeddedItems?.length ?? 0) > 0
  const badgeCount = (cart ? cart.totalItems : initialCount) ?? 0

  const groupedByOrg = useMemo(() => {
    const groups: Record<string, { name: string; items: Array<CartItem> }> = {}
    for (const raw of cart?.embeddedItems ?? []) {
      const item = raw as CartItem
      const orgId = String(item.productInfo.organizationId ?? 'global')
      const orgName = item.productInfo.organizationName ?? 'Storefront'
      if (!groups[orgId]) groups[orgId] = { name: orgName, items: [] }
      groups[orgId].items.push(item)
    }
    return groups
  }, [cart])

  async function handleClear () {
    if (!cart) return
    try {
      await promiseToast(
        clearCart({ cartId: cart._id }),
        { loading: 'Clearing cart…', success: 'Cart cleared', error: () => 'Failed to clear cart' },
      )
    } catch {
      // no-op
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? openSheet() : closeSheet())}>
      <SheetTrigger asChild>
        <div className="relative inline-flex" data-testid="cart-trigger">
          {children ?? (
            <Button variant="default" aria-label="Cart"><ShoppingCart className="mr-2 h-4 w-4" />Cart</Button>
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

      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="p-4 inline-flex items-center gap-2 text-xl sm:text-2xl"><ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" /> Your cart</SheetTitle>
        </SheetHeader>

        {cart === undefined ? (
          <div className="p-4 space-y-3">
            {new Array(3).fill(null).map((_, i) => (
              <div key={`s-${i}`} className="rounded-md border p-4">
                <div className="h-4 w-1/3 rounded bg-secondary animate-pulse" />
                <div className="mt-2 h-10 w-full rounded bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
        ) : !cart || !hasItems ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">Browse products and add items to your cart.</p>
            <div className="mt-6">
              <Link href="/">
                <Button>Continue shopping</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[60vh] flex-col">
            <ScrollArea className="h-[60vh] px-4 py-3">
              <div className="space-y-5">
                {Object.entries(groupedByOrg).map(([orgId, group]) => (
                  <div key={orgId} className="space-y-2">
                    <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.name}</div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <MiniCartLineItem
                          key={`${String(item.productInfo.productId)}::${item.productInfo.variantName ?? 'default'}`}
                          cartId={cart._id}
                          item={item as CartItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-4">
              <div className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Items</span>
                  <span>{totals.totalItems}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totals.totalValue.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-semibold">
                  <span>Selected total</span>
                  <span>${totals.selectedValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <SheetFooter className="gap-2 p-4">
              <div className="flex w-full items-center gap-2">
                <Button
                  variant="ghost"
                  className="shrink-0"
                  onClick={handleClear}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Clear cart
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <SheetClose asChild>
                    <Link href="/checkout">
                      <Button
                        className="min-w-28"
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
  )
}

function MiniCartLineItem ({
  cartId,
  item,
}: {
  cartId: Id<'carts'>
  item: CartItem
}) {
  const setSelected = useMutation(api.carts.mutations.index.setItemSelected)
  const updateQty = useMutation(api.carts.mutations.index.updateItemQuantity)
  const setItemNote = useMutation(api.carts.mutations.index.setItemNote)
  const addItem = useMutation(api.carts.mutations.index.addItem)
  const product = useQuery(
    api.products.queries.index.getProductById,
    { productId: item.productInfo.productId }
  )

  async function handleDec () {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.max(0, item.quantity - 1),
    })
  }

  async function handleInc () {
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: Math.min(item.quantity + 1, item.productInfo.inventory),
    })
  }

  // selection toggled inline via Checkbox onCheckedChange

  async function handleRemove () {
    try {
      await promiseToast(
        updateQty({
          cartId: cartId,
          productId: item.productInfo.productId,
          variantId: item.variantId,
          quantity: 0,
        }),
        { loading: 'Removing item…', success: 'Item removed', error: () => 'Failed to remove item' },
      )
    } catch {
      // no-op
    }
  }

  async function handleSaveNote (note: string) {
    try {
      await setItemNote({
        cartId: cartId,
        productId: item.productInfo.productId,
        variantId: item.variantId,
        note: note.trim() || undefined,
      })
      showToast({ type: 'success', title: 'Note saved' })
    } catch {
      showToast({ type: 'error', title: 'Failed to save note' })
    }
  }

  async function handleVariantChange (newVariantId?: string) {
    if ((newVariantId ?? null) === (item.variantId ?? null)) return
    // remove old then add new, preserving quantity, selected, and note
    await updateQty({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: item.variantId,
      quantity: 0,
    })
    await addItem({
      cartId: cartId,
      productId: item.productInfo.productId,
      variantId: newVariantId,
      quantity: item.quantity,
      selected: item.selected,
      note: item.note,
    })
  }

  return (
    <div className={cn('rounded-md border p-2', item.selected && 'border-primary bg-primary/5')}>
      <div className="flex items-start gap-2">
        <div className="pt-0.5">
          <Checkbox
            checked={item.selected}
            onCheckedChange={async (checked) => {
              await setSelected({
                cartId: cartId,
                productId: item.productInfo.productId,
                variantId: item.variantId,
                selected: Boolean(checked),
              })
            }}
            aria-label="Select item"
          />
        </div>
        {item.productInfo.imageUrl?.[0] ? (
          <R2Image
            fileKey={item.productInfo.imageUrl[0]}
            alt={item.productInfo.title}
            width={96}
            height={96}
            className="h-12 w-12 shrink-0 rounded object-cover bg-secondary"
          />
        ) : (
          <div className="h-12 w-12 shrink-0 rounded bg-secondary" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium leading-tight">
                {item.productInfo.title}
              </div>
              {product && (product.variants?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between md:w-64"
                        aria-label="Select variant"
                      >
                        {item.productInfo.variantName ?? 'Select a variant'}
                        <span aria-hidden>▾</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[12rem]">
                      <DropdownMenuRadioGroup
                        value={item.variantId ?? ''}
                        onValueChange={(val) => handleVariantChange(val || undefined)}
                      >
                        {product.variants
                          .filter((v) => v.isActive)
                          .map((v) => (
                            <DropdownMenuRadioItem key={v.variantId} value={v.variantId}>
                              {v.variantName} • ${v.price.toFixed(2)}
                            </DropdownMenuRadioItem>
                          ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                ${item.productInfo.price.toFixed(2)} each
              </div>
            </div>
            <div className="text-right text-sm font-semibold">
              ${(item.productInfo.price * item.quantity).toFixed(2)}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDec}
                data-testid="cart-item-qty-decrease"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleInc}
                data-testid="cart-item-qty-increase"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              data-testid="cart-item-remove"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Input
              defaultValue={item.note ?? ''}
              placeholder="Add a note (optional)"
              className="max-w-md"
              onBlur={async (e) => {
                try {
                  await handleSaveNote(e.target.value)
                  showToast({ type: 'success', title: 'Note saved' })
                } catch {
                  showToast({ type: 'error', title: 'Failed to save note' })
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


