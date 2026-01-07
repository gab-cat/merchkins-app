'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { R2Image } from '@/src/components/ui/r2-image';
import { type GuestCartItem } from '@/src/stores/guest-cart';
import { Package, ShoppingCart, Loader2, Trash2 } from 'lucide-react';

function formatCurrency(amount: number) {
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

interface CartMergeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GuestCartItem[];
  onConfirm: () => void;
  onDiscardItem?: (productId: string, variantId?: string, sizeId?: string) => void;
  onDiscardAll?: () => void;
  isMerging?: boolean;
}

export function CartMergeConfirmationDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
  onDiscardItem,
  onDiscardAll,
  isMerging = false,
}: CartMergeConfirmationDialogProps) {
  const totals = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;

    for (const item of items) {
      totalItems += item.quantity;
      totalValue += item.productInfo.price * item.quantity;
    }

    return { totalItems, totalValue };
  }, [items]);

  const groupedByOrg = useMemo(() => {
    const groups: Record<string, { name: string; items: GuestCartItem[] }> = {};

    for (const item of items) {
      const orgId = item.productInfo.organizationId || 'no-org';
      const orgName = item.productInfo.organizationName || 'General';

      if (!groups[orgId]) {
        groups[orgId] = { name: orgName, items: [] };
      }
      groups[orgId].items.push(item);
    }

    return Object.entries(groups);
  }, [items]);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Merge Cart Items
          </DialogTitle>
          <DialogDescription>
            You have {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''} in your guest cart. Review the items below and confirm to add them
            to your account cart.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-2">
            {groupedByOrg.map(([orgId, group]) => (
              <div key={orgId} className="space-y-3">
                {groupedByOrg.length > 1 && (
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                    <span className="text-xs text-slate-400">
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {group.items.map((item, index) => {
                    const itemTotal = item.productInfo.price * item.quantity;
                    return (
                      <div
                        key={`${item.productInfo.productId}-${item.variantId || 'no-variant'}-${item.size?.id || 'no-size'}-${index}`}
                        className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors relative"
                      >
                        {/* Discard button */}
                        {onDiscardItem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 z-10 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDiscardItem(String(item.productInfo.productId), item.variantId, item.size?.id)}
                            disabled={isMerging}
                            aria-label={`Discard ${item.productInfo.title}`}
                            title="Discard item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Product image */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                          {item.productInfo.imageUrl?.[0] ? (
                            <R2Image fileKey={item.productInfo.imageUrl[0]} alt={item.productInfo.title} fill sizes="80px" className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0 space-y-1 pr-8">
                          <h3 className="font-semibold text-sm text-slate-900 leading-tight">{item.productInfo.title}</h3>

                          {item.productInfo.variantName && <p className="text-xs text-slate-600">Variant: {item.productInfo.variantName}</p>}

                          {item.size && <p className="text-xs text-slate-600">Size: {item.size.label}</p>}

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-slate-500">
                              {formatCurrency(item.productInfo.price)} × {item.quantity}
                            </div>
                            <div className="font-semibold text-sm text-slate-900">{formatCurrency(itemTotal)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Total items:</span>
            <span className="font-semibold text-slate-900">{totals.totalItems}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-slate-900">Total value:</span>
            <span className="font-bold text-lg text-primary">{formatCurrency(totals.totalValue)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {onDiscardAll && items.length > 0 && (
            <Button
              variant="outline"
              onClick={onDiscardAll}
              disabled={isMerging}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Discard All
            </Button>
          )}
          <Button onClick={handleConfirm} disabled={isMerging || items.length === 0}>
            {isMerging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Confirm Merge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
