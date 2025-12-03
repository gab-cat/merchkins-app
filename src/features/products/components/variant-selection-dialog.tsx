'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { R2Image } from '@/src/components/ui/r2-image';
import { Check, Menu, Package, Ruler, X as CloseIcon } from 'lucide-react';
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
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | undefined>(undefined);

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

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageDialogOpen(true);
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
              {productImages[0] && <R2Image fileKey={productImages[0]} alt={productTitle} fill className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
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
                <div className="text-lg font-bold mt-2">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(effectivePrice)}
                </div>
              )}
            </div>
          </div>

          {/* Middle section: Variant selection */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
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
                    <div className={`flex gap-3 items-center ${variant.imageUrl ? 'p-3' : 'pr-2 py-2 pl-3'}`}>
                      {variant.imageUrl && (
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(variant.imageUrl!);
                          }}
                        >
                          <R2Image
                            fileKey={variant.imageUrl}
                            alt={variant.variantName}
                            fill
                            className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col text-left">
                        <div className="text-sm font-semibold text-primary">{variant.variantName}</div>
                        <div className="text-xs font-medium text-muted-foreground">
                          {new Intl.NumberFormat(undefined, {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(variant.price)}
                        </div>
                      </div>
                      {tempVariantId === variant.variantId && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
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
                    className={`px-4 py-2 cursor-pointer rounded-lg border text-sm font-medium transition-all duration-200 ${
                      tempSizeId === size.id
                        ? 'border-primary bg-primary/10 text-primary'
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

      {/* Image Dialog */}
      <ImageDialog imageUrl={selectedImageUrl} open={imageDialogOpen} onOpenChange={setImageDialogOpen} />
    </Dialog>
  );
}

function ImageDialog({ imageUrl, open, onOpenChange }: { imageUrl?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 gap-0 bg-black/40 backdrop-blur-sm border-0" showCloseButton={true}>
        <DialogTitle className="sr-only">Variant Image</DialogTitle>
        <div className="relative w-full h-[90vh] max-h-[90vh] flex items-center justify-center p-4 md:p-8">
          <div className="relative w-full h-full flex items-center justify-center">
            <R2Image
              fileKey={imageUrl}
              alt="Variant image"
              width={1200}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-lg cursor-pointer"
              priority
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
