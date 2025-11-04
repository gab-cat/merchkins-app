'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { R2Image } from '@/src/components/ui/r2-image';
import { Check, X, Menu, Ruler, X as CloseIcon } from 'lucide-react';
import { computeEffectivePrice } from '@/lib/utils';

interface ProductVariant {
  variantId: string;
  variantName: string;
  price: number;
  inventory: number;
  imageUrl?: string;
  isActive: boolean;
  sizes?: Array<{
    id: string;
    label: string;
    price?: number;
  }>;
}

interface ProductImage {
  imageUrl: string[];
}

interface VariantSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  productImages: string[];
  variants: ProductVariant[];
  selectedVariantId?: string;
  selectedSizeId?: string;
  onVariantChange: (variantId: string | undefined) => void;
  onSizeChange: (sizeId: string | undefined) => void;
  onConfirm: () => void;
}

export function VariantSelectionDialog({
  open,
  onOpenChange,
  productTitle,
  productImages,
  variants,
  selectedVariantId,
  selectedSizeId,
  onVariantChange,
  onSizeChange,
  onConfirm,
}: VariantSelectionDialogProps) {
  const [tempVariantId, setTempVariantId] = useState<string | undefined>(selectedVariantId);
  const [tempSizeId, setTempSizeId] = useState<string | undefined>(selectedSizeId);

  // Reset temp values when dialog opens
  React.useEffect(() => {
    if (open) {
      setTempVariantId(selectedVariantId);
      setTempSizeId(selectedSizeId);
    }
  }, [open, selectedVariantId, selectedSizeId]);

  const activeVariants = useMemo(() => variants.filter((v) => v.isActive), [variants]);

  const selectedVariant = useMemo(() => {
    return activeVariants.find((v) => v.variantId === tempVariantId);
  }, [activeVariants, tempVariantId]);

  const selectedSize = useMemo(() => {
    return selectedVariant?.sizes?.find((s) => s.id === tempSizeId);
  }, [selectedVariant, tempSizeId]);

  const effectivePrice = useMemo(() => {
    if (!selectedVariant) return 0;
    return computeEffectivePrice(selectedVariant, selectedSize);
  }, [selectedVariant, selectedSize]);

  const handleVariantSelect = (variantId: string) => {
    setTempVariantId(variantId);
    // Reset size when changing variant
    setTempSizeId(undefined);
  };

  const handleSizeSelect = (sizeId: string) => {
    setTempSizeId(sizeId);
  };

  const handleConfirm = () => {
    onVariantChange(tempVariantId);
    onSizeChange(tempSizeId);
    onConfirm();
  };

  const hasSizes = selectedVariant?.sizes && selectedVariant.sizes.length > 0;
  const canConfirm = tempVariantId && (!hasSizes || tempSizeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Select Variant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Top section: Image and current selection */}
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
              {productImages[0] && (
                <R2Image fileKey={productImages[0]} alt={productTitle} width={96} height={96} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{productTitle}</h3>
              <div className="text-sm text-muted-foreground">
                {selectedVariant ? (
                  <>
                    <div>Variant: {selectedVariant.variantName}</div>
                    {selectedSize && <div>Size: {selectedSize.label}</div>}
                  </>
                ) : (
                  <div>No variant selected</div>
                )}
              </div>
              {effectivePrice > 0 && (
                <div className="text-lg font-bold">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(effectivePrice)}
                </div>
              )}
            </div>
          </div>

          {/* Middle section: Variant selection */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Choose Variant
            </h4>
            {activeVariants.length <= 4 ? (
              <div className="grid grid-cols-2 gap-3">
                {activeVariants.map((variant) => (
                  <button
                    key={variant.variantId}
                    type="button"
                    onClick={() => handleVariantSelect(variant.variantId)}
                    className={`cursor-pointer relative w-full rounded-lg border transition-all duration-200 touch-manipulation overflow-hidden group ${
                      tempVariantId === variant.variantId ? 'border-primary bg-accent/10' : 'border-border hover:border-primary/30 bg-card'
                    }`}
                  >
                    {variant.imageUrl && (
                      <div className="aspect-square w-full overflow-hidden bg-secondary">
                        <R2Image
                          fileKey={variant.imageUrl}
                          alt={variant.variantName}
                          width={120}
                          height={120}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-sm font-semibold text-primary text-left truncate">{variant.variantName}</div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(variant.price)}
                      </div>
                      {tempVariantId === variant.variantId && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {activeVariants.map((variant) => (
                  <button
                    key={variant.variantId}
                    type="button"
                    onClick={() => handleVariantSelect(variant.variantId)}
                    className={`cursor-pointer p-3 rounded-lg border text-left transition-all duration-200 ${
                      tempVariantId === variant.variantId ? 'border-accent bg-accent/10' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{variant.variantName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(variant.price)}
                        </div>
                      </div>
                      {tempVariantId === variant.variantId && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom section: Size selection (if applicable) */}
          {hasSizes && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Choose Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes!.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeSelect(size.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      tempSizeId === size.id
                        ? 'border-accent bg-accent text-accent'
                        : 'border-border hover:border-primary/30 bg-card hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{size.label}</span>
                      {size.price !== undefined && size.price !== selectedVariant.price && (
                        <Badge variant="outline" className="text-xs">
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(size.price)}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex items-center gap-2">
            <CloseIcon className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="min-w-24 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Use Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
