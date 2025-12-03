'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  FolderTree,
  ArrowLeft,
  Save,
  RefreshCw,
  Tag,
  FileText,
  Link2,
  Layers,
  Star,
  Hash,
  Info,
} from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  slug: z.string().optional(),
  parentCategoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

// Form field wrapper component
function FormField({
  label,
  hint,
  error,
  icon: Icon,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export default function AdminCreateCategoryPage() {
  const router = useRouter();
  const createCategory = useMutation(api.categories.mutations.index.createCategory);
  const categoriesRoot = useQuery(api.categories.queries.index.getCategories, { level: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentCategoryId: '',
      isFeatured: false,
      displayOrder: 0,
    },
  });

  const isFeatured = watch('isFeatured');
  const parentCategoryId = watch('parentCategoryId');

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await createCategory({
        name: values.name,
        description: values.description || undefined,
        slug: values.slug || undefined,
        parentCategoryId: values.parentCategoryId ? (values.parentCategoryId as Id<'categories'>) : undefined,
        isFeatured: values.isFeatured,
        displayOrder: values.displayOrder,
      });
      showToast({ type: 'success', title: 'Category created successfully' });
      router.push('/admin/categories');
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to create category' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const categories = categoriesRoot?.categories || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Create Category"
        description="Add a new product category to organize your inventory"
        icon={<FolderTree className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Categories', href: '/admin/categories' },
          { label: 'New Category' },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Enter the essential details for this category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    label="Category Name"
                    icon={Tag}
                    error={errors.name?.message}
                    required
                  >
                    <Input
                      {...register('name')}
                      placeholder="e.g., T-Shirts, Accessories"
                      className={cn(errors.name && 'border-destructive')}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    icon={FileText}
                    hint="Optional description for this category"
                  >
                    <Textarea
                      {...register('description')}
                      placeholder="Describe what products belong in this category..."
                      rows={3}
                    />
                  </FormField>

                  <FormField
                    label="Slug"
                    icon={Link2}
                    hint="URL-friendly identifier (auto-generated if empty)"
                  >
                    <Input
                      {...register('slug')}
                      placeholder="e.g., t-shirts"
                    />
                  </FormField>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-4 w-4" />
                    Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    label="Parent Category"
                    hint="Select a parent for nested categories"
                  >
                    <Select
                      value={parentCategoryId ? parentCategoryId : '__none__'}
                      onValueChange={(value) => {
                        // Convert "__none__" back to empty string for form
                        setValue('parentCategoryId', value === '__none__' ? '' : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (Root category)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None (Root category)</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label="Display Order"
                    icon={Hash}
                    hint="Lower numbers appear first"
                  >
                    <Input
                      type="number"
                      min={0}
                      {...register('displayOrder', { valueAsNumber: true })}
                    />
                  </FormField>
                </CardContent>
              </Card>
            </motion.div>

            {/* Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="h-4 w-4" />
                    Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Featured Category</Label>
                      <p className="text-xs text-muted-foreground">
                        Show in featured sections
                      </p>
                    </div>
                    <Switch
                      checked={isFeatured}
                      onCheckedChange={(checked) => setValue('isFeatured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}
