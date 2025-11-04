'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  slug: z.string().optional(),
  parentCategoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminCreateCategoryPage() {
  const router = useRouter();
  const createCategory = useMutation(api.categories.mutations.index.createCategory);
  const categoriesRoot = useQuery(api.categories.queries.index.getCategories, { level: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      parentCategoryId: undefined,
      isFeatured: false,
      displayOrder: 0,
    },
  });

  async function onSubmit(values: FormValues) {
    await createCategory({
      name: values.name,
      description: values.description || undefined,
      slug: values.slug || undefined,
      parentCategoryId: values.parentCategoryId ? (values.parentCategoryId as Id<'categories'>) : undefined,
      isFeatured: values.isFeatured,
      displayOrder: values.displayOrder,
    });
    router.push('/admin/categories');
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create category</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="name">
                Name
              </label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Input id="description" {...register('description')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="slug">
                Slug (optional)
              </label>
              <Input id="slug" placeholder="auto-generated if empty" {...register('slug')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hierarchy & Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="parent">
                Parent category
              </label>
              <select id="parent" className="h-9 w-full rounded-md border bg-background px-3 text-sm" {...register('parentCategoryId')}>
                <option value="">None</option>
                {(categoriesRoot?.categories || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register('isFeatured')} /> Featured
              </label>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="displayOrder">
                  Display order
                </label>
                <Input id="displayOrder" type="number" min={0} {...register('displayOrder', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create category'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
