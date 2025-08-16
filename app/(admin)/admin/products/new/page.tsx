"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from 'convex/react'
import { useUploadFile } from '@convex-dev/r2/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { R2Image } from '@/src/components/ui/r2-image'
import { compressToWebP } from '@/lib/compress'
import { UploadCloud, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.array(z.string().url()).optional(),
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
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')
  const createProduct = useMutation(api.products.mutations.index.createProduct)
  const uploadFile = useUploadFile(api.files.r2)

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : 'skip'
  )

  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormValues>({
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



  async function uploadAndAddImages (files: File[]) {
    try {
      const keys = await Promise.all(
        files.map(async (f) => {
          const compressed = await compressToWebP(f)
          return uploadFile(compressed)
        }),
      )
      const newImages = [...uploadedImages, ...keys]
      setUploadedImages(newImages)
      setValue('imageUrl', newImages)
    } catch (err) {
      console.error(err)
      alert('Failed to upload images')
    }
  }

  async function handleUploadImages (e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    await uploadAndAddImages(files)
    e.target.value = ''
  }

  async function handleRemoveImage (key: string) {
    const newImages = uploadedImages.filter((k) => k !== key)
    setUploadedImages(newImages)
    setValue('imageUrl', newImages)
  }

  async function onSubmit (values: FormValues) {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image')
      return
    }
    
    await createProduct({
      organizationId: organization?._id,
      title: values.title,
      description: values.description,
      imageUrl: uploadedImages,
      tags: (values.tags as unknown as string[]) || [],
      isBestPrice: false,
      inventory: values.inventory,
      inventoryType: values.inventoryType,
      variants: values.variants,
    })
    router.push('/admin/products')
  }

  if (orgSlug && organization === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading organization...</div>
        </div>
      </div>
    )
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
              <label className="mb-1 block text-sm font-medium">Product Images</label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {uploadedImages.map((key, idx) => (
                  <div key={key} className="relative group">
                    <R2Image fileKey={key} alt={`Product image ${idx + 1}`} className="h-32 w-full rounded object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
                <label className="h-32 w-full rounded border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                  <div className="text-center">
                    <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div className="text-sm text-muted-foreground mt-1">Add image</div>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleUploadImages} />
                </label>
              </div>
              {uploadedImages.length === 0 && <p className="mt-1 text-xs text-red-500">At least one image is required</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="tags">Tags (comma separated)</label>
              <Input id="tags" placeholder="apparel, stickers" {...register('tags')} />
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
              <Button type="submit" disabled={isSubmitting || uploadedImages.length === 0}>
                {isSubmitting ? 'Creating...' : 'Create product'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}


