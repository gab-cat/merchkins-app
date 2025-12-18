'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useUploadFile } from '@convex-dev/r2/react';
import { api } from '@/convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Tags,
  Layers,
  ImagePlus,
  ArrowLeft,
  Sparkles,
  Info,
  AlertTriangle,
  Trash2,
  RotateCcw,
  ShoppingCart,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  ChevronDown,
  Ruler,
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { FormCard, FormField, FormActions, FormErrorBanner, ImageUploadGrid } from '@/src/components/admin/form-components';

// Utils
import { R2Image } from '@/src/components/ui/r2-image';
import { compressToWebP } from '@/lib/compress';
import { showToast } from '@/lib/toast';
import Link from 'next/link';

// Schema
const productSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  inventory: z.coerce.number().min(0, 'Inventory must be 0 or more'),
  inventoryType: z.enum(['PREORDER', 'STOCK']),
  fulfillmentDays: z.coerce.number().min(0, 'Must be 0 or more').optional(),
  isBestPrice: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof productSchema>;

interface UploadedImage {
  key: string;
  isUploading?: boolean;
}

export default function AdminEditProductPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');

  // Convex queries and mutations
  const product = useQuery(api.products.queries.index.getProductById, { productId: params.id as Id<'products'> });
  const update = useMutation(api.products.mutations.index.updateProduct);
  const del = useMutation(api.products.mutations.index.deleteProduct);
  const restore = useMutation(api.products.mutations.index.restoreProduct);
  const addVariant = useMutation(api.products.mutations.index.addVariant);
  const updateVariant = useMutation(api.products.mutations.index.updateVariant);
  const removeVariant = useMutation(api.products.mutations.index.removeVariant);
  const updateProductImages = useMutation(api.products.mutations.index.updateProductImages);
  const updateVariantImage = useMutation(api.products.mutations.index.updateVariantImage);
  const updateVariantStatus = useMutation(api.products.mutations.index.updateVariantStatus);
  const uploadFile = useUploadFile(api.files.r2);
  const categories = useQuery(api.categories.queries.index.getCategories, product?.organizationId ? { organizationId: product.organizationId } : {});

  // State
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [hasImageChanges, setHasImageChanges] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '', inventory: '' });
  const [newVariantImageKey, setNewVariantImageKey] = useState<string | undefined>(undefined);
  const [newVariantSizes, setNewVariantSizes] = useState<Array<{ id: string; label: string; price?: number }>>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [expandedSizes, setExpandedSizes] = useState<Set<string>>(new Set());

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      inventory: 0,
      inventoryType: 'STOCK',
      fulfillmentDays: undefined,
      isBestPrice: false,
      isActive: true,
    },
  });

  const inventoryType = watch('inventoryType');
  const isBestPrice = watch('isBestPrice');
  const isActive = watch('isActive');

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description || '',
        categoryId: product.categoryId || '',
        inventory: product.inventory,
        inventoryType: product.inventoryType || 'STOCK',
        fulfillmentDays: product.fulfillmentDays,
        isBestPrice: product.isBestPrice || false,
        isActive: product.isActive !== false,
      });
      setUploadedImages(product.imageUrl.map((key) => ({ key })));
      setTags(product.tags || []);
    }
  }, [product, reset]);

  // Image upload handler
  const handleUploadImages = useCallback(
    async (files: File[]) => {
      try {
        const uploadPromises = files.map(async (file) => {
          const compressed = await compressToWebP(file);
          return uploadFile(compressed);
        });

        const keys = await Promise.all(uploadPromises);
        setUploadedImages((prev) => [...prev, ...keys.map((key) => ({ key }))]);
        setHasImageChanges(true);
      } catch (err) {
        console.error(err);
        showToast({ type: 'error', title: 'Failed to upload images' });
      }
    },
    [uploadFile]
  );

  // Remove image handler
  const handleRemoveImage = useCallback((key: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.key !== key));
    setHasImageChanges(true);
  }, []);

  // Save images
  const handleSaveImages = async () => {
    if (!product || !hasImageChanges) return;
    setIsSavingImages(true);
    try {
      const toKeep = uploadedImages.map((img) => img.key);
      const toDelete = product.imageUrl.filter((k) => !toKeep.includes(k));
      await updateProductImages({
        productId: product._id,
        imageUrls: toKeep,
        imagesToDelete: toDelete,
      });
      setHasImageChanges(false);
      showToast({ type: 'success', title: 'Images saved successfully' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to save images' });
    } finally {
      setIsSavingImages(false);
    }
  };

  // Tag handlers
  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag)) {
          setTags((prev) => [...prev, tag]);
          setTagInput('');
        }
      }
    },
    [tagInput, tags]
  );

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // Variant handlers
  const handleUploadVariantImage = async (variantId: string, currentImageKey: string | undefined, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !e.target.files?.[0]) return;
    try {
      const file = e.target.files[0];
      const compressed = await compressToWebP(file);
      const key = await uploadFile(compressed);
      await updateVariantImage({
        productId: product._id,
        variantId,
        imageUrl: key,
        previousImageUrl: currentImageKey,
      });
      showToast({ type: 'success', title: 'Variant image updated' });
      e.target.value = '';
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to upload variant image' });
    }
  };

  const handleNewVariantImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      const file = e.target.files[0];
      const compressed = await compressToWebP(file);
      const key = await uploadFile(compressed);
      setNewVariantImageKey(key);
      e.target.value = '';
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to upload variant image' });
    }
  };

  const handleAddVariant = async () => {
    if (!product || !newVariant.name || !newVariant.price || !newVariant.inventory) return;
    try {
      await addVariant({
        productId: product._id,
        variantName: newVariant.name,
        price: Number(newVariant.price),
        inventory: Number(newVariant.inventory),
        imageUrl: newVariantImageKey,
        sizes: newVariantSizes.length > 0 ? newVariantSizes : undefined,
      });
      setNewVariant({ name: '', price: '', inventory: '' });
      setNewVariantImageKey(undefined);
      setNewVariantSizes([]);
      showToast({ type: 'success', title: 'Variant added successfully' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to add variant' });
    }
  };

  const safeUpdateVariant = async (
    variantId: string,
    fields: Partial<{
      variantName: string;
      price: number;
      inventory: number;
      sizes: Array<{ id: string; label: string; price?: number; inventory?: number }>;
    }>
  ) => {
    if (!product) return;
    try {
      await updateVariant({ productId: product._id, variantId, ...fields });
      showToast({ type: 'success', title: 'Variant updated' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to update variant' });
    }
  };

  // Size management helpers
  const toggleSizeExpand = (variantId: string) => {
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

  const addSizeToVariant = async (variantId: string, currentSizes: Array<{ id: string; label: string; price?: number }> | undefined) => {
    const newSize = {
      id: `size-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      price: undefined,
    };
    const updatedSizes = [...(currentSizes || []), newSize];
    await safeUpdateVariant(variantId, { sizes: updatedSizes });
    setExpandedSizes((prev) => new Set(prev).add(variantId));
  };

  const updateSizeInVariant = async (
    variantId: string,
    currentSizes: Array<{ id: string; label: string; price?: number; inventory?: number }>,
    sizeIndex: number,
    updates: Partial<{ label: string; price?: number; inventory?: number }>
  ) => {
    const updatedSizes = currentSizes.map((s, i) => (i === sizeIndex ? { ...s, ...updates } : s));
    await safeUpdateVariant(variantId, { sizes: updatedSizes });
  };

  const removeSizeFromVariant = async (
    variantId: string,
    currentSizes: Array<{ id: string; label: string; price?: number; inventory?: number }>,
    sizeIndex: number
  ) => {
    const updatedSizes = currentSizes.filter((_, i) => i !== sizeIndex);
    await safeUpdateVariant(variantId, { sizes: updatedSizes });
  };

  // New variant size helpers
  const addNewVariantSize = () => {
    const newSize = {
      id: `size-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: '',
      price: undefined,
    };
    setNewVariantSizes((prev) => [...prev, newSize]);
  };

  const updateNewVariantSize = (index: number, updates: Partial<{ label: string; price?: number }>) => {
    setNewVariantSizes((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const removeNewVariantSize = (index: number) => {
    setNewVariantSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const safeRemoveVariant = async (variantId: string) => {
    if (!product) return;
    try {
      await removeVariant({ productId: product._id, variantId });
      showToast({ type: 'success', title: 'Variant removed' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to remove variant' });
    }
  };

  const toggleVariantStatus = async (variantId: string, isActive: boolean) => {
    if (!product) return;
    try {
      await updateVariantStatus({ productId: product._id, variantId, isActive });
      showToast({ type: 'success', title: `Variant ${isActive ? 'activated' : 'deactivated'}` });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to update variant status' });
    }
  };

  // Delete/Restore handlers
  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await del({ productId: product._id });
      showToast({ type: 'success', title: 'Product deleted' });
      router.push(`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`);
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to delete product' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async () => {
    if (!product) return;
    setIsRestoring(true);
    try {
      await restore({ productId: product._id });
      showToast({ type: 'success', title: 'Product restored' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Failed to restore product' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Form submission
  const onSubmit = async (values: FormValues) => {
    if (!product) return;
    setSubmitError(null);

    try {
      await update({
        productId: product._id,
        title: values.title,
        description: values.description,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        inventory: values.inventory,
        inventoryType: values.inventoryType,
        fulfillmentDays: values.fulfillmentDays,
        isBestPrice: values.isBestPrice,
        isActive: values.isActive,
        tags: tags,
      });

      showToast({ type: 'success', title: 'Product updated successfully' });
    } catch (error) {
      console.error('Failed to update product:', error);
      setSubmitError('Failed to update product. Please try again.');
    }
  };

  // Loading state
  if (product === undefined) {
    return (
      <div className="flex items-center justify-center py-12 font-admin-body">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (product === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 font-admin-body">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">Product not found</h2>
        <p className="text-sm text-muted-foreground mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href={`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  // Collect all errors for the banner
  const allErrors: string[] = [];
  if (submitError) allErrors.push(submitError);
  if (errors.title) allErrors.push(`Title: ${errors.title.message}`);
  if (errors.description) allErrors.push(`Description: ${errors.description.message}`);
  if (errors.inventory) allErrors.push(`Inventory: ${errors.inventory.message}`);

  // Calculate stats from variants
  const totalVariants = product.variants?.length || 0;
  const activeVariants = product.variants?.filter((v) => v.isActive).length || 0;
  const totalOrders = product.variants?.reduce((acc, v) => acc + (v.orderCount || 0), 0) || 0;

  return (
    <div className="font-admin-body">
      <PageHeader
        title="Edit Product"
        description={product.title}
        icon={<Package className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: `/admin/overview${orgSlug ? `?org=${orgSlug}` : ''}` },
          { label: 'Products', href: `/admin/products${orgSlug ? `?org=${orgSlug}` : ''}` },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Link>
            </Button>
            {!product.isDeleted ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.title}"? This will hide the product from customers but can be restored later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button size="sm" onClick={handleRestore} disabled={isRestoring}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Restore
              </Button>
            )}
          </div>
        }
      />

      {/* Deleted Banner */}
      {product.isDeleted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">This product has been deleted</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
              It won't appear in your store. Click "Restore" to make it visible again.
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
        {/* Error Banner */}
        <AnimatePresence>{allErrors.length > 0 && <FormErrorBanner errors={allErrors} onDismiss={() => setSubmitError(null)} />}</AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <FormCard title="Basic Information" description="Product name and description" icon={Package} collapsible={false}>
              <div className="space-y-4">
                <FormField label="Product Title" name="title" required error={errors.title?.message}>
                  <Input id="title" placeholder="Enter product title" className="h-10" {...register('title')} />
                </FormField>

                <FormField label="Description" name="description" hint="Describe your product in detail">
                  <Textarea
                    id="description"
                    placeholder="Enter product description..."
                    autoResize
                    minRows={4}
                    className="resize-none"
                    {...register('description')}
                  />
                </FormField>

                <FormField label="Category" name="categoryId">
                  <Select
                    value={watch('categoryId') || '__none__'}
                    onValueChange={(value) => setValue('categoryId', value === '__none__' ? '' : value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No category</SelectItem>
                      {categories?.categories?.map((cat: any) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </FormCard>

            {/* Product Images */}
            <FormCard
              title="Product Images"
              description="Upload images for your product"
              icon={ImagePlus}
              badge={
                <Badge variant="outline" className="text-xs">
                  {uploadedImages.length}/10
                </Badge>
              }
              actions={
                hasImageChanges && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Unsaved changes
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUploadedImages(product.imageUrl.map((key) => ({ key })));
                        setHasImageChanges(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button type="button" size="sm" onClick={handleSaveImages} disabled={isSavingImages}>
                      {isSavingImages ? 'Saving...' : 'Save Images'}
                    </Button>
                  </div>
                )
              }
            >
              <ImageUploadGrid
                images={uploadedImages}
                onUpload={handleUploadImages}
                onRemove={handleRemoveImage}
                maxImages={10}
                error={uploadedImages.length === 0 ? 'At least one image is required' : undefined}
                renderImage={(image, index) => (
                  <R2Image
                    fileKey={image.key}
                    alt={`Product image ${index + 1}`}
                    width={400}
                    height={400}
                    className="h-full w-full rounded-lg object-cover"
                  />
                )}
              />
            </FormCard>

            {/* Variants */}
            <FormCard
              title="Product Variants"
              description="Manage different options like sizes or colors"
              icon={Layers}
              badge={
                <Badge variant="outline" className="text-xs">
                  {activeVariants}/{totalVariants} active
                </Badge>
              }
            >
              <div className="space-y-4">
                {/* Existing variants */}
                <AnimatePresence initial={false}>
                  {(product.variants || []).map((v, index) => (
                    <motion.div
                      key={v.variantId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg border bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-sm font-medium">Variant {index + 1}</span>
                          {!v.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVariantStatus(v.variantId, !v.isActive)}
                            className="h-7 text-xs"
                          >
                            {v.isActive ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                            {v.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{v.variantName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => safeRemoveVariant(v.variantId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <Label className="text-xs mb-1 block">Name</Label>
                          <Input
                            defaultValue={v.variantName}
                            onBlur={(e) => safeUpdateVariant(v.variantId, { variantName: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={v.price}
                            onBlur={(e) => safeUpdateVariant(v.variantId, { price: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Stock</Label>
                          <Input
                            type="number"
                            defaultValue={v.inventory}
                            onBlur={(e) => safeUpdateVariant(v.variantId, { inventory: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="cursor-pointer">
                            {v.imageUrl ? (
                              <div className="relative group">
                                <R2Image fileKey={v.imageUrl} alt={v.variantName} width={64} height={64} className="h-8 w-8 rounded object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity">
                                  <ImagePlus className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-muted-foreground/50">
                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadVariantImage(v.variantId, v.imageUrl, e)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Sizes Section */}
                      <div className="mt-4 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => toggleSizeExpand(v.variantId)}
                          className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            <span>Sizes</span>
                            {v.sizes && v.sizes.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {v.sizes.length}
                              </Badge>
                            )}
                          </div>
                          <motion.div animate={{ rotate: expandedSizes.has(v.variantId) ? 0 : -90 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedSizes.has(v.variantId) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 space-y-2 overflow-hidden"
                            >
                              {v.sizes && v.sizes.length > 0 && (
                                <div className="space-y-2">
                                  {v.sizes.map((size, sizeIndex) => (
                                    <motion.div
                                      key={size.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      className="flex items-center gap-2 p-2 rounded-md bg-background border"
                                    >
                                      <div className="flex-1 grid grid-cols-3 gap-2">
                                        <Input
                                          placeholder="Size label (e.g., S, M, L)"
                                          defaultValue={size.label}
                                          onBlur={(e) => {
                                            if (e.target.value !== size.label) {
                                              updateSizeInVariant(v.variantId, v.sizes!, sizeIndex, { label: e.target.value });
                                            }
                                          }}
                                          className="h-8 text-sm"
                                        />
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Price (optional)"
                                          defaultValue={size.price ?? ''}
                                          onBlur={(e) => {
                                            const newPrice = e.target.value ? parseFloat(e.target.value) : undefined;
                                            if (newPrice !== size.price) {
                                              updateSizeInVariant(v.variantId, v.sizes!, sizeIndex, { price: newPrice });
                                            }
                                          }}
                                          className="h-8 text-sm"
                                        />
                                        <Input
                                          type="number"
                                          min="0"
                                          placeholder="Stock (optional)"
                                          defaultValue={size.inventory ?? ''}
                                          onBlur={(e) => {
                                            const newInventory = e.target.value ? parseInt(e.target.value) : undefined;
                                            if (newInventory !== size.inventory) {
                                              updateSizeInVariant(v.variantId, v.sizes!, sizeIndex, { inventory: newInventory });
                                            }
                                          }}
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSizeFromVariant(v.variantId, v.sizes!, sizeIndex)}
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
                                variant="outline"
                                size="sm"
                                onClick={() => addSizeToVariant(v.variantId, v.sizes)}
                                className="w-full h-8 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1.5" />
                                Add Size
                              </Button>
                              <p className="text-xs text-muted-foreground">
                                Add sizes for this variant (e.g., S, M, L, XL). Price and stock overrides are optional.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Variant stats */}
                      <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs font-normal">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {v.orderCount || 0} orders
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          In {v.inCartCount || 0} carts
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add new variant */}
                <div className="rounded-lg border-2 border-dashed p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Add New Variant</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs mb-1 block">Name</Label>
                      <Input
                        placeholder="e.g., Small, Red"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant((s) => ({ ...s, name: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant((s) => ({ ...s, price: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newVariant.inventory}
                        onChange={(e) => setNewVariant((s) => ({ ...s, inventory: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="cursor-pointer">
                        {newVariantImageKey ? (
                          <R2Image fileKey={newVariantImageKey} alt="New variant" width={64} height={64} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-muted-foreground/50">
                            <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleNewVariantImage} />
                      </label>
                    </div>
                  </div>

                  {/* Sizes for new variant */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Ruler className="h-4 w-4" />
                        <span>Sizes</span>
                        {newVariantSizes.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {newVariantSizes.length}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {newVariantSizes.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {newVariantSizes.map((size, sizeIndex) => (
                          <motion.div
                            key={size.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2 p-2 rounded-md bg-background border"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Size label (e.g., S, M, L)"
                                value={size.label}
                                onChange={(e) => updateNewVariantSize(sizeIndex, { label: e.target.value })}
                                className="h-8 text-sm"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price override (optional)"
                                value={size.price ?? ''}
                                onChange={(e) =>
                                  updateNewVariantSize(sizeIndex, {
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
                              onClick={() => removeNewVariantSize(sizeIndex)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <Button type="button" variant="outline" size="sm" onClick={addNewVariantSize} className="w-full h-8 text-xs">
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add Size
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Add sizes for this variant (e.g., S, M, L, XL). Price override is optional.</p>
                  </div>

                  {/* Add variant button */}
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddVariant}
                      disabled={!newVariant.name || !newVariant.price || !newVariant.inventory}
                      className="w-full"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </div>
              </div>
            </FormCard>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <FormCard title="Status" icon={Sparkles} collapsible={false}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Active</Label>
                    <p className="text-xs text-muted-foreground">Product is visible to customers</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={(checked) => setValue('isActive', checked, { shouldDirty: true })} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Best Price</Label>
                    <p className="text-xs text-muted-foreground">Highlight as a great deal</p>
                  </div>
                  <Switch checked={isBestPrice} onCheckedChange={(checked) => setValue('isBestPrice', checked, { shouldDirty: true })} />
                </div>
              </div>
            </FormCard>

            {/* Inventory */}
            <FormCard title="Inventory" icon={Layers} collapsible={false}>
              <div className="space-y-4">
                <FormField label="Inventory Type" name="inventoryType">
                  <Select
                    value={inventoryType}
                    onValueChange={(value) => setValue('inventoryType', value as 'STOCK' | 'PREORDER', { shouldDirty: true })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOCK">In Stock</SelectItem>
                      <SelectItem value="PREORDER">Pre-order</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Total Inventory" name="inventory" error={errors.inventory?.message}>
                  <Input id="inventory" type="number" min={0} className="h-10" {...register('inventory', { valueAsNumber: true })} />
                </FormField>

                <FormField label="Fulfillment Days" name="fulfillmentDays" hint="Days until ready/delivered (leave empty if not applicable)">
                  <Input
                    id="fulfillmentDays"
                    type="number"
                    min={0}
                    placeholder="e.g. 3"
                    className="h-10"
                    {...register('fulfillmentDays', { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </FormCard>

            {/* Tags */}
            <FormCard title="Tags" description="Help customers find your product" icon={Tags} collapsible={false}>
              <div className="space-y-3">
                <Input
                  placeholder="Type and press Enter to add"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="h-10"
                />

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag}
                            <span className="ml-1">×</span>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Press Enter or comma to add tags
                </p>
              </div>
            </FormCard>

            {/* Product Stats */}
            <FormCard title="Statistics" icon={ShoppingCart} collapsible={false}>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="text-sm font-medium">{totalOrders}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Active Variants</span>
                  <span className="text-sm font-medium">
                    {activeVariants}/{totalVariants}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{new Date(product._creationTime).toLocaleDateString()}</span>
                </div>
              </div>
            </FormCard>
          </div>
        </div>

        {/* Form Actions */}
        <FormActions
          cancelHref={`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          isValid={isDirty || tags.join(',') !== (product.tags || []).join(',')}
          sticky
        />
      </form>
    </div>
  );
}
