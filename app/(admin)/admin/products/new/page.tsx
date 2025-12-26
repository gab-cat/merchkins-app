'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useUploadFile } from '@convex-dev/r2/react';
import { api } from '@/convex/_generated/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Tags, Layers, ImagePlus, ArrowLeft, Sparkles, Info } from 'lucide-react';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Admin Components
import { PageHeader } from '@/src/components/admin/page-header';
import { FormCard, FormField, FormActions, FormErrorBanner, ImageUploadGrid, VariantBuilder } from '@/src/components/admin/form-components';

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
  code: z.string().optional(),
  tags: z.string().optional(),
  inventory: z.coerce.number().min(0, 'Inventory must be 0 or more'),
  inventoryType: z.enum(['PREORDER', 'STOCK']),
  fulfillmentDays: z.coerce.number().min(0, 'Must be 0 or more').optional(),
  isBestPrice: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof productSchema>;

interface VariantSize {
  id: string;
  label: string;
  price?: number;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  inventory: number;
  imageKey?: string;
  isActive: boolean;
  sizes?: VariantSize[];
}

interface UploadedImage {
  key: string;
  isUploading?: boolean;
}

export default function AdminCreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');

  // Convex queries and mutations
  const createProduct = useMutation(api.products.mutations.index.createProduct);
  const uploadFile = useUploadFile(api.files.r2);
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');
  const categories = useQuery(api.categories.queries.index.getCategories, organization?._id ? { organizationId: organization._id } : 'skip');

  // State
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([{ id: 'default', name: 'Default', price: 0, inventory: 0, isActive: true, sizes: [] }]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      code: '',
      tags: '',
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
  }, []);

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

  // Variant image upload
  const handleVariantImageUpload = useCallback(
    async (variantIndex: number, file: File) => {
      try {
        const compressed = await compressToWebP(file);
        const key = await uploadFile(compressed);
        setVariants((prev) => prev.map((v, i) => (i === variantIndex ? { ...v, imageKey: key } : v)));
        return key;
      } catch (err) {
        console.error(err);
        showToast({ type: 'error', title: 'Failed to upload variant image' });
        return '';
      }
    },
    [uploadFile]
  );

  // Form submission
  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    // Validation
    if (uploadedImages.length === 0) {
      setSubmitError('Please upload at least one product image');
      return;
    }

    const validVariants = variants.filter((v) => v.name.trim());
    if (validVariants.length === 0) {
      setSubmitError('Please add at least one variant');
      return;
    }

    if (validVariants.some((v) => v.price <= 0)) {
      setSubmitError('All variants must have a price greater than 0');
      return;
    }

    try {
      await createProduct({
        organizationId: organization?._id,
        title: values.title,
        description: values.description,
        categoryId: values.categoryId ? (values.categoryId as any) : undefined,
        imageUrl: uploadedImages.map((img) => img.key),
        tags: tags,
        isBestPrice: values.isBestPrice,
        code: values.code || undefined,
        inventory: values.inventoryType === 'PREORDER' ? 0 : values.inventory,
        inventoryType: values.inventoryType,
        fulfillmentDays: values.inventoryType === 'PREORDER' ? undefined : values.fulfillmentDays,
        variants: validVariants.map((v) => ({
          variantName: v.name,
          price: v.price,
          inventory: v.inventory,
          imageUrl: v.imageKey,
          isActive: v.isActive,
          sizes:
            v.sizes && v.sizes.length > 0
              ? v.sizes.map((s) => ({
                  id: s.id,
                  label: s.label,
                  price: s.price,
                }))
              : undefined,
        })),
      });

      showToast({ type: 'success', title: 'Product created successfully' });
      router.push(`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`);
    } catch (error) {
      console.error('Failed to create product:', error);
      setSubmitError('Failed to create product. Please check your input and try again.');
    }
  };

  // Loading state
  if (orgSlug && organization === undefined) {
    return (
      <div className="flex items-center justify-center py-12 font-admin-body">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
  }

  // Collect all errors for the banner
  const allErrors: string[] = [];
  if (submitError) allErrors.push(submitError);
  if (errors.title) allErrors.push(`Title: ${errors.title.message}`);
  if (errors.description) allErrors.push(`Description: ${errors.description.message}`);
  if (errors.inventory) allErrors.push(`Inventory: ${errors.inventory.message}`);

  return (
    <div className="font-admin-body">
      <PageHeader
        title="Create Product"
        description="Add a new product to your catalog"
        icon={<Package className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: `/admin/overview${orgSlug ? `?org=${orgSlug}` : ''}` },
          { label: 'Products', href: `/admin/products${orgSlug ? `?org=${orgSlug}` : ''}` },
          { label: 'Create' },
        ]}
        actions={
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Products
            </Link>
          </Button>
        }
      />

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

                <FormField label="Product Code" name="code" hint="Unique code for quick lookup (e.g., via Messenger bot)">
                  <Input id="code" placeholder="e.g., MERCH001" className="h-10 uppercase" {...register('code')} />
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
              description="Define different options like sizes or colors"
              icon={Layers}
              badge={
                <Badge variant="outline" className="text-xs">
                  {variants.length} variant{variants.length !== 1 ? 's' : ''}
                </Badge>
              }
            >
              <VariantBuilder
                variants={variants}
                onChange={setVariants}
                renderVariantImage={(variant, index) => (
                  <div className="relative">
                    {variant.imageKey ? (
                      <R2Image
                        fileKey={variant.imageKey}
                        alt={`${variant.name} image`}
                        width={64}
                        height={64}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <label className="h-8 w-8 rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVariantImageUpload(index, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              />
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
                  <Switch checked={isActive} onCheckedChange={(checked) => setValue('isActive', checked)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Best Price</Label>
                    <p className="text-xs text-muted-foreground">Highlight as a great deal</p>
                  </div>
                  <Switch checked={isBestPrice} onCheckedChange={(checked) => setValue('isBestPrice', checked)} />
                </div>
              </div>
            </FormCard>

            {/* Inventory */}
            <FormCard title="Inventory" icon={Layers} collapsible={false}>
              <div className="space-y-4">
                <FormField label="Inventory Type" name="inventoryType">
                  <Select value={inventoryType} onValueChange={(value) => setValue('inventoryType', value as 'STOCK' | 'PREORDER')}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOCK">
                        <div className="flex items-center gap-2">
                          <span>In Stock</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PREORDER">
                        <div className="flex items-center gap-2">
                          <span>Pre-order</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Total Inventory" name="inventory" error={errors.inventory?.message}>
                  <Input
                    id="inventory"
                    type="number"
                    min={0}
                    className="h-10"
                    disabled={inventoryType === 'PREORDER'}
                    {...register('inventory', { valueAsNumber: true })}
                  />
                  {inventoryType === 'PREORDER' && (
                    <p className="text-xs text-muted-foreground mt-1">Stock tracking is disabled for pre-order items</p>
                  )}
                </FormField>

                <FormField label="Fulfillment Days" name="fulfillmentDays" hint="Days until ready/delivered (leave empty if not applicable)">
                  <Input
                    id="fulfillmentDays"
                    type="number"
                    min={0}
                    placeholder="e.g. 3"
                    className="h-10"
                    disabled={inventoryType === 'PREORDER'}
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
          </div>
        </div>

        {/* Form Actions */}
        <FormActions
          cancelHref={`/admin/products${orgSlug ? `?org=${orgSlug}` : ''}`}
          submitLabel="Create Product"
          isSubmitting={isSubmitting}
          isValid={uploadedImages.length > 0 && variants.some((v) => v.name.trim() && v.price > 0)}
          sticky
        />
      </form>
    </div>
  );
}
