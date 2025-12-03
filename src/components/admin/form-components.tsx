'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  Image as ImageIcon,
  Ruler,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// ============================================================================
// Form Card - Collapsible section with animations
// ============================================================================

interface FormCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function FormCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  defaultOpen = true,
  collapsible = true,
  badge,
  actions,
}: FormCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border bg-card overflow-hidden shadow-sm', 'hover:shadow-md transition-shadow duration-300', className)}
    >
      <div
        className={cn('flex items-center justify-between px-5 py-4 border-b bg-muted/30', collapsible && 'cursor-pointer select-none')}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold font-admin-heading text-base">{title}</h3>
              {badge}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {collapsible && (
            <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// Form Section - Grouping within cards
// ============================================================================

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// Form Field - Enhanced input wrapper
// ============================================================================

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, name, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name} className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Form Row - Horizontal field layout
// ============================================================================

interface FormRowProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-4', gridCols[columns], className)}>{children}</div>;
}

// ============================================================================
// Form Actions - Footer with save/cancel buttons
// ============================================================================

interface FormActionsProps {
  onCancel?: () => void;
  cancelHref?: string;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isValid?: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function FormActions({
  onCancel,
  cancelHref,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  isSubmitting = false,
  isValid = true,
  showDelete = false,
  onDelete,
  children,
  className,
  sticky = true,
}: FormActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-between gap-4 pt-6 mt-6 border-t',
        sticky && 'sticky bottom-0 bg-white py-4 -mx-4 px-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showDelete && onDelete && (
          <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={isSubmitting}>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        )}
        {children}
      </div>
      <div className="flex items-center gap-2">
        {(onCancel || cancelHref) &&
          (cancelHref ? (
            <Button variant="ghost" size="sm" asChild disabled={isSubmitting}>
              <Link href={cancelHref}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {cancelLabel}
              </Link>
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-1.5" />
              {cancelLabel}
            </Button>
          ))}
        <Button type="submit" variant="default" size="sm" disabled={isSubmitting || !isValid} className="min-w-[100px]">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1.5" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Form Error Banner - Display form-level errors
// ============================================================================

interface FormErrorBannerProps {
  errors: string[];
  className?: string;
  onDismiss?: () => void;
}

export function FormErrorBanner({ errors, className, onDismiss }: FormErrorBannerProps) {
  if (errors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4', className)}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Please fix the following errors:</h4>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300 list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-red-600 hover:text-red-800 dark:text-red-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Form Success Banner
// ============================================================================

interface FormSuccessBannerProps {
  message: string;
  className?: string;
  onDismiss?: () => void;
}

export function FormSuccessBanner({ message, className, onDismiss }: FormSuccessBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-4', className)}
    >
      <div className="flex items-center gap-3">
        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 flex-1">{message}</p>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Image Upload Grid - For product/category images
// ============================================================================

interface UploadedImage {
  key: string;
  url?: string;
  isUploading?: boolean;
}

interface ImageUploadGridProps {
  images: UploadedImage[];
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (key: string) => void;
  onReorder?: (from: number, to: number) => void;
  maxImages?: number;
  error?: string;
  className?: string;
  renderImage: (image: UploadedImage, index: number) => React.ReactNode;
}

export function ImageUploadGrid({ images, onUpload, onRemove, maxImages = 10, error, className, renderImage }: ImageUploadGridProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files.slice(0, maxImages - images.length));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      await onUpload(files.slice(0, maxImages - images.length));
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <motion.div
            key={image.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group aspect-square"
          >
            {renderImage(image, index)}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => onRemove(image.key)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {index === 0 && (
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded">Main</div>
            )}
          </motion.div>
        ))}

        {canAddMore && (
          <label
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer',
              'transition-all duration-200',
              isDragOver ? 'border-primary bg-primary/10 scale-105' : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
              isUploading && 'pointer-events-none opacity-50'
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2">Drop or click</span>
              </>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length} / {maxImages} images • First image will be the main image
      </p>
    </div>
  );
}

// ============================================================================
// Variant Builder - For product variants
// ============================================================================

export interface VariantSize {
  id: string;
  label: string;
  price?: number;
}

export interface Variant {
  id: string;
  name: string;
  price: number;
  inventory: number;
  imageKey?: string;
  isActive: boolean;
  sizes?: VariantSize[];
}

interface VariantBuilderProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  errors?: Record<string, string>;
  className?: string;
  renderVariantImage?: (variant: Variant, index: number) => React.ReactNode;
  onUploadVariantImage?: (variantIndex: number, file: File) => Promise<string>;
}

export function VariantBuilder({ variants, onChange, errors, className, renderVariantImage, onUploadVariantImage }: VariantBuilderProps) {
  const [expandedSizes, setExpandedSizes] = useState<Set<string>>(new Set());

  const addVariant = () => {
    const newVariant: Variant = {
      id: `variant-${Date.now()}`,
      name: '',
      price: 0,
      inventory: 0,
      isActive: true,
      sizes: [],
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, updates: Partial<Variant>) => {
    const updated = variants.map((v, i) => (i === index ? { ...v, ...updates } : v));
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    const variantId = variants[index].id;
    setExpandedSizes((prev) => {
      const next = new Set(prev);
      next.delete(variantId);
      return next;
    });
    onChange(variants.filter((_, i) => i !== index));
  };

  const toggleSizes = (variantId: string) => {
    setExpandedSizes((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const addSize = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const newSize: VariantSize = {
      id: `size-${Date.now()}-${Math.random()}`,
      label: '',
      price: undefined,
    };
    const updatedSizes = [...(variant.sizes || []), newSize];
    updateVariant(variantIndex, { sizes: updatedSizes });
    setExpandedSizes((prev) => new Set(prev).add(variant.id));
  };

  const updateSize = (variantIndex: number, sizeIndex: number, updates: Partial<VariantSize>) => {
    const variant = variants[variantIndex];
    const updatedSizes = (variant.sizes || []).map((s, i) => (i === sizeIndex ? { ...s, ...updates } : s));
    updateVariant(variantIndex, { sizes: updatedSizes });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const variant = variants[variantIndex];
    const updatedSizes = (variant.sizes || []).filter((_, i) => i !== sizeIndex);
    updateVariant(variantIndex, { sizes: updatedSizes });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence initial={false}>
        {variants.map((variant, index) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium">Variant {index + 1}</span>
              </div>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(index)}
                  className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs mb-1 block">Name</Label>
                <Input
                  value={variant.name}
                  onChange={(e) => updateVariant(index, { name: e.target.value })}
                  placeholder="e.g., Small, Red"
                  className="h-8 text-sm"
                />
                {errors?.[`variants.${index}.name`] && <p className="text-xs text-red-500 mt-1">{errors[`variants.${index}.name`]}</p>}
              </div>

              <div>
                <Label className="text-xs mb-1 block">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={variant.price}
                  onChange={(e) => updateVariant(index, { price: parseFloat(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs mb-1 block">Stock</Label>
                <Input
                  type="number"
                  min="0"
                  value={variant.inventory}
                  onChange={(e) => updateVariant(index, { inventory: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>

              <div className="flex items-end">
                {renderVariantImage ? (
                  renderVariantImage(variant, index)
                ) : (
                  <div className="h-8 w-8 rounded border flex items-center justify-center bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Sizes Section */}
            <div className="mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => toggleSizes(variant.id)}
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <span>Sizes</span>
                  {variant.sizes && variant.sizes.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {variant.sizes.length}
                    </Badge>
                  )}
                </div>
                <motion.div animate={{ rotate: expandedSizes.has(variant.id) ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {expandedSizes.has(variant.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {variant.sizes && variant.sizes.length > 0 && (
                      <div className="space-y-2">
                        {variant.sizes.map((size, sizeIndex) => (
                          <motion.div
                            key={size.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2 p-2 rounded-md bg-white border"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Size label (e.g., S, M, L)"
                                value={size.label}
                                onChange={(e) => updateSize(index, sizeIndex, { label: e.target.value })}
                                className="h-8 text-sm"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price override (optional)"
                                value={size.price ?? ''}
                                onChange={(e) =>
                                  updateSize(index, sizeIndex, {
                                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSize(index, sizeIndex)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => addSize(index)}
                      className="w-full h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Size
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Add sizes for this variant (e.g., S, M, L, XL). Price override is optional.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button type="button" variant="secondary" size="sm" onClick={addVariant} className="w-full">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Variant
      </Button>
    </div>
  );
}

// ============================================================================
// Step Indicator - For multi-step forms
// ============================================================================

interface Step {
  id: string;
  title: string;
  description?: string;
  isComplete?: boolean;
  isActive?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function StepIndicator({ steps, currentStep, onStepClick, className }: StepIndicatorProps) {
  return (
    <nav className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isActive = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick || index > currentStep}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                isActive && 'bg-primary/10',
                onStepClick && index <= currentStep && 'cursor-pointer hover:bg-muted'
              )}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                  isComplete && 'bg-emerald-500 text-white',
                  isActive && 'bg-primary text-primary-foreground',
                  !isComplete && !isActive && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="text-left hidden sm:block">
                <div className={cn('text-sm font-medium', isActive && 'text-primary', !isActive && 'text-muted-foreground')}>{step.title}</div>
                {step.description && <div className="text-xs text-muted-foreground">{step.description}</div>}
              </div>
            </button>

            {index < steps.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', isComplete ? 'bg-emerald-500' : 'bg-muted')} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default FormCard;
