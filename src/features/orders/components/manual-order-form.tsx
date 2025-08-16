'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { showToast } from '@/lib/toast'

type ConvexUser = {
  _id: Id<'users'>
  firstName?: string
  lastName?: string
  email: string
  imageUrl?: string
}

type ConvexVariant = {
  variantId: string
  variantName: string
  price: number
  inventory: number
  isActive: boolean
}

type ConvexProduct = {
  _id: Id<'products'>
  title: string
  slug: string
  imageUrl: Array<string>
  variants: Array<ConvexVariant>
  minPrice?: number
  maxPrice?: number
  supposedPrice?: number
  organizationInfo?: { name: string }
}

const lineItemSchema = z.object({
  quantity: z
    .union([z.number(), z.string().regex(/^\d+$/)])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .refine((v) => v >= 1, 'Qty must be at least 1'),
  variantId: z.string().optional(),
  price: z
    .union([
      z.number(),
      z
        .string()
        .regex(/^\d+(?:[.,]\d+)?$/, 'Invalid amount')
        .transform((v) => Number(v.replace(',', '.'))),
    ])
    .optional()
    .nullable()
    .transform((v) => (v === null ? undefined : v)),
  customerNote: z.string().optional(),
})

const schema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  paymentPreference: z.enum(['FULL', 'DOWNPAYMENT']).optional(),
  customerNotes: z.string().optional(),
  items: z
    .array(lineItemSchema)
    .min(1, 'Add at least one item'),
})

type FormValues = z.infer<typeof schema>

export function ManualOrderForm () {
  const router = useRouter()
  const createOrder = useMutation(api.orders.mutations.index.createOrder)

  // Customer search
  const [customerQuery, setCustomerQuery] = useState('')
  const debouncedCustomer = useDebounced(customerQuery, 250)
  const userResults = useQuery(
    api.users.queries.index.searchUsers,
    debouncedCustomer.length >= 2
      ? { searchTerm: debouncedCustomer, limit: 10 }
      : ('skip' as unknown as { searchTerm: string }),
  ) as Array<ConvexUser> | undefined
  const [selectedCustomer, setSelectedCustomer] = useState<ConvexUser | null>(
    null,
  )

  // Field array for items; we keep product selection outside the form values
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: '',
      paymentPreference: 'FULL',
      customerNotes: '',
      items: [],
    },
  })

  const { control, handleSubmit, formState, setValue, watch } = form
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  })

  // Map of index -> selected product
  const [selectedProducts, setSelectedProducts] = useState<Record<number, ConvexProduct | null>>({})

  // Product search state per-row
  const [productQueries, setProductQueries] = useState<Record<number, string>>({})
  const debouncedProductQueries = useDebouncedRecord(productQueries, 250)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const activeQuery = (activeIdx !== null ? (debouncedProductQueries[activeIdx] || '') : '').trim()
  const productSearch = useQuery(
    api.products.queries.index.searchProducts,
    activeQuery.length >= 2
      ? { query: activeQuery, limit: 20 }
      : ('skip' as unknown as { query: string }),
  ) as { products?: Array<ConvexProduct> } | undefined
  const productResultsMap: Record<number, Array<ConvexProduct>> = useMemo(() => {
    const map: Record<number, Array<ConvexProduct>> = {}
    if (activeIdx !== null) {
      map[activeIdx] = (productSearch?.products ?? []) as Array<ConvexProduct>
    }
    return map
  }, [activeIdx, productSearch])

  function addLineItem () {
    append({ quantity: 1, variantId: undefined, price: undefined, customerNote: '' })
  }

  function onSelectCustomer (u: ConvexUser) {
    setSelectedCustomer(u)
    setValue('customerId', String(u._id))
  }

  function onSelectProduct (idx: number, p: ConvexProduct) {
    setSelectedProducts((prev) => ({ ...prev, [idx]: p }))
    update(idx, { ...fields[idx], variantId: p.variants?.[0]?.variantId })
    setProductQueries((prev) => ({ ...prev, [idx]: p.title }))
  }

  const computedTotal = useMemo(() => {
    let total = 0
    fields.forEach((f, idx) => {
      const prod = selectedProducts[idx]
      if (!prod) return
      const variant = prod.variants?.find((v) => v.variantId === f.variantId)
      const base = (f.price ?? (variant ? variant.price : (prod.minPrice ?? prod.maxPrice ?? prod.supposedPrice ?? 0))) as number
      total += base * Number(f.quantity || 0)
    })
    return total
  }, [fields, selectedProducts])

  async function onSubmit (values: FormValues) {
    if (!selectedCustomer) {
      showToast({ type: 'error', title: 'Select a customer' })
      return
    }
    // Build items payload
    const itemsPayload = values.items.map((it, idx) => {
      const p = selectedProducts[idx]
      if (!p) throw new Error('Each item must have a product')
      return {
        productId: p._id as Id<'products'>,
        variantId: it.variantId || undefined,
        quantity: Number(it.quantity),
        price: it.price ? Number(it.price) : undefined,
        customerNote: it.customerNote || undefined,
      }
    })

    try {
      const orderId = await createOrder({
        customerId: selectedCustomer._id as Id<'users'>,
        items: itemsPayload,
        paymentPreference: values.paymentPreference,
        customerNotes: values.customerNotes || undefined,
      })
      showToast({ type: 'success', title: 'Order created' })
      router.push(`/admin/orders/${orderId}`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      showToast({ type: 'error', title: errorMessage })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Order</h1>
          <p className="text-sm text-muted-foreground">
            Manually create an order on behalf of a customer
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Input
              placeholder="Search by name or email"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
            />
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="min-w-0 truncate text-sm">
                  <span className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                  <span className="ml-2 text-muted-foreground">{selectedCustomer.email}</span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedCustomer(null); setValue('customerId', '') }}>
                  Change
                </Button>
              </div>
            ) : (
              customerQuery.length >= 2 && (
                <div className="rounded-md border">
                  <ScrollArea className="max-h-56">
                    {(userResults || []).map((u) => (
                      <button
                        key={String(u._id)}
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-secondary"
                        onClick={() => onSelectCustomer(u)}
                      >
                        <span className="text-sm">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </button>
                    ))}
                    {userResults && userResults.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
                    )}
                  </ScrollArea>
                </div>
              )
            )}
            {formState.errors.customerId && (
              <div className="text-xs text-destructive">{formState.errors.customerId.message as string}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, idx) => {
              const product = selectedProducts[idx]
              const productQuery = productQueries[idx] || ''
              const productResults = productResultsMap[idx] || []
              const variants = product?.variants?.filter((v) => v.isActive) || []
              return (
                <div key={field.id} className="rounded-md border p-3">
                  <div className="grid gap-3 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs text-muted-foreground">Product</label>
                      <div className="relative">
                        <Input
                        placeholder="Search product..."
                        value={productQuery}
                          onChange={(e) => setProductQueries((prev) => ({ ...prev, [idx]: e.target.value }))}
                          onFocus={() => setActiveIdx(idx)}
                        />
                        {!product && (productQuery.length >= 2) && activeIdx === idx && (
                          <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-sm">
                            <ScrollArea className="max-h-64">
                              {productSearch === undefined && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
                              )}
                              {productSearch !== undefined && productResults.map((p) => (
                                <button
                                  key={String(p._id)}
                                  type="button"
                                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-secondary"
                                  onClick={() => onSelectProduct(idx, p)}
                                >
                                  <div className="min-w-0 truncate pr-2 text-sm">
                                    <div className="truncate">{p.title}</div>
                                    {p.organizationInfo?.name && (
                                      <div className="truncate text-xs text-muted-foreground">{p.organizationInfo.name}</div>
                                    )}
                                  </div>
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {(p.minPrice ?? p.maxPrice ?? p.supposedPrice ?? 0).toFixed(2)}
                                  </span>
                                </button>
                              ))}
                              {productSearch !== undefined && productResults.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">No products</div>
                              )}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Variant</label>
                      {variants.length > 0 ? (
                        <Select
                          value={String(watch(`items.${idx}.variantId`) || '')}
                          onValueChange={(v) => form.setValue(`items.${idx}.variantId`, v || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {variants.map((v) => (
                              <SelectItem key={v.variantId} value={v.variantId}>
                                {v.variantName} · {v.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-muted-foreground pt-2">—</div>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Qty</label>
                      <Input
                        type="number"
                        min={1}
                        {...form.register(`items.${idx}.quantity` as const)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Price override</label>
                      <Input
                        placeholder="Optional"
                        {...form.register(`items.${idx}.price` as const)}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right text-sm">
                    <span className="text-muted-foreground">Row total:</span>{' '}
                    <span className="font-medium">
                      {formatCurrency(((product?.variants?.find((v) => v.variantId === watch(`items.${idx}.variantId`))?.price ?? (product?.minPrice ?? product?.maxPrice ?? product?.supposedPrice ?? 0)) as number) * Number(watch(`items.${idx}.quantity`) || 0))}
                    </span>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-muted-foreground">Note (optional)</label>
                    <Input
                      placeholder="Special instructions"
                      {...form.register(`items.${idx}.customerNote` as const)}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {product ? 'Selected: ' + product.title : 'No product selected'}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(idx)}>Remove</Button>
                  </div>
                </div>
              )
            })}
          </div>

          {formState.errors.items && (
            <div className="text-xs text-destructive">{formState.errors.items.message as string}</div>
          )}

          <Button type="button" variant="secondary" onClick={addLineItem}>Add item</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Payment preference</label>
              <Select
                value={watch('paymentPreference') || 'FULL'}
                onValueChange={(v) => setValue('paymentPreference', v as FormValues['paymentPreference'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full payment</SelectItem>
                  <SelectItem value="DOWNPAYMENT">Downpayment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Customer notes</label>
              <Input placeholder="Notes to include" {...form.register('customerNotes')} />
            </div>
          </div>

          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Estimated total</div>
            <div className="text-lg font-semibold">{formatCurrency(computedTotal)}</div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSubmit(onSubmit)} disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Creating...' : 'Create order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatCurrency (amount: number) {
  return `₱${(amount || 0).toFixed(2)}`
}

function useDebounced (value: string, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

function useDebouncedRecord (values: Record<number, string>, ms: number) {
  const [state, setState] = useState(values)
  const ref = useRef(values)
  useEffect(() => {
    ref.current = values
    const id = setTimeout(() => setState(ref.current), ms)
    return () => clearTimeout(id)
  }, [values, ms])
  return state
}

export default ManualOrderForm


