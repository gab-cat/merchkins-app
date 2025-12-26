'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { useUploadFile } from '@convex-dev/r2/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { compressToWebP } from '@/lib/compress';
import { R2Image } from '@/src/components/ui/r2-image';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { StatusBadge } from '@/src/components/admin/status-badge';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

// Icons
import {
  FolderTree,
  ArrowLeft,
  Save,
  RefreshCw,
  Trash2,
  RotateCcw,
  Tag,
  FileText,
  Link2,
  Layers,
  Star,
  Hash,
  Info,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Calendar,
  Clock,
  ImagePlus,
  Upload,
  Loader2,
} from 'lucide-react';

type Category = Doc<'categories'>;

// Form field wrapper component
function FormField({
  label,
  hint,
  icon: Icon,
  children,
  action,
}: {
  label: string;
  hint?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <Label className="text-sm font-medium">{label}</Label>
        </div>
        {action}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Info row component
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// Loading skeleton
function CategoryEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminEditCategoryPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const categoryId = params.id as Id<'categories'>;

  // Queries
  const category = useQuery(api.categories.queries.index.getCategoryById, { categoryId });
  const categoriesRoot = useQuery(
    api.categories.queries.index.getCategories,
    category?.organizationId ? { organizationId: category.organizationId, level: 0, limit: 200, offset: 0 } : { level: 0, limit: 200, offset: 0 }
  );

  // Mutations
  const updateCategory = useMutation(api.categories.mutations.index.updateCategory);
  const deleteCategory = useMutation(api.categories.mutations.index.deleteCategory);
  const restoreCategory = useMutation(api.categories.mutations.index.restoreCategory);
  const uploadFile = useUploadFile(api.files.r2);

  // Local state for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values when category loads
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setSlug(category.slug);
      setParentCategoryId(category.parentCategoryId || '');
      setIsActive(category.isActive);
      setIsFeatured(category.isFeatured || false);
      setDisplayOrder(category.displayOrder || 0);
      setImageKey(category.imageUrl || null);
    }
  }, [category]);

  // Track changes
  useEffect(() => {
    if (category) {
      const changed =
        name !== category.name ||
        description !== (category.description || '') ||
        slug !== category.slug ||
        parentCategoryId !== (category.parentCategoryId || '') ||
        isActive !== category.isActive ||
        isFeatured !== (category.isFeatured || false) ||
        displayOrder !== (category.displayOrder || 0) ||
        imageKey !== (category.imageUrl || null);
      setHasChanges(changed);
    }
  }, [category, name, description, slug, parentCategoryId, isActive, isFeatured, displayOrder, imageKey]);

  const loading = category === undefined;

  // Filter out current category from parent options
  const siblings = useMemo(() => {
    const list = categoriesRoot?.categories || [];
    return list.filter((c: Category) => c._id !== categoryId);
  }, [categoriesRoot, categoryId]);

  // Image upload handler
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const compressed = await compressToWebP(file);
        const key = await uploadFile(compressed);
        setImageKey(key);
      } catch (err) {
        showToast({ type: 'error', title: 'Failed to upload image' });
      } finally {
        setIsUploading(false);
      }
      e.target.value = '';
    },
    [uploadFile]
  );

  // Remove image handler
  const handleRemoveImage = useCallback(() => {
    setImageKey(null);
  }, []);

  // Save all changes
  async function handleSave() {
    if (!category || isSaving) return;
    setIsSaving(true);
    try {
      await updateCategory({
        categoryId: category._id,
        name,
        description: description || undefined,
        slug,
        parentCategoryId: parentCategoryId ? (parentCategoryId as Id<'categories'>) : undefined,
        imageUrl: imageKey || '',
        isActive,
        isFeatured,
        displayOrder,
      });
      showToast({ type: 'success', title: 'Category updated' });
      setHasChanges(false);
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update category' });
    } finally {
      setIsSaving(false);
    }
  }

  // Delete category
  async function handleDelete() {
    if (!category) return;
    try {
      await deleteCategory({ categoryId: category._id });
      showToast({ type: 'success', title: 'Category deleted' });
      router.push('/admin/categories');
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to delete category' });
    }
  }

  // Restore category
  async function handleRestore() {
    if (!category) return;
    try {
      await restoreCategory({ categoryId: category._id });
      showToast({ type: 'success', title: 'Category restored' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to restore category' });
    }
  }

  if (loading) {
    return <CategoryEditSkeleton />;
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Category Not Found</h2>
        <p className="text-muted-foreground mb-4">The category you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={category.name}
        description={`Edit category details`}
        icon={<FolderTree className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Categories', href: '/admin/categories' }, { label: category.name }]}
        actions={
          <div className="flex items-center gap-2">
            {category.isDeleted ? <StatusBadge status="Deleted" type="error" /> : <StatusBadge status={isActive ? 'Active' : 'Inactive'} />}
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {/* Deleted Warning Banner */}
      {category.isDeleted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">This category has been deleted</p>
              <p className="text-sm text-muted-foreground">Restore it to make it visible again</p>
            </div>
          </div>
          <Button onClick={handleRestore} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Category
          </Button>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Category Name" icon={Tag}>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
                </FormField>

                <FormField label="Description" icon={FileText}>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description..." rows={3} />
                </FormField>

                <FormField label="Slug" icon={Link2} hint="URL-friendly identifier">
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="category-slug" />
                </FormField>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Image */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImagePlus className="h-4 w-4" />
                  Category Image
                </CardTitle>
                <CardDescription>Optional image to represent this category</CardDescription>
              </CardHeader>
              <CardContent>
                {imageKey ? (
                  <div className="relative group aspect-video max-w-xs rounded-lg overflow-hidden border">
                    <R2Image fileKey={imageKey} alt="Category image" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="sm" onClick={handleRemoveImage}>
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={cn(
                      'aspect-video max-w-xs rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all',
                      isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-muted-foreground/50 hover:bg-muted/50'
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click or drop to upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hierarchy & Display */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4" />
                  Hierarchy & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Parent Category">
                    <Select value={parentCategoryId || '__none__'} onValueChange={(value) => setParentCategoryId(value === '__none__' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="None (Root category)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None (Root category)</SelectItem>
                        {siblings.map((c: Category) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Display Order" icon={Hash}>
                    <Input type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
                  </FormField>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {isActive ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <Label className="text-sm font-medium">Active</Label>
                        <p className="text-xs text-muted-foreground">Visible to customers</p>
                      </div>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Star className={cn('h-4 w-4', isFeatured ? 'text-amber-500' : 'text-muted-foreground')} />
                      <div>
                        <Label className="text-sm font-medium">Featured</Label>
                        <p className="text-xs text-muted-foreground">Show in highlights</p>
                      </div>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-6">
          {/* Info Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow icon={Calendar} label="Created" value={new Date(category.createdAt).toLocaleDateString()} />
                <InfoRow icon={Clock} label="Updated" value={new Date(category.updatedAt).toLocaleDateString()} />
                <InfoRow icon={Layers} label="Level" value={category.level} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={handleSave} disabled={isSaving || !hasChanges}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : hasChanges ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      No Changes
                    </>
                  )}
                </Button>

                {!category.isDeleted && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will soft delete the category. You can restore it later if needed. Products in this category will not be affected.
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
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
