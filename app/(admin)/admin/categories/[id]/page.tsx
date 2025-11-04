'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Doc, Id } from '@/convex/_generated/dataModel';

type Category = Doc<'categories'>;

export default function AdminEditCategoryPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const category = useQuery(api.categories.queries.index.getCategoryById, { categoryId: params.id as Id<'categories'> });
  const categoriesRoot = useQuery(api.categories.queries.index.getCategories, { level: 0, limit: 200, offset: 0 });
  const update = useMutation(api.categories.mutations.index.updateCategory);
  const del = useMutation(api.categories.mutations.index.deleteCategory);
  const restore = useMutation(api.categories.mutations.index.restoreCategory);

  const loading = category === undefined;

  const siblings = useMemo(() => {
    const list = categoriesRoot?.categories || [];
    const currentId = category?._id;
    return list.filter((c: Category) => c._id !== currentId);
  }, [categoriesRoot, category]);

  async function handleUpdate(
    fields: Partial<Pick<Category, 'name' | 'description' | 'slug' | 'parentCategoryId' | 'isActive' | 'isFeatured' | 'displayOrder'>>
  ) {
    if (!category) return;
    await update({ categoryId: category._id, ...fields });
  }

  async function handleDelete() {
    if (!category) return;
    await del({ categoryId: category._id });
    router.push('/admin/categories');
  }

  async function handleRestore() {
    if (!category) return;
    await restore({ categoryId: category._id });
  }

  if (loading) return <div className="py-12">Loading...</div>;
  if (!category) return <div className="py-12">Not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit category</h1>
        <div className="flex items-center gap-2">
          {!category.isDeleted ? (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          ) : (
            <Button onClick={handleRestore}>Restore</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">
              Name
            </label>
            <div className="flex gap-2">
              <Input id="name" defaultValue={category.name} onBlur={(e) => handleUpdate({ name: e.target.value })} />
              <Button variant="secondary" onClick={() => handleUpdate({ name: (document.getElementById('name') as HTMLInputElement).value })}>
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="description">
              Description
            </label>
            <div className="flex gap-2">
              <Input
                id="description"
                defaultValue={category.description || ''}
                onBlur={(e) => handleUpdate({ description: e.target.value || undefined })}
              />
              <Button
                variant="secondary"
                onClick={() => handleUpdate({ description: (document.getElementById('description') as HTMLInputElement).value || undefined })}
              >
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="slug">
              Slug
            </label>
            <div className="flex gap-2">
              <Input id="slug" defaultValue={category.slug} onBlur={(e) => handleUpdate({ slug: e.target.value })} />
              <Button variant="secondary" onClick={() => handleUpdate({ slug: (document.getElementById('slug') as HTMLInputElement).value })}>
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="parent">
              Parent
            </label>
            <select
              id="parent"
              defaultValue={category.parentCategoryId || ''}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(e) => handleUpdate({ parentCategoryId: e.target.value ? (e.target.value as Id<'categories'>) : undefined })}
            >
              <option value="">None</option>
              {siblings.map((c: Category) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={category.isActive} onChange={(e) => handleUpdate({ isActive: e.target.checked })} /> Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked={category.isFeatured} onChange={(e) => handleUpdate({ isFeatured: e.target.checked })} /> Featured
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="displayOrder">
              Display order
            </label>
            <div className="flex gap-2">
              <Input
                id="displayOrder"
                type="number"
                defaultValue={category.displayOrder}
                onBlur={(e) => handleUpdate({ displayOrder: Number(e.target.value) })}
              />
              <Button
                variant="secondary"
                onClick={() => handleUpdate({ displayOrder: Number((document.getElementById('displayOrder') as HTMLInputElement).value) })}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
