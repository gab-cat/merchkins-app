"use client"

import React, { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { useUploadFile } from '@convex-dev/r2/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { compressToWebP } from '@/lib/compress'
import { ArrowLeft, ArrowRight, UploadCloud, Trash2 } from 'lucide-react'

export default function AdminEditProductPage () {
  const params = useParams() as { id: string }
  const router = useRouter()
  const product = useQuery(api.products.queries.index.getProductById, { productId: params.id as any })
  const update = useMutation(api.products.mutations.index.updateProduct)
  const del = useMutation(api.products.mutations.index.deleteProduct)
  const restore = useMutation(api.products.mutations.index.restoreProduct)
  const addVariant = useMutation(api.products.mutations.index.addVariant)
  const updateVariant = useMutation(api.products.mutations.index.updateVariant)
  const removeVariant = useMutation(api.products.mutations.index.removeVariant)
  const updateProductImages = useMutation(api.products.mutations.index.updateProductImages)
  const updateVariantImage = useMutation(api.products.mutations.index.updateVariantImage)
  const updateVariantStatus = useMutation(api.products.mutations.index.updateVariantStatus)
  const uploadFile = useUploadFile(api.files.r2)

  const loading = product === undefined
  const [pendingImages, setPendingImages] = useState<string[] | null>(null)
  const imageKeys = (pendingImages ?? product?.imageUrl ?? []) as string[]
  const [newVariant, setNewVariant] = useState<{ name: string; price: string; inventory: string }>({
    name: '',
    price: '',
    inventory: '',
  })
  const [newVariantImageKey, setNewVariantImageKey] = useState<string | undefined>(undefined)

  async function uploadAndAddImages (files: File[]) {
    try {
      const keys = await Promise.all(
        files.map(async (f) => {
          const compressed = await compressToWebP(f)
          return uploadFile(compressed)
        }),
      )
      setPendingImages((prev) => {
        const current = (prev ?? product!.imageUrl) as string[]
        return [...current, ...keys]
      })
    } catch (err) {
      console.error(err)
      alert('Failed to upload images')
    }
  }

  async function handleBasicUpdate (fields: Partial<{ title: string; description: string; inventory: number }>) {
    if (!product) return
    await update({ productId: product._id, ...fields })
  }

  async function handleDelete () {
    if (!product) return
    await del({ productId: product._id })
    router.push('/admin/products')
  }

  async function handleRestore () {
    if (!product) return
    await restore({ productId: product._id })
  }

  if (loading) {
    return <div className="py-12">Loading...</div>
  }

  if (!product) {
    return <div className="py-12">Not found</div>
  }

  async function handleUploadImages (e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    await uploadAndAddImages(files)
    e.target.value = ''
  }

  async function handleRemoveImage (key: string) {
    setPendingImages((prev) => {
      const current = (prev ?? product.imageUrl) as string[]
      return current.filter((k) => k !== key)
    })
  }

  async function handleSaveImages () {
    if (!product) return
    if (!pendingImages) return
    try {
      const toKeep = pendingImages
      const original = product.imageUrl
      const toDelete = original.filter((k) => !toKeep.includes(k))
      await updateProductImages({
        productId: product._id,
        imageUrls: toKeep,
        imagesToDelete: toDelete,
      })
      setPendingImages(null)
    } catch (err) {
      console.error(err)
      alert('Failed to save image changes')
    }
  }

  function moveImage (index: number, direction: 'left' | 'right') {
    setPendingImages((prev) => {
      const current = [...(prev ?? product!.imageUrl)]
      const target = direction === 'left' ? index - 1 : index + 1
      if (target < 0 || target >= current.length) return current
      const tmp = current[target]
      current[target] = current[index]
      current[index] = tmp
      return current
    })
  }

  function handleDropUploadImages (e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return
    uploadAndAddImages(files)
  }

  async function handleUploadVariantImage (
    variantId: string,
    previousKey: string | undefined,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!product) return
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressToWebP(file)
      const key = await uploadFile(compressed)
      await updateVariantImage({
        productId: product._id,
        variantId,
        imageUrl: key,
        previousImageUrl: previousKey,
      })
      e.target.value = ''
    } catch (err) {
      console.error(err)
      alert('Failed to upload variant image')
    }
  }

  async function handleNewVariantImage (e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressToWebP(file)
      const key = await uploadFile(compressed)
      setNewVariantImageKey(key)
      e.target.value = ''
    } catch (err) {
      console.error(err)
      alert('Failed to upload image')
    }
  }

  async function safeUpdateVariant (
    variantId: string,
    fields: Partial<{ variantName: string; price: number; inventory: number }>
  ) {
    if (!product) return
    try {
      await updateVariant({ productId: product._id, variantId, ...fields })
    } catch (err) {
      console.error(err)
      alert('Failed to update variant')
    }
  }

  async function toggleVariantStatus (variantId: string, isActive: boolean) {
    if (!product) return
    try {
      await updateVariantStatus({ productId: product._id, variantId, isActive })
    } catch (err) {
      console.error(err)
      alert('Failed to update variant status')
    }
  }

  async function safeRemoveVariant (variantId: string) {
    if (!product) return
    try {
      await removeVariant({ productId: product._id, variantId })
    } catch (err) {
      console.error(err)
      alert('Failed to remove variant')
    }
  }

  async function handleAddVariant () {
    if (!product) return
    const name = newVariant.name.trim()
    const price = Number(newVariant.price)
    const inventory = Number(newVariant.inventory)
    if (!name || isNaN(price) || isNaN(inventory)) {
      alert('Please provide valid name, price, and inventory')
      return
    }
    try {
      await addVariant({
        productId: product._id,
        variantName: name,
        price,
        inventory,
        imageUrl: newVariantImageKey,
      })
      setNewVariant({ name: '', price: '', inventory: '' })
      setNewVariantImageKey(undefined)
    } catch (err) {
      console.error(err)
      alert('Failed to add variant')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <div className="flex items-center gap-2">
          {!product.isDeleted ? (
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          ) : (
            <Button onClick={handleRestore}>Restore</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropUploadImages}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {imageKeys.map((key, idx) => (
              <div
                key={key}
                className="group relative overflow-hidden rounded border bg-card shadow-modern animate-in fade-in slide-in-from-bottom-2"
              >
                <R2Image imageKey={key} className="h-32 w-full object-cover transition-transform group-hover:scale-[1.02]" />
                <div className="absolute inset-0 hidden items-center justify-between gap-2 bg-black/40 p-2 group-hover:flex">
                  <Button size="icon" variant="secondary" onClick={() => moveImage(idx, 'left')} aria-label="Move left">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveImage(key)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                  <Button size="icon" variant="secondary" onClick={() => moveImage(idx, 'right')} aria-label="Move right">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {imageKeys.length === 0 && (
              <div className="rounded border p-6 text-center text-sm text-muted-foreground">No images yet</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label
              htmlFor="image-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-secondary px-3 py-2 text-sm hover:bg-secondary/80"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload images</span>
              <input id="image-upload" className="hidden" type="file" accept="image/*" multiple onChange={handleUploadImages} />
            </label>
            <Button variant="secondary" onClick={handleSaveImages} disabled={!pendingImages}>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">Title</label>
            <div className="flex gap-2">
              <Input id="title" defaultValue={product.title} onBlur={(e) => handleBasicUpdate({ title: e.target.value })} />
              <Button variant="secondary" onClick={() => handleBasicUpdate({ title: (document.getElementById('title') as HTMLInputElement).value })}>Save</Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="description">Description</label>
            <div className="flex gap-2">
              <Textarea id="description" defaultValue={product.description || ''} autoResize minRows={4} onBlur={(e) => handleBasicUpdate({ description: e.target.value })} />
              <Button variant="secondary" onClick={() => handleBasicUpdate({ description: (document.getElementById('description') as HTMLTextAreaElement).value })}>Save</Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="inventory">Inventory</label>
            <div className="flex gap-2">
              <Input id="inventory" type="number" defaultValue={product.inventory} onBlur={(e) => handleBasicUpdate({ inventory: Number(e.target.value) })} />
              <Button variant="secondary" onClick={() => handleBasicUpdate({ inventory: Number((document.getElementById('inventory') as HTMLInputElement).value) })}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing variants */}
          <div className="space-y-3">
            {(product.variants || []).map((v) => (
              <div key={v.variantId} className="rounded border p-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-48">
                    <label className="mb-1 block text-sm font-medium" htmlFor={`name-${v.variantId}`}>Name</label>
                    <Input id={`name-${v.variantId}`} defaultValue={v.variantName} onBlur={(e) => safeUpdateVariant(v.variantId, { variantName: e.target.value })} />
                  </div>
                  <div className="w-36">
                    <label className="mb-1 block text-sm font-medium" htmlFor={`price-${v.variantId}`}>Price</label>
                    <Input id={`price-${v.variantId}`} type="number" step="0.01" defaultValue={v.price} onBlur={(e) => safeUpdateVariant(v.variantId, { price: Number(e.target.value) })} />
                  </div>
                  <div className="w-36">
                    <label className="mb-1 block text-sm font-medium" htmlFor={`inv-${v.variantId}`}>Inventory</label>
                    <Input id={`inv-${v.variantId}`} type="number" defaultValue={v.inventory} onBlur={(e) => safeUpdateVariant(v.variantId, { inventory: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={v.isActive ? 'secondary' : 'outline'} size="sm" onClick={() => toggleVariantStatus(v.variantId, !v.isActive)}>
                      {v.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => safeRemoveVariant(v.variantId)}>Delete</Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <VariantImage imageKey={v.imageUrl} />
                  <input type="file" accept="image/*" onChange={(e) => handleUploadVariantImage(v.variantId, v.imageUrl, e)} />
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Badge variant="outline">ID: {v.variantId}</Badge>
                  <Badge variant="outline">Orders: {v.orderCount}</Badge>
                  <Badge variant="outline">In carts: {v.inCartCount}</Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Add variant */}
          <div className="rounded border p-4">
            <div className="mb-2 text-sm font-semibold">Add variant</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <Input placeholder="Name" value={newVariant.name} onChange={(e) => setNewVariant((s) => ({ ...s, name: e.target.value }))} />
              <Input type="number" step="0.01" placeholder="Price" value={newVariant.price} onChange={(e) => setNewVariant((s) => ({ ...s, price: e.target.value }))} />
              <Input type="number" placeholder="Inventory" value={newVariant.inventory} onChange={(e) => setNewVariant((s) => ({ ...s, inventory: e.target.value }))} />
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleNewVariantImage} />
                {newVariantImageKey ? <VariantImage imageKey={newVariantImageKey} /> : null}
              </div>
              <Button onClick={handleAddVariant}>Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function R2Image ({ imageKey, className }: { imageKey: string; className?: string }) {
  const url = useQuery(api.files.queries.index.getFileUrl, imageKey ? { key: imageKey } : 'skip' as any)
  if (!url) {
    return <div className={['bg-secondary', className].filter(Boolean).join(' ')} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Product image" className={className} />
}

function VariantImage ({ imageKey }: { imageKey?: string }) {
  const url = useQuery(api.files.queries.index.getFileUrl, imageKey ? { key: imageKey } : 'skip' as any)
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="Variant" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-secondary" />
}


