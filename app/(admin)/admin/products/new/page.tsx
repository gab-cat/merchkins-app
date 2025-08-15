"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().array().min(1),
  tags: z.string().transform(v => v.split(',').map(s => s.trim()).filter(Boolean)).optional(),
  inventory: z.coerce.number().min(0),
  inventoryType: z.enum(['PREORDER', 'STOCK']),
  variants: z.array(z.object({
    variantName: z.string().min(1),
    price: z.coerce.number().min(0.01),
    inventory: z.coerce.number().min(0),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  })).min(1),
})

type FormValues = z.infer<typeof schema>

export default function AdminCreateProductPage () {
  const router = useRouter()
  const createProduct = useMutation(api.products.mutations.index.createProduct)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: [],
      tags: undefined,
      inventory: 0,
      inventoryType: 'STOCK',
      variants: [
        { variantName: 'Default', price: 0.01, inventory: 0, imageUrl: undefined, isActive: true },
      ],
    },
  })

  async function onSubmit (values: FormValues) {
    await createProduct({
      title: values.title,
      description: values.description,
      imageUrl: values.imageUrl,
      tags: (values.tags as unknown as string[]) || [],
      isBestPrice: false,
      inventory: values.inventory,
      inventoryType: values.inventoryType,
      variants: values.variants,
    })
    router.push('/admin/products')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="title">Title</label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="description">Description</label>
              <Textarea id="description" autoResize minRows={4} {...register('description')} />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="imageUrl">Image URLs (comma separated)</label>
              <Input id="imageUrl" placeholder="https://... , https://..." {...register('imageUrl', {
                setValueAs: (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean),
              })} />
              {errors.imageUrl && <p className="mt-1 text-xs text-red-500">At least one valid URL</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="tags">Tags (comma separated)</label>
              <Input id="tags" placeholder="apparel, stickers" {...register('tags' as any)} />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle>Inventory & Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="inventory">Inventory</label>
                <Input id="inventory" type="number" min={0} {...register('inventory', { valueAsNumber: true })} />
                {errors.inventory && <p className="mt-1 text-xs text-red-500">{errors.inventory.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="inventoryType">Inventory Type</label>
                <select id="inventoryType" className="h-9 w-full rounded-md border bg-background px-3 text-sm" {...register('inventoryType')}>
                  <option value="STOCK">Stock</option>
                  <option value="PREORDER">Preorder</option>
                </select>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-3 text-sm font-medium">Variant 1</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="variantName-0">Name</label>
                  <Input id="variantName-0" {...register('variants.0.variantName')} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="variantPrice-0">Price</label>
                  <Input id="variantPrice-0" type="number" step="0.01" min={0.01} {...register('variants.0.price', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="variantInventory-0">Inventory</label>
                  <Input id="variantInventory-0" type="number" min={0} {...register('variants.0.inventory', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="variantImage-0">Image URL</label>
                  <Input id="variantImage-0" placeholder="https://..." {...register('variants.0.imageUrl')} />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create product'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}


